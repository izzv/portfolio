import { promises as fs } from "fs";
import path from "path";
import { decryptJSON, encryptJSON } from "./crypto";

const FILE = path.join(process.cwd(), "viewscount.enc");

type Device = {
    firstSeen: number;
    lastSeen: number;
    hits: number;
    ua?: string;
    ip?: string;
};

type Store = {
    total: number;
    devices: Record<string, Device>;
};

let memory: Store | null = null;
let writeChain: Promise<void> = Promise.resolve();

async function load(): Promise<Store> {
    if (memory) return memory;
    try {
        const raw = await fs.readFile(FILE, "utf8");
        const parsed = decryptJSON<Partial<Store>>(raw);
        memory = {
            total:
                parsed && typeof parsed.total === "number" ? parsed.total : 0,
            devices:
                parsed && parsed.devices && typeof parsed.devices === "object"
                    ? parsed.devices
                    : {},
        };
    } catch {
        memory = { total: 0, devices: {} };
    }
    return memory;
}

function persist(store: Store): Promise<void> {
    writeChain = writeChain.then(async () => {
        try {
            await fs.writeFile(FILE, encryptJSON(store), "utf8");
        } catch {}
    });
    return writeChain;
}

export async function getViews(): Promise<{
    total: number;
    uniqueDevices: number;
}> {
    const store = await load();
    return {
        total: store.total,
        uniqueDevices: Object.keys(store.devices).length,
    };
}

export async function recordView(
    deviceId: string,
    meta: { ua?: string; ip?: string },
): Promise<{ total: number; unique: boolean; uniqueDevices: number }> {
    const store = await load();
    const now = Date.now();
    const existing = store.devices[deviceId];
    let unique = false;

    if (existing) {
        existing.lastSeen = now;
        existing.hits += 1;
        if (meta.ua) existing.ua = meta.ua;
        if (meta.ip) existing.ip = meta.ip;
    } else {
        unique = true;
        store.total += 1;
        store.devices[deviceId] = {
            firstSeen: now,
            lastSeen: now,
            hits: 1,
            ua: meta.ua,
            ip: meta.ip,
        };
    }

    await persist(store);
    return {
        total: store.total,
        unique,
        uniqueDevices: Object.keys(store.devices).length,
    };
}
