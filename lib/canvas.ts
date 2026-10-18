/**
 * Spotify Canvas — the short looping video Spotify shows behind a track.
 *
 * The public Web API has no canvas field, and Spotify never documented an
 * endpoint for it, so this reads the community endpoint that reverse-engineered
 * the internal protobuf call (`spotify-canva.vercel.app/api/canvas`). It takes a
 * track id, needs no credentials, and returns `canvasesList[].canvasUrl` on
 * `canvaz.scdn.co` — which is CORS-open, so the browser can play it directly.
 *
 * The track id still has to come from somewhere, and the only source the site
 * has is Spotify search (`SPOTIFY_CLIENT_ID`/`SPOTIFY_CLIENT_SECRET`) or the
 * owner's currently-playing response (`SPOTIFY_REFRESH_TOKEN`). Without either,
 * `now.spotifyId` is null and no canvas is ever requested.
 *
 * Results are cached per process: hits for 6h, misses for 10min, so a track
 * change costs at most one lookup.
 */

const ENDPOINT = "https://spotify-canva.vercel.app/api/canvas";
const HIT_TTL_MS = 6 * 60 * 60 * 1000;
const MISS_TTL_MS = 10 * 60 * 1000;
const TIMEOUT_MS = 2500;
const MAX_ENTRIES = 200;

type Entry = { url: string | null; at: number };

const cache = new Map<string, Entry>();
const inflight = new Map<string, Promise<string | null>>();

// Guard the upstream endpoint against a client enumerating random ids: normal
// use is one lookup per track change, so this never trips in practice.
const BURST_WINDOW_MS = 60_000;
const BURST_LIMIT = 30;
let burstStart = 0;
let burstCount = 0;

function overBurst(): boolean {
    const now = Date.now();
    if (now - burstStart > BURST_WINDOW_MS) {
        burstStart = now;
        burstCount = 0;
    }
    burstCount += 1;
    return burstCount > BURST_LIMIT;
}

function trim() {
    while (cache.size > MAX_ENTRIES) {
        const oldest = cache.keys().next().value;
        if (oldest === undefined) return;
        cache.delete(oldest);
    }
}

function valid(id: string): boolean {
    return /^[A-Za-z0-9]{22}$/.test(id);
}

function pick(payload: any): string | null {
    const list = payload?.canvasesList ?? payload?.data?.canvasesList;
    if (!Array.isArray(list)) return null;
    for (const item of list) {
        const raw = item?.canvasUrl;
        if (typeof raw !== "string") continue;
        try {
            const url = new URL(raw);
            if (url.protocol !== "https:") continue;
            if (!url.hostname.endsWith("scdn.co")) continue;
            return url.toString();
        } catch {
            continue;
        }
    }
    return null;
}

export async function getCanvasUrl(trackId: string): Promise<string | null> {
    if (!valid(trackId)) return null;

    const cached = cache.get(trackId);
    if (cached) {
        const ttl = cached.url ? HIT_TTL_MS : MISS_TTL_MS;
        if (Date.now() - cached.at < ttl) return cached.url;
    }

    const running = inflight.get(trackId);
    if (running) return running;
    if (overBurst()) return null;

    const task = (async (): Promise<string | null> => {
        try {
            const u = new URL(ENDPOINT);
            u.searchParams.set("trackId", trackId);
            const res = await fetch(u.toString(), {
                cache: "no-store",
                headers: { "User-Agent": "ryan-site/3.0" },
                signal: AbortSignal.timeout(TIMEOUT_MS),
            });
            const url = res.ok ? pick(await res.json()) : null;
            cache.set(trackId, { url, at: Date.now() });
            trim();
            return url;
        } catch {
            // Network hiccup or endpoint down: remember the miss briefly so a
            // 2s poll doesn't hammer it, and let the next track try again.
            cache.set(trackId, { url: null, at: Date.now() });
            trim();
            return null;
        } finally {
            inflight.delete(trackId);
        }
    })();

    inflight.set(trackId, task);
    return task;
}
