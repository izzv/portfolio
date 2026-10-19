import type { Collection } from "mongodb";
import { getDb } from "./mongodb";

/**
 * One document per device, keyed by the client's fingerprint. Counting is a
 * `countDocuments()` and a repeat visit is a single atomic `$inc`, so two
 * requests landing at once can no longer lose a count the way the old
 * read-modify-write JSON file could.
 *
 * The counter has always reported devices, not page loads: a known device
 * bumps `hits` but not the displayed total.
 */

type DeviceDoc = {
    _id: string;
    firstSeen: number;
    lastSeen: number;
    hits: number;
    ua?: string;
    ip?: string;
};

const COLLECTION = "devices";

async function collection(): Promise<Collection<DeviceDoc>> {
    return (await getDb()).collection<DeviceDoc>(COLLECTION);
}

export async function getViews(): Promise<{
    total: number;
    uniqueDevices: number;
}> {
    const total = await (await collection()).countDocuments();
    return { total, uniqueDevices: total };
}

export async function recordView(
    deviceId: string,
    meta: { ua?: string; ip?: string },
): Promise<{ total: number; unique: boolean; uniqueDevices: number }> {
    const devices = await collection();
    const now = Date.now();

    const seen: Partial<DeviceDoc> = { lastSeen: now };
    if (meta.ua) seen.ua = meta.ua;
    if (meta.ip) seen.ip = meta.ip;

    const result = await devices.updateOne(
        { _id: deviceId },
        {
            $set: seen,
            $setOnInsert: { firstSeen: now },
            $inc: { hits: 1 },
        },
        { upsert: true },
    );

    const total = await devices.countDocuments();
    return {
        total,
        unique: result.upsertedCount === 1,
        uniqueDevices: total,
    };
}
