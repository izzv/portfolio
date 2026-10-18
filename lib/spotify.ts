const ID = process.env.SPOTIFY_CLIENT_ID || "";
const SECRET = process.env.SPOTIFY_CLIENT_SECRET || "";
const SEARCH_ID = process.env.SPOTIFY_SEARCH_CLIENT_ID || ID;
const SEARCH_SECRET = process.env.SPOTIFY_SEARCH_CLIENT_SECRET || SECRET;
const REDIRECT_URI =
    process.env.SPOTIFY_REDIRECT_URI ||
    "http://127.0.0.1:3000/api/spotify/callback";
const REFRESH = process.env.SPOTIFY_REFRESH_TOKEN || "";
const SCOPES = "user-read-currently-playing user-read-playback-state";

const basicAuth = () =>
    "Basic " + Buffer.from(`${ID}:${SECRET}`).toString("base64");

let cachedToken: { token: string; exp: number } | null = null;

export function hasSpotifyOwner(): boolean {
    return !!REFRESH && !!ID && !!SECRET;
}

export function spotifyLoginUrl(): string {
    const u = new URL("https://accounts.spotify.com/authorize");
    u.searchParams.set("client_id", ID);
    u.searchParams.set("response_type", "code");
    u.searchParams.set("redirect_uri", REDIRECT_URI);
    u.searchParams.set("scope", SCOPES);
    u.searchParams.set("show_dialog", "true");
    return u.toString();
}

export async function exchangeCode(code: string): Promise<any> {
    const res = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: basicAuth(),
        },
        body: new URLSearchParams({
            grant_type: "authorization_code",
            code,
            redirect_uri: REDIRECT_URI,
        }),
        cache: "no-store",
    });
    return res.json();
}

let ownerToken: { token: string; exp: number } | null = null;

async function getOwnerToken(): Promise<string | null> {
    if (!hasSpotifyOwner()) return null;
    if (ownerToken && Date.now() < ownerToken.exp) return ownerToken.token;
    try {
        const res = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: basicAuth(),
            },
            body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: REFRESH,
            }),
            cache: "no-store",
        });
        if (!res.ok) return null;
        const d = await res.json();
        if (!d?.access_token) return null;
        ownerToken = {
            token: d.access_token,
            exp: Date.now() + Math.max(0, (d.expires_in || 3600) - 60) * 1000,
        };
        return ownerToken.token;
    } catch {
        return null;
    }
}

export type SpotifyNow = {
    isPlaying: boolean;
    name: string;
    artist: string;
    album: string;
    image: string;
    url: string;
    durationMs: number;
    progressMs: number;
    id: string;
} | null;

export async function getOwnerCurrentlyPlaying(): Promise<SpotifyNow> {
    const token = await getOwnerToken();
    if (!token) return null;
    try {
        const res = await fetch(
            "https://api.spotify.com/v1/me/player/currently-playing",
            {
                headers: { Authorization: `Bearer ${token}` },
                cache: "no-store",
            },
        );
        if (res.status === 204 || !res.ok) return null;
        const d = await res.json();
        const it = d?.item;
        if (!it) return null;
        return {
            isPlaying: !!d.is_playing,
            name: it.name || "",
            artist: (it.artists || []).map((a: any) => a.name).join(", "),
            album: it.album?.name || "",
            image: it.album?.images?.[0]?.url || "",
            url: it.external_urls?.spotify || "",
            durationMs: it.duration_ms || 0,
            progressMs: d.progress_ms || 0,
            id: it.id || "",
        };
    } catch {
        return null;
    }
}

export type SpotifyMeta = { image: string | null; url: string | null };

export async function searchSpotifyAlbum(
    artist: string,
    album: string,
): Promise<SpotifyMeta | null> {
    if (searchBlocked()) return null;
    const token = await getSpotifyToken();
    if (!token || !album) return null;
    try {
        await paceSearch();
        const u = new URL("https://api.spotify.com/v1/search");
        u.searchParams.set("q", `album:${album} artist:${artist}`);
        u.searchParams.set("type", "album");
        u.searchParams.set("limit", "3");
        const res = await fetch(u.toString(), {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
        });
        if (res.status === 429) note429(res);
        if (!res.ok) return null;
        const d = await res.json();
        const it = d?.albums?.items?.[0];
        if (!it) return null;
        return {
            image: it.images?.[0]?.url || null,
            url: it.external_urls?.spotify || null,
        };
    } catch {
        return null;
    }
}

export async function searchSpotifyArtist(
    name: string,
): Promise<SpotifyMeta | null> {
    if (searchBlocked()) return null;
    const token = await getSpotifyToken();
    if (!token || !name) return null;
    try {
        await paceSearch();
        const u = new URL("https://api.spotify.com/v1/search");
        u.searchParams.set("q", name);
        u.searchParams.set("type", "artist");
        u.searchParams.set("limit", "5");
        const res = await fetch(u.toString(), {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
        });
        if (res.status === 429) note429(res);
        if (!res.ok) return null;
        const d = await res.json();
        const items: any[] = d?.artists?.items || [];
        const na = name.toLowerCase();
        const hit =
            items.find((a) => (a.name || "").toLowerCase() === na) || items[0];
        if (!hit) return null;
        return {
            image: hit.images?.[0]?.url || hit.images?.[1]?.url || null,
            url: hit.external_urls?.spotify || null,
        };
    } catch {
        return null;
    }
}

export async function getSpotifyToken(): Promise<string | null> {
    if (!SEARCH_ID || !SEARCH_SECRET) return null;
    if (cachedToken && Date.now() < cachedToken.exp) return cachedToken.token;
    try {
        const res = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization:
                    "Basic " +
                    Buffer.from(`${SEARCH_ID}:${SEARCH_SECRET}`).toString(
                        "base64",
                    ),
            },
            body: new URLSearchParams({ grant_type: "client_credentials" }),
            cache: "no-store",
        });
        if (!res.ok) return null;
        const d = await res.json();
        if (!d?.access_token) return null;
        cachedToken = {
            token: d.access_token,
            exp: Date.now() + Math.max(0, (d.expires_in || 3600) - 60) * 1000,
        };
        return cachedToken.token;
    } catch {
        return null;
    }
}

export type SpotifyTrack = {
    id: string;
    name: string;
    artist: string;
    album: string;
    image: string;
    durationMs: number;
    preview: string | null;
    url: string;
};

let searchBlockedUntil = 0;

export function searchBlocked(): boolean {
    return Date.now() < searchBlockedUntil;
}

function note429(res: Response): void {
    const ra = Number(res.headers.get("retry-after") || "0");
    searchBlockedUntil = Date.now() + (ra > 0 ? ra * 1000 : 60_000);
}

let lastSearchAt = 0;
const SEARCH_GAP_MS = 140;

async function paceSearch(): Promise<void> {
    const now = Date.now();
    const wait = Math.max(0, lastSearchAt + SEARCH_GAP_MS - now);
    lastSearchAt = Math.max(now, lastSearchAt + SEARCH_GAP_MS);
    if (wait) await new Promise((r) => setTimeout(r, wait));
}

function norm(s: string): string {
    return s
        .toLowerCase()
        .replace(/\(feat\.[^)]*\)|\[[^\]]*\]/g, "")
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
}

async function query(token: string, q: string): Promise<any[]> {
    if (searchBlocked()) return [];
    await paceSearch();
    const u = new URL("https://api.spotify.com/v1/search");
    u.searchParams.set("q", q);
    u.searchParams.set("type", "track");
    u.searchParams.set("limit", "8");
    const res = await fetch(u.toString(), {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
    });
    if (res.status === 429) note429(res);
    if (!res.ok) return [];
    const d = await res.json();
    return d?.tracks?.items || [];
}

export async function searchSpotifyTrack(
    artist: string,
    track: string,
): Promise<SpotifyTrack | null> {
    if (searchBlocked()) return null;
    const token = await getSpotifyToken();
    if (!token || !track) return null;
    try {
        let items = await query(token, `track:${track} artist:${artist}`);
        if (!items.length) items = await query(token, `${artist} ${track}`);
        if (!items.length) return null;

        const nt = norm(track);
        const na = norm(artist);
        const scored = items
            .map((it: any) => {
                const itName = norm(it.name || "");
                const itArtists = (it.artists || [])
                    .map((a: any) => norm(a.name))
                    .join(" ");
                let score = 0;
                if (itName === nt) score += 4;
                else if (itName.includes(nt) || nt.includes(itName)) score += 2;
                if (
                    itArtists.includes(na) ||
                    na.includes(itArtists.split(" ")[0] || "")
                )
                    score += 3;
                score += (it.popularity || 0) / 100;
                return { it, score };
            })
            .sort((a, b) => b.score - a.score);

        const hit = scored[0]?.it;
        if (!hit) return null;
        return {
            id: hit.id,
            name: hit.name,
            artist: (hit.artists || []).map((a: any) => a.name).join(", "),
            album: hit.album?.name || "",
            image: hit.album?.images?.[0]?.url || "",
            durationMs: hit.duration_ms || 0,
            preview: hit.preview_url || null,
            url: hit.external_urls?.spotify || "",
        };
    } catch {
        return null;
    }
}
