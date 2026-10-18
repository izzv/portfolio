import { promises as fs } from "fs";
import os from "os";
import path from "path";
import {
    DEFAULT_PROJECTS,
    normalizeProjects,
    type Project,
} from "./projects";

/**
 * Where the project list lives.
 *
 * - `blob`      — Vercel Blob, used whenever `BLOB_READ_WRITE_TOKEN` is set.
 *                 This is the only durable option on a serverless host: Vercel
 *                 mounts the deployment read-only, so writing next to
 *                 `projects.json` is what used to fail with "could not write
 *                 projects.json".
 * - `file`      — `projects.json` in the repo root. Correct for a VPS/container
 *                 and for local development.
 * - `temporary` — a read-only filesystem without a blob token. The save lands in
 *                 the OS temp dir: it works for the life of the process, then
 *                 reverts. The admin UI says so instead of pretending.
 */

const FILE = path.join(process.cwd(), "projects.json");
const TMP_FILE = path.join(os.tmpdir(), "ryan-projects.json");
const BLOB_NAME = "projects.json";
const MEMORY_TTL_MS = 10_000;

export type StorageMode = "blob" | "file" | "temporary";

const blobToken = () => process.env.BLOB_READ_WRITE_TOKEN || "";
const hasBlob = () => !!blobToken();

let mode: StorageMode = "file";
let memory: { at: number; projects: Project[] } | null = null;

function defaults(): Project[] {
    return DEFAULT_PROJECTS.map((p) => ({ ...p }));
}

async function readJson(file: string): Promise<Project[] | null> {
    try {
        return normalizeProjects(JSON.parse(await fs.readFile(file, "utf8")));
    } catch {
        return null;
    }
}

async function writeAtomic(file: string, projects: Project[]): Promise<void> {
    const tmp = `${file}.${process.pid}.tmp`;
    try {
        await fs.writeFile(tmp, `${JSON.stringify(projects, null, 4)}\n`, "utf8");
        await fs.rename(tmp, file);
    } catch (e) {
        // Don't leave a half-write behind when the target is read-only.
        await fs.unlink(tmp).catch(() => {});
        throw e;
    }
}

async function readBlob(): Promise<Project[] | null> {
    const { list } = await import("@vercel/blob");
    const { blobs } = await list({
        prefix: BLOB_NAME,
        limit: 1,
        token: blobToken(),
    });
    const blob = blobs.find((b) => b.pathname === BLOB_NAME) ?? blobs[0];
    if (!blob) return null;
    // Blob overwrites can be served stale for up to a minute; the unique query
    // string forces a cache miss so a save is immediately visible.
    const res = await fetch(`${blob.url}?v=${Date.now()}`, {
        cache: "no-store",
    });
    if (!res.ok) return null;
    return normalizeProjects(await res.json());
}

async function writeBlob(projects: Project[]): Promise<void> {
    const { put } = await import("@vercel/blob");
    await put(BLOB_NAME, `${JSON.stringify(projects, null, 4)}\n`, {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/json",
        cacheControlMaxAge: 60,
        token: blobToken(),
    });
}

export async function getProjects(): Promise<Project[]> {
    if (memory && Date.now() - memory.at < MEMORY_TTL_MS)
        return memory.projects;

    if (hasBlob()) {
        try {
            const remote = await readBlob();
            if (remote) {
                mode = "blob";
                memory = { at: Date.now(), projects: remote };
                return remote;
            }
            // Nothing saved yet: start from the committed file.
            const seed =
                (await readJson(TMP_FILE)) ??
                (await readJson(FILE)) ??
                defaults();
            memory = { at: Date.now(), projects: seed };
            return seed;
        } catch {
            // Blob unreachable — still render something truthful.
        }
    }

    const tmp = await readJson(TMP_FILE);
    if (tmp) {
        mode = "temporary";
        return tmp;
    }

    return (await readJson(FILE)) ?? defaults();
}

export async function saveProjects(input: unknown): Promise<Project[]> {
    const projects = normalizeProjects(input);

    if (hasBlob()) {
        await writeBlob(projects);
        mode = "blob";
        memory = { at: Date.now(), projects };
        return projects;
    }

    try {
        await writeAtomic(FILE, projects);
        mode = "file";
    } catch {
        await writeAtomic(TMP_FILE, projects);
        mode = "temporary";
    }
    memory = { at: Date.now(), projects };
    return projects;
}

export function storageMode(): StorageMode {
    return mode;
}

export function storageWarning(current: StorageMode = mode): string | null {
    if (current !== "temporary") return null;
    return "saved to the temporary disk. This host is read-only, so the change disappears on redeploy or when the instance restarts — add BLOB_READ_WRITE_TOKEN to keep it.";
}

export { FILE as PROJECTS_FILE };
