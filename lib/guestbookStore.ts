import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { normalizeGuestbook, type GuestEntry } from "./guestbook";

/**
 * Where the guestbook lives — same three modes as the other stores:
 * `blob` on Vercel, `file` on a writable host, `temporary` when the disk is
 * read-only (saves survive the process, not a redeploy).
 */

const FILE = path.join(process.cwd(), "guestbook.json");
const TMP_FILE = path.join(os.tmpdir(), "ryan-guestbook.json");
const BLOB_NAME = "guestbook.json";
const MEMORY_TTL_MS = 5_000;

export type GuestbookMode = "blob" | "file" | "temporary";

const blobToken = () => process.env.BLOB_READ_WRITE_TOKEN || "";
const hasBlob = () => !!blobToken();

let mode: GuestbookMode = "file";
let memory: { at: number; entries: GuestEntry[] } | null = null;
let writeChain: Promise<unknown> = Promise.resolve();

async function readJson(file: string): Promise<GuestEntry[] | null> {
    try {
        return normalizeGuestbook(JSON.parse(await fs.readFile(file, "utf8")));
    } catch {
        return null;
    }
}

async function writeAtomic(file: string, entries: GuestEntry[]): Promise<void> {
    const tmp = `${file}.${process.pid}.tmp`;
    try {
        await fs.writeFile(
            tmp,
            `${JSON.stringify(entries, null, 4)}\n`,
            "utf8",
        );
        await fs.rename(tmp, file);
    } catch (e) {
        await fs.unlink(tmp).catch(() => {});
        throw e;
    }
}

async function readBlob(): Promise<GuestEntry[] | null> {
    const { list } = await import("@vercel/blob");
    const { blobs } = await list({
        prefix: BLOB_NAME,
        limit: 1,
        token: blobToken(),
    });
    const blob = blobs.find((b) => b.pathname === BLOB_NAME) ?? blobs[0];
    if (!blob) return null;
    const res = await fetch(`${blob.url}?v=${Date.now()}`, {
        cache: "no-store",
    });
    if (!res.ok) return null;
    return normalizeGuestbook(await res.json());
}

async function writeBlob(entries: GuestEntry[]): Promise<void> {
    const { put } = await import("@vercel/blob");
    await put(BLOB_NAME, `${JSON.stringify(entries, null, 4)}\n`, {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/json",
        cacheControlMaxAge: 30,
        token: blobToken(),
    });
}

export async function getGuestbook(): Promise<GuestEntry[]> {
    if (memory && Date.now() - memory.at < MEMORY_TTL_MS)
        return memory.entries;

    if (hasBlob()) {
        try {
            const remote = await readBlob();
            if (remote) {
                mode = "blob";
                memory = { at: Date.now(), entries: remote };
                return remote;
            }
            const seed =
                (await readJson(TMP_FILE)) ?? (await readJson(FILE)) ?? [];
            memory = { at: Date.now(), entries: seed };
            return seed;
        } catch {
            // Blob unreachable — still show the local copy.
        }
    }

    const tmp = await readJson(TMP_FILE);
    if (tmp) {
        mode = "temporary";
        memory = { at: Date.now(), entries: tmp };
        return tmp;
    }

    return (await readJson(FILE)) ?? [];
}

export async function saveGuestbook(input: unknown): Promise<GuestEntry[]> {
    const entries = normalizeGuestbook(input);

    if (hasBlob()) {
        await writeBlob(entries);
        mode = "blob";
        memory = { at: Date.now(), entries };
        return entries;
    }

    try {
        await writeAtomic(FILE, entries);
        mode = "file";
    } catch {
        await writeAtomic(TMP_FILE, entries);
        mode = "temporary";
    }
    memory = { at: Date.now(), entries };
    return entries;
}

/**
 * Serialise read-modify-write cycles so two people signing at once cannot
 * overwrite each other.
 */
export async function updateGuestbook(
    mutate: (entries: GuestEntry[]) => GuestEntry[],
): Promise<GuestEntry[]> {
    const run = async () => {
        memory = null;
        const entries = await getGuestbook();
        return saveGuestbook(mutate(entries));
    };
    const next = writeChain.then(run, run);
    writeChain = next.catch(() => {});
    return next;
}

export function guestbookMode(): GuestbookMode {
    return mode;
}

export function guestbookWarning(current: GuestbookMode = mode): string | null {
    if (current !== "temporary") return null;
    return "the guestbook is saving to the temporary disk — entries survive until the instance restarts. add BLOB_READ_WRITE_TOKEN to keep them.";
}

export { FILE as GUESTBOOK_FILE };
