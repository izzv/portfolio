import type { Collection } from "mongodb";
import { getDb, errorMessage, mongoConfigured } from "./mongodb";
import {
    DEFAULT_PROJECTS,
    normalizeProjects,
    type Project,
} from "./projects";
import { log } from "./logger";

/**
 * The project list lives in MongoDB — one document holding the ordered array.
 * Order is part of the data (`/admin` reorders rows), so a single array keeps
 * the list exactly as it was saved instead of relying on a sort field.
 *
 * Unreachable database: reads fall back to the shipped defaults so the site
 * still renders, writes throw and the admin reports the real reason.
 */

export type StorageMode = "mongodb" | "unavailable";

type ProjectsDoc = {
    _id: string;
    items: Project[];
    updatedAt: Date;
};

const COLLECTION = "projects";
const DOC_ID = "list";

let mode: StorageMode = mongoConfigured() ? "mongodb" : "unavailable";

function defaults(): Project[] {
    return DEFAULT_PROJECTS.map((p) => ({ ...p }));
}

async function collection(): Promise<Collection<ProjectsDoc>> {
    return (await getDb()).collection<ProjectsDoc>(COLLECTION);
}

export async function getProjects(): Promise<Project[]> {
    if (mongoConfigured()) {
        try {
            const doc = await (await collection()).findOne({ _id: DOC_ID });
            mode = "mongodb";
            if (doc) return normalizeProjects(doc.items);
            return defaults();
        } catch (e: unknown) {
            mode = "unavailable";
            log("error", "projects", "mongo read failed, serving defaults", {
                error: errorMessage(e),
            });
        }
    }
    return defaults();
}

export async function saveProjects(input: unknown): Promise<Project[]> {
    const projects = normalizeProjects(input);
    const list = await collection();
    await list.updateOne(
        { _id: DOC_ID },
        { $set: { items: projects, updatedAt: new Date() } },
        { upsert: true },
    );
    mode = "mongodb";
    return projects;
}

export function storageMode(): StorageMode {
    return mode;
}

export function storageWarning(current: StorageMode = mode): string | null {
    if (current !== "unavailable") return null;
    return "MongoDB is not reachable, so this page is showing the shipped projects and saves will fail. set MONGODB_URI (and optionally MONGODB_DB) in the environment, then reload.";
}
