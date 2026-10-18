import { Spotify } from "spotify-lyrics-ts";
import {
    searchSpotifyTrack,
    getOwnerCurrentlyPlaying,
    searchSpotifyAlbum,
    searchSpotifyArtist,
    type SpotifyTrack,
    type SpotifyMeta,
} from "./spotify";
import { getCachedMeta, saveMeta, type Meta } from "./metaCache";

const spCache = new Map<string, { v: SpotifyTrack | null; exp: number }>();

const memMeta = new Map<string, Meta>();

async function enrichMeta(
    key: string,
    fetcher: () => Promise<SpotifyMeta | null>,
    fallback: Meta,
): Promise<Meta> {
    const mem = memMeta.get(key);
    if (mem) return mem;
    const disk = await getCachedMeta(key);
    if (disk) {
        memMeta.set(key, disk);
        return disk;
    }
    try {
        const r = await fetcher();
        if (r && (r.image || r.url)) {
            const v: Meta = {
                image: r.image || fallback.image,
                url: r.url || fallback.url,
            };
            memMeta.set(key, v);
            await saveMeta(key, v);
            return v;
        }
    } catch {}
    return { ...fallback };
}

async function mapLimit<T, R>(
    items: T[],
    limit: number,
    fn: (item: T) => Promise<R>,
): Promise<R[]> {
    const out: R[] = new Array(items.length);
    let i = 0;
    async function worker() {
        while (i < items.length) {
            const idx = i++;
            out[idx] = await fn(items[idx]);
        }
    }
    await Promise.all(
        Array.from({ length: Math.min(limit, items.length) }, worker),
    );
    return out;
}

async function cachedSpotifyTrack(
    artist: string,
    track: string,
): Promise<SpotifyTrack | null> {
    const key = `${artist}\u0000${track}`.toLowerCase();
    const hit = spCache.get(key);
    if (hit && Date.now() < hit.exp) return hit.v;
    const v = await searchSpotifyTrack(artist, track);
    spCache.set(key, { v, exp: Date.now() + 6 * 60 * 60 * 1000 });
    if (spCache.size > 200)
        spCache.delete(spCache.keys().next().value as string);
    return v;
}

const API = "https://ws.audioscrobbler.com/2.0/";
const KEY = process.env.LASTFM_API_KEY!;
const USER = process.env.LASTFM_USER!;

type LfmImage = { "#text": string; size: string };

function pickImage(
    images: LfmImage[] | undefined,
    preferred = "extralarge",
): string {
    if (!Array.isArray(images) || !images.length) return "";
    const map = new Map(images.map((i) => [i.size, i["#text"]]));
    return (
        map.get(preferred) ||
        map.get("large") ||
        map.get("medium") ||
        map.get("small") ||
        images[images.length - 1]["#text"] ||
        ""
    );
}

async function call(
    method: string,
    params: Record<string, string | number> = {},
) {
    const url = new URL(API);
    url.searchParams.set("method", method);
    url.searchParams.set("api_key", KEY);
    url.searchParams.set("user", USER);
    url.searchParams.set("format", "json");
    for (const [k, v] of Object.entries(params))
        url.searchParams.set(k, String(v));
    const res = await fetch(url.toString(), {
        cache: "no-store",
        headers: { "User-Agent": "ryan-site/3.0" },
    });
    if (!res.ok) throw new Error("last.fm " + res.status);
    return res.json();
}

export type NowPlaying = {
    isPlaying: boolean;
    name: string;
    artist: string;
    album: string;
    image: string;
    url: string;
    durationMs?: number;
    preview?: string;
    spotifyUrl?: string;
    spotifyId?: string;
    progressMs?: number;
    fetchedAt?: number;
};

export async function getNowPlaying(): Promise<NowPlaying> {
    const owner = await getOwnerCurrentlyPlaying();
    if (owner && owner.name) {
        return {
            isPlaying: owner.isPlaying,
            name: owner.name,
            artist: owner.artist,
            album: owner.album,
            image: owner.image,
            url: owner.url,
            durationMs: owner.durationMs,
            progressMs: owner.progressMs,
            spotifyUrl: owner.url,
            spotifyId: owner.id,
            fetchedAt: Date.now(),
        };
    }

    const data = await call("user.getrecenttracks", { limit: 1 });
    const t = data?.recenttracks?.track?.[0];
    if (!t)
        return {
            isPlaying: false,
            name: "",
            artist: "",
            album: "",
            image: "",
            url: "",
        };
    const np: NowPlaying = {
        isPlaying: t["@attr"]?.nowplaying === "true",
        name: t.name || "",
        artist: t.artist?.["#text"] || t.artist?.name || "",
        album: t.album?.["#text"] || "",
        image: pickImage(t.image),
        url: t.url || "",
    };

    const sp = await cachedSpotifyTrack(np.artist, np.name);
    if (sp) {
        if (sp.image) np.image = sp.image;
        if (!np.album && sp.album) np.album = sp.album;
        np.durationMs = sp.durationMs;
        if (sp.preview) np.preview = sp.preview;
        np.spotifyUrl = sp.url;
        np.spotifyId = sp.id;
    }
    return np;
}

export type TopItem = {
    rank: number;
    name: string;
    artist: string;
    plays: number;
    image: string;
    url: string;
};

export async function getTop(
    type: "albums" | "tracks" | "artists",
    period = "1month",
    limit = 24,
): Promise<TopItem[]> {
    if (type === "tracks") {
        const d = await call("user.gettoptracks", { period, limit });
        const base: TopItem[] = (d?.toptracks?.track || []).map(
            (t: any, i: number) => ({
                rank: Number(t["@attr"]?.rank || i + 1),
                name: t.name,
                artist: t.artist?.name || "",
                plays: Number(t.playcount || 0),
                image: pickImage(t.image),
                url: t.url || "",
            }),
        );
        return mapLimit(base, 3, async (it) => {
            const m = await enrichMeta(
                `t:${it.artist}:${it.name}`.toLowerCase(),
                async () => {
                    const s = await cachedSpotifyTrack(it.artist, it.name);
                    return s
                        ? { image: s.image || null, url: s.url || null }
                        : null;
                },
                { image: it.image, url: it.url },
            );
            return { ...it, image: m.image, url: m.url };
        });
    }
    if (type === "artists") {
        const d = await call("user.gettopartists", { period, limit });
        const base: TopItem[] = (d?.topartists?.artist || []).map(
            (a: any, i: number) => ({
                rank: Number(a["@attr"]?.rank || i + 1),
                name: a.name,
                artist: "",
                plays: Number(a.playcount || 0),
                image: pickImage(a.image),
                url: a.url || "",
            }),
        );
        return mapLimit(base, 3, async (it) => {
            const m = await enrichMeta(
                `ar:${it.name}`.toLowerCase(),
                () => searchSpotifyArtist(it.name),
                { image: it.image, url: it.url },
            );
            return { ...it, image: m.image, url: m.url };
        });
    }
    const d = await call("user.gettopalbums", { period, limit });
    const base: TopItem[] = (d?.topalbums?.album || []).map(
        (a: any, i: number) => ({
            rank: Number(a["@attr"]?.rank || i + 1),
            name: a.name,
            artist: a.artist?.name || "",
            plays: Number(a.playcount || 0),
            image: pickImage(a.image),
            url: a.url || "",
        }),
    );
    return mapLimit(base, 3, async (it) => {
        const m = await enrichMeta(
            `al:${it.artist}:${it.name}`.toLowerCase(),
            () => searchSpotifyAlbum(it.artist, it.name),
            { image: it.image, url: it.url },
        );
        return { ...it, image: m.image, url: m.url };
    });
}

export type UserInfo = {
    playcount: number;
    artistCount: number;
    trackCount: number;
    albumCount: number;
    name: string;
};

export async function getUserInfo(): Promise<UserInfo> {
    const d = await call("user.getinfo");
    const u = d?.user || {};
    return {
        playcount: Number(u.playcount || 0),
        artistCount: Number(u.artist_count || 0),
        trackCount: Number(u.track_count || 0),
        albumCount: Number(u.album_count || 0),
        name: u.name || "",
    };
}

export type Preview = {
    audio: string | null;
    image?: string;
    name?: string;
    artist?: string;
    source?: string;
};

export async function resolvePreview(
    artist: string,
    track: string,
): Promise<Preview> {
    const term = `${artist} ${track}`.trim();
    try {
        const sp = await searchSpotifyTrack(artist, track);
        if (sp?.preview)
            return {
                audio: sp.preview,
                image: sp.image,
                name: sp.name,
                artist: sp.artist,
                source: "spotify",
            };
    } catch {}
    try {
        const u = new URL("https://itunes.apple.com/search");
        u.searchParams.set("term", term);
        u.searchParams.set("media", "music");
        u.searchParams.set("entity", "song");
        u.searchParams.set("limit", "5");
        const r = await fetch(u.toString());
        if (r.ok) {
            const d = await r.json();
            const hit = (d.results || []).find((x: any) => x.previewUrl);
            if (hit)
                return {
                    audio: hit.previewUrl,
                    image: (hit.artworkUrl100 || "").replace(
                        "100x100",
                        "300x300",
                    ),
                    name: hit.trackName,
                    artist: hit.artistName,
                    source: "itunes",
                };
        }
    } catch {}
    try {
        const u = new URL("https://api.deezer.com/search");
        u.searchParams.set("q", term);
        u.searchParams.set("limit", "5");
        const r = await fetch(u.toString());
        if (r.ok) {
            const d = await r.json();
            const hit = (d.data || []).find((x: any) => x.preview);
            if (hit)
                return {
                    audio: hit.preview,
                    image: hit.album?.cover_medium || "",
                    name: hit.title,
                    artist: hit.artist?.name,
                    source: "deezer",
                };
        }
    } catch {}
    return { audio: null };
}

export type LyricLine = { t: number; text: string };

function parseLrc(synced?: string, plain?: string): { lines: LyricLine[] } {
    const lines: LyricLine[] = [];
    if (synced) {
        for (const raw of synced.split(/\r?\n/)) {
            const m = raw.match(/\[(\d+):(\d+(?:\.\d+)?)\]\s*(.*)/);
            if (m) {
                const t = Number(m[1]) * 60 + parseFloat(m[2]);
                const text = m[3].trim();
                if (text) lines.push({ t, text });
            }
        }
    } else if (plain) {
        plain.split(/\r?\n/).forEach((text, i) => {
            if (text.trim()) lines.push({ t: i * 3, text: text.trim() });
        });
    }
    return { lines };
}

export async function getLyrics(
    artist: string,
    track: string,
    album = "",
    spotifyId = "",
): Promise<{ lines: LyricLine[] }> {
    if (spotifyId) {
        const cookie = process.env.SP_DC_COOKIE;
        if (cookie) {
            try {
                const client = new Spotify(cookie);
                const _log = console.log;
                console.log = () => {};
                await client.initialize();
                console.log = _log;
                const lrc = await client.getLyricsLRC(spotifyId);
                if (lrc) return parseLrc(lrc);
                const plain = await client.getLyrics(spotifyId);
                if (plain) return parseLrc(undefined, String(plain));
            } catch {}
        }
    }
    try {
        const u = new URL("https://lrclib.net/api/get");
        u.searchParams.set("artist_name", artist);
        u.searchParams.set("track_name", track);
        if (album) u.searchParams.set("album_name", album);
        const r = await fetch(u.toString(), {
            headers: { "User-Agent": "ryan-site/3.0" },
        });
        if (r.ok) {
            const d = await r.json();
            return parseLrc(d.syncedLyrics, d.plainLyrics);
        }
        const su = new URL("https://lrclib.net/api/search");
        su.searchParams.set("q", `${artist} ${track}`);
        const sr = await fetch(su.toString(), {
            headers: { "User-Agent": "ryan-site/3.0" },
        });
        if (sr.ok) {
            const arr = await sr.json();
            const hit =
                (arr || []).find((x: any) => x.syncedLyrics) || arr?.[0];
            if (hit) return parseLrc(hit.syncedLyrics, hit.plainLyrics);
        }
    } catch {}
    return { lines: [] };
}
