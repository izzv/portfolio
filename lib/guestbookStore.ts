import type { Collection } from "mongodb";
import { getDb, errorMessage, mongoConfigured } from "./mongodb";
import { normalizeGuestbook, type GuestEntry } from "./guestbook";
import { log } from "./logger";

/**
 * The guestbook lives in MongoDB — one document holding the ordered array.
 * Entries are newest-first and capped at 300, so the whole list is the unit the
 * admin edits; keeping it in one document makes approve/delete atomic.
 *
 * Unreachable database: reads return an empty guestbook, writes throw so a
 * submission is never silently lost.
 */

export type GuestbookMode = "mongodb" | "unavailable";

type GuestbookDoc = {
    _id: string;
    entries: GuestEntry[];
    updatedAt: Date;
};

const COLLECTION = "guestbook";
const DOC_ID = "list";

let mode: GuestbookMode = mongoConfigured() ? "mongodb" : "unavailable";
let writeChain: Promise<unknown> = Promise.resolve();

async function collection(): Promise<Collection<GuestbookDoc>> {
    return (await getDb()).collection<GuestbookDoc>(COLLECTION);
}

async function read(): Promise<GuestEntry[]> {
    const doc = await (await collection()).findOne({ _id: DOC_ID });
    return doc ? normalizeGuestbook(doc.entries) : [];
}

export async function getGuestbook(): Promise<GuestEntry[]> {
    if (mongoConfigured()) {
        try {
            const entries = await read();
            mode = "mongodb";
            return entries;
        } catch (e: unknown) {
            mode = "unavailable";
            log("error", "guestbook", "mongo read failed, serving empty", {
                error: errorMessage(e),
            });
        }
    }
    return [];
}

export async function saveGuestbook(input: unknown): Promise<GuestEntry[]> {
    const entries = normalizeGuestbook(input);
    const book = await collection();
    await book.updateOne(
        { _id: DOC_ID },
        { $set: { entries, updatedAt: new Date() } },
        { upsert: true },
    );
    mode = "mongodb";
    return entries;
}

/**
 * Serialise read-modify-write cycles inside the instance so two people signing
 * at once cannot overwrite each other. (Across instances the last write wins —
 * acceptable for a guestbook whose every write is already an explicit list.)
 */
export async function updateGuestbook(
    mutate: (entries: GuestEntry[]) => GuestEntry[],
): Promise<GuestEntry[]> {
    // Read straight from the database, not through `getGuestbook`: its
    // read-failure fallback returns an empty list, and appending to that would
    // wipe the real entries on a transient blip.
    const run = async () => {
        const entries = await read();
        return saveGuestbook(mutate(entries));
    };
    const next = writeChain.then(run, run);
    writeChain = next.catch(() => {});
    return next;
}

export function guestbookMode(): GuestbookMode {
    return mode;
}

export function guestbookWarning(
    current: GuestbookMode = mode,
): string | null {
    if (current !== "unavailable") return null;
    return "MongoDB is not reachable, so the guestbook is empty and new notes cannot be saved. set MONGODB_URI (and optionally MONGODB_DB) in the environment, then reload.";
}
