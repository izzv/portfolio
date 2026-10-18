import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { normalizeSite, type SiteConfig } from "./siteConfig";

/**
 * Where the editable site config lives.
 *
 * - `blob`      — Vercel Blob when `BLOB_READ_WRITE_TOKEN` is set (the only
 *                 durable option on a read-only serverless deployment).
 * - `file`      — `site.json` in the repo root (VPS/container/local dev).
 * - `temporary` — OS temp dir when the filesystem is read-only. The change
 *                 works for the life of the process, then reverts.
 */

const FILE = path.join(process.cwd(), "site.json");
const TMP_FILE = path.join(os.tmpdir(), "ryan-site.json");
const BLOB_NAME = "site.json";
const MEMORY_TTL_MS = 10_000;

export type SiteStorageMode = "blob" | "file" | "temporary";

const blobToken = () => process.env.BLOB_READ_WRITE_TOKEN || "";
const hasBlob = () => !!blobToken();

let mode: SiteStorageMode = "file";
let memory: { at: number; config: SiteConfig } | null = null;

async function readJson(file: string): Promise<SiteConfig | null> {
    try {
        return normalizeSite(JSON.parse(await fs.readFile(file, "utf8")));
    } catch {
        return null;
    }
}

async function writeAtomic(file: string, config: SiteConfig): Promise<void> {
    const tmp = `${file}.${process.pid}.tmp`;
    try {
        await fs.writeFile(
            tmp,
            `${JSON.stringify(config, null, 4)}\n`,
            "utf8",
        );
        await fs.rename(tmp, file);
    } catch (e) {
        await fs.unlink(tmp).catch(() => {});
        throw e;
    }
}

async function readBlob(): Promise<SiteConfig | null> {
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
    return normalizeSite(await res.json());
}

async function writeBlob(config: SiteConfig): Promise<void> {
    const { put } = await import("@vercel/blob");
    await put(BLOB_NAME, `${JSON.stringify(config, null, 4)}\n`, {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/json",
        cacheControlMaxAge: 60,
        token: blobToken(),
    });
}

export async function getSite(): Promise<SiteConfig> {
    if (memory && Date.now() - memory.at < MEMORY_TTL_MS)
        return memory.config;

    if (hasBlob()) {
        try {
            const remote = await readBlob();
            if (remote) {
                mode = "blob";
                memory = { at: Date.now(), config: remote };
                return remote;
            }
            const seed =
                (await readJson(TMP_FILE)) ??
                (await readJson(FILE)) ??
                normalizeSite(undefined);
            memory = { at: Date.now(), config: seed };
            return seed;
        } catch {
            // Blob unreachable — fall through to local reads.
        }
    }

    const tmp = await readJson(TMP_FILE);
    if (tmp) {
        mode = "temporary";
        memory = { at: Date.now(), config: tmp };
        return tmp;
    }

    const local = await readJson(FILE);
    if (local) {
        mode = "file";
        memory = { at: Date.now(), config: local };
        return local;
    }

    return normalizeSite(undefined);
}

export async function saveSite(input: unknown): Promise<SiteConfig> {
    const config = normalizeSite(input);

    if (hasBlob()) {
        await writeBlob(config);
        mode = "blob";
        memory = { at: Date.now(), config };
        return config;
    }

    try {
        await writeAtomic(FILE, config);
        mode = "file";
    } catch {
        await writeAtomic(TMP_FILE, config);
        mode = "temporary";
    }
    memory = { at: Date.now(), config };
    return config;
}

export function siteStorageMode(): SiteStorageMode {
    return mode;
}

export function siteStorageWarning(
    current: SiteStorageMode = mode,
): string | null {
    if (current !== "temporary") return null;
    return "saved to the temporary disk. this host is read-only, so the change disappears on redeploy or when the instance restarts — add BLOB_READ_WRITE_TOKEN to keep it.";
}

export { FILE as SITE_FILE };
