import { promises as fs } from "fs";
import path from "path";
import type { LyricLine, Lyrics } from "./lastfm";

const FILE = path.join(process.cwd(), "lyricscache.json");

type Entry = {
    artist: string;
    track: string;
    album: string;
    lines: LyricLine[];
    synced?: boolean;
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
): Promise<Lyrics | null> {
    const store = await load();
    const entry = store[keyOf(artist, track, spotifyId)];
    if (!entry?.lines?.length) return null;
    // Entries written before `synced` existed were time-stamped already.
    return { lines: entry.lines, synced: entry.synced ?? true };
}

export async function saveLyrics(
    artist: string,
    track: string,
    album: string,
    lines: LyricLine[],
    spotifyId = "",
    synced = false,
): Promise<void> {
    if (!lines?.length) return;
    const store = await load();
    store[keyOf(artist, track, spotifyId)] = {
        artist,
        track,
        album,
        lines,
        synced,
        savedAt: Date.now(),
    };
    writeChain = writeChain.then(async () => {
        try {
            await fs.writeFile(FILE, JSON.stringify(store, null, 2), "utf8");
        } catch {}
    });
    await writeChain;
}
