import type { Collection } from "mongodb";
import { getDb, errorMessage, mongoConfigured } from "./mongodb";
import { normalizeSite, type SiteConfig } from "./siteConfig";
import { log } from "./logger";

/**
 * The editable site config lives in MongoDB — one document, replaced whole on
 * save. A single document keeps the config atomic: a save can never leave the
 * profile on one version and the appearance on another.
 *
 * Reads are fallbacks-on-failure: if the database is unreachable the public
 * site still renders the shipped defaults (and `/admin` says why), because a
 * database hiccup should not take the whole page down. Writes always throw, so
 * an admin save that did not happen never looks like it did.
 */

export type SiteStorageMode = "mongodb" | "unavailable";

type SiteDoc = {
    _id: string;
    config: SiteConfig;
    updatedAt: Date;
};

const COLLECTION = "site";
const DOC_ID = "config";

let mode: SiteStorageMode = mongoConfigured() ? "mongodb" : "unavailable";

async function collection(): Promise<Collection<SiteDoc>> {
    return (await getDb()).collection<SiteDoc>(COLLECTION);
}

export async function getSite(): Promise<SiteConfig> {
    if (mongoConfigured()) {
        try {
            const doc = await (await collection()).findOne({ _id: DOC_ID });
            mode = "mongodb";
            // Nothing saved yet: start from the shipped defaults. The first
            // save from /admin creates the document.
            return doc ? normalizeSite(doc.config) : normalizeSite(undefined);
        } catch (e: unknown) {
            mode = "unavailable";
            log("error", "site", "mongo read failed, serving defaults", {
                error: errorMessage(e),
            });
        }
    }
    return normalizeSite(undefined);
}

export async function saveSite(input: unknown): Promise<SiteConfig> {
    const config = normalizeSite(input);
    const site = await collection();
    await site.updateOne(
        { _id: DOC_ID },
        { $set: { config, updatedAt: new Date() } },
        { upsert: true },
    );
    mode = "mongodb";
    return config;
}

export function siteStorageMode(): SiteStorageMode {
    return mode;
}

export function siteStorageWarning(
    current: SiteStorageMode = mode,
): string | null {
    if (current !== "unavailable") return null;
    return "MongoDB is not reachable, so this page is showing the shipped defaults and saves will fail. set MONGODB_URI (and optionally MONGODB_DB) in the environment, then reload.";
}
