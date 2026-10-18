import { promises as fs } from "fs";
import path from "path";
import type { LyricLine } from "./lastfm";

const FILE = path.join(process.cwd(), "lyricscache.json");

type Entry = {
    artist: string;
    track: string;
    album: string;
    lines: LyricLine[];
    savedAt: number;
};

type Store = Record<string, Entry>;

let memory: Store | null = null;
let writeChain: Promise<void> = Promise.resolve();

function keyOf(artist: string, track: string, spotifyId = ""): string {
    if (spotifyId) return `spotify:${spotifyId}`;
    return `${artist}\u0000${track}`.toLowerCase().trim();
}

async function load(): Promise<Store> {
    if (memory) return memory;
    try {
        const raw = await fs.readFile(FILE, "utf8");
        memory = JSON.parse(raw) as Store;
    } catch {
        memory = {};
    }
    return memory;
}

export async function getCachedLyrics(
    artist: string,
    track: string,
    spotifyId = "",
): Promise<LyricLine[] | null> {
    const store = await load();
    const entry = store[keyOf(artist, track, spotifyId)];
    return entry?.lines?.length ? entry.lines : null;
}

export async function saveLyrics(
    artist: string,
    track: string,
    album: string,
    lines: LyricLine[],
    spotifyId = "",
): Promise<void> {
    if (!lines?.length) return;
    const store = await load();
    store[keyOf(artist, track, spotifyId)] = {
        artist,
        track,
        album,
        lines,
        savedAt: Date.now(),
    };
    writeChain = writeChain.then(async () => {
        try {
            await fs.writeFile(FILE, JSON.stringify(store, null, 2), "utf8");
        } catch {}
    });
    await writeChain;
}
