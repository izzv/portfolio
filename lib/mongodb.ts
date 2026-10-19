import { MongoClient, type Db } from "mongodb";

/**
 * One MongoDB client shared by every store.
 *
 * The client is cached on `globalThis` because serverless functions are frozen
 * between requests: a module-level client would open a fresh pool per instance
 * (and again on every hot reload), while the global survives both. The URI is
 * part of the cache key, so changing `MONGODB_URI` during development picks up
 * the new database instead of reusing the old connection.
 *
 * `serverSelectionTimeoutMS` is deliberately short — a bad URI should fail an
 * admin save in seconds, not hang the request until the platform times out.
 */

const DEFAULT_DB = "ryan-site";

type Cached = { uri: string; promise: Promise<MongoClient> };

const globalWithMongo = globalThis as typeof globalThis & {
    __ryanMongo?: Cached;
};

export function mongoUri(): string {
    return (process.env.MONGODB_URI || "").trim();
}

export function mongoConfigured(): boolean {
    return mongoUri().length > 0;
}

export function mongoDbName(): string {
    return (process.env.MONGODB_DB || "").trim() || DEFAULT_DB;
}

function connect(): Promise<MongoClient> {
    const uri = mongoUri();
    if (!uri) throw new Error("MONGODB_URI is not set");

    const cached = globalWithMongo.__ryanMongo;
    if (cached && cached.uri === uri) return cached.promise;

    const promise = new MongoClient(uri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5_000,
    }).connect();

    globalWithMongo.__ryanMongo = { uri, promise };

    // A failed first connection must not poison the cache forever: drop it so
    // the next request retries instead of replaying the same rejection.
    promise.catch(() => {
        if (globalWithMongo.__ryanMongo?.promise === promise) {
            globalWithMongo.__ryanMongo = undefined;
        }
    });

    return promise;
}

export async function getDb(): Promise<Db> {
    const connected = await connect();
    return connected.db(mongoDbName());
}

/** Driver errors can be plain objects; keep logs readable either way. */
export function errorMessage(e: unknown): string {
    return e instanceof Error ? e.message : String(e);
}
