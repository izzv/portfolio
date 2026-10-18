import { promises as fs } from "fs";
import path from "path";

const FILE = path.join(process.cwd(), "spotifycache.json");

export type Meta = { image: string; url: string };
type Store = Record<string, Meta & { savedAt: number }>;

let memory: Store | null = null;
let writeChain: Promise<void> = Promise.resolve();

async function load(): Promise<Store> {
    if (memory) return memory;
    try {
        memory = JSON.parse(await fs.readFile(FILE, "utf8")) as Store;
    } catch {
        memory = {};
    }
    return memory;
}

export async function getCachedMeta(key: string): Promise<Meta | null> {
    const store = await load();
    const e = store[key];
    return e ? { image: e.image, url: e.url } : null;
}

export async function saveMeta(key: string, meta: Meta): Promise<void> {
    const store = await load();
    store[key] = { ...meta, savedAt: Date.now() };
    writeChain = writeChain.then(async () => {
        try {
            await fs.writeFile(FILE, JSON.stringify(store, null, 2), "utf8");
        } catch {}
    });
    await writeChain;
}
