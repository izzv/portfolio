"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { site } from "@/lib/site";

export type Now = {
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
    canvasUrl?: string;
};

export type Lanyard = {
    id: string;
    username: string;
    globalName?: string;
    avatar: string | null;
    status: string;
} | null;

export type RGB = [number, number, number];

type Ctx = {
    now: Now | null;
    lanyard: Lanyard;
    discordId: string;
    avatarUrl: string | null;
    playing: boolean;
    palette: RGB[];
    primary: RGB;
    secondary: RGB;
};

const ExperienceCtx = createContext<Ctx | null>(null);

export function useExperience() {
    const v = useContext(ExperienceCtx);
    if (!v)
        throw new Error("useExperience must be used within ExperienceProvider");
    return v;
}

const DISCORD_ID = site.socials.discord.split("/").filter(Boolean).pop() || "";
const proxied = (u: string) => `/api/img?url=${encodeURIComponent(u)}`;

const FALLBACK_PALETTE: RGB[] = [
    [64, 77, 89],
    [89, 78, 60],
    [60, 66, 78],
    [48, 56, 73],
    [90, 83, 67],
];

function defaultAvatar(id: string): string | null {
    try {
        const idx = Number((BigInt(id) >> 22n) % 6n);
        return `https://cdn.discordapp.com/embed/avatars/${idx}.png`;
    } catch {
        return null;
    }
}

function extractPalette(img: HTMLImageElement): RGB[] {
    try {
        const S = 36;
        const canvas = document.createElement("canvas");
        canvas.width = S;
        canvas.height = S;
        const ctx = canvas.getContext("2d");
        if (!ctx) return [];
        ctx.drawImage(img, 0, 0, S, S);
        const d = ctx.getImageData(0, 0, S, S).data;
        const buckets = new Map<
            string,
            { n: number; r: number; g: number; b: number; score: number }
        >();
        for (let i = 0; i < d.length; i += 4) {
            if (d[i + 3] < 128) continue;
            const r = d[i];
            const g = d[i + 1];
            const b = d[i + 2];
            const lum = (r + g + b) / 3;
            if (lum < 12 || lum > 248) continue;
            const mx = Math.max(r, g, b);
            const mn = Math.min(r, g, b);
            const sat = mx === 0 ? 0 : (mx - mn) / mx;
            const key = `${r >> 4}-${g >> 4}-${b >> 4}`;
            const e = buckets.get(key) || { n: 0, r: 0, g: 0, b: 0, score: 0 };
            e.n += 1;
            e.r += r;
            e.g += g;
            e.b += b;
            e.score += 1 + sat * 2.2;
            buckets.set(key, e);
        }
        const arr = [...buckets.values()]
            .map((e) => ({
                r: Math.round(e.r / e.n),
                g: Math.round(e.g / e.n),
                b: Math.round(e.b / e.n),
                score: e.score,
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 22);
        return arr.map((c) => [c.r, c.g, c.b] as RGB);
    } catch {
        return [];
    }
}

export default function ExperienceProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [now, setNow] = useState<Now | null>(null);
    const [lanyard, setLanyard] = useState<Lanyard>(null);
    const [palette, setPalette] = useState<RGB[]>(FALLBACK_PALETTE);

    useEffect(() => {
        let on = true;
        const load = async () => {
            try {
                const n = await (
                    await fetch("/api/nowplaying", { cache: "no-store" })
                ).json();
                if (!on) return;
                setNow((prev) => {
                    if (!n?.name) return prev;
                    if (
                        prev &&
                        prev.name === n.name &&
                        prev.artist === n.artist &&
                        prev.isPlaying === n.isPlaying &&
                        prev.image === n.image
                    ) {
                        return {
                            ...prev,
                            progressMs: n.progressMs,
                            fetchedAt: n.fetchedAt ?? prev.fetchedAt,
                            // keep a canvas that already arrived if this poll
                            // raced the track lookup
                            canvasUrl: n.canvasUrl ?? prev.canvasUrl,
                        };
                    }
                    return n;
                });
            } catch {}
        };
        // 2s while the tab is visible so a track change lands quickly, 15s
        // when it is backgrounded so a stale tab doesn't poll for nothing.
        const visibleDelay = 2000;
        const hiddenDelay = 15000;
        let timer: ReturnType<typeof setTimeout> | null = null;
        const schedule = (delay: number) => {
            if (timer) clearTimeout(timer);
            timer = setTimeout(async () => {
                await load();
                if (!on) return;
                schedule(
                    document.visibilityState === "visible"
                        ? visibleDelay
                        : hiddenDelay,
                );
            }, delay);
        };
        const onVisible = () => {
            if (document.visibilityState === "visible") {
                load();
                schedule(visibleDelay);
            } else {
                schedule(hiddenDelay);
            }
        };
        load();
        schedule(visibleDelay);
        document.addEventListener("visibilitychange", onVisible);
        window.addEventListener("focus", onVisible);
        return () => {
            on = false;
            if (timer) clearTimeout(timer);
            document.removeEventListener("visibilitychange", onVisible);
            window.removeEventListener("focus", onVisible);
        };
    }, []);

    useEffect(() => {
        if (!DISCORD_ID) return;
        let on = true;
        const load = async () => {
            try {
                const r = await (
                    await fetch(
                        `https://api.lanyard.rest/v1/users/${DISCORD_ID}`,
                        { cache: "no-store" },
                    )
                ).json();
                if (on && r?.success && r.data?.discord_user) {
                    const u = r.data.discord_user;
                    setLanyard({
                        id: u.id,
                        username: u.username,
                        globalName: u.global_name || undefined,
                        avatar: u.avatar ?? null,
                        status: r.data.discord_status || "offline",
                    });
                }
            } catch {}
        };
        load();
        const id = setInterval(load, 30000);
        return () => {
            on = false;
            clearInterval(id);
        };
    }, []);

    const playing = !!now?.isPlaying;
    const avatarUrl = lanyard?.avatar
        ? `https://cdn.discordapp.com/avatars/${lanyard.id}/${lanyard.avatar}.${lanyard.avatar.startsWith("a_") ? "gif" : "png"}?size=256`
        : defaultAvatar(DISCORD_ID);

    const source = playing && now?.image ? now.image : avatarUrl;

    useEffect(() => {
        if (!source) return;
        let cancelled = false;
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = proxied(source);
        img.onload = () => {
            if (cancelled) return;
            const p = extractPalette(img);
            if (p.length) setPalette(p);
        };
        return () => {
            cancelled = true;
        };
    }, [source]);

    const primary = palette[0] ?? FALLBACK_PALETTE[0];
    const secondary = palette[1] ?? palette[0] ?? FALLBACK_PALETTE[1];

    const value = useMemo<Ctx>(
        () => ({
            now,
            lanyard,
            discordId: DISCORD_ID,
            avatarUrl,
            playing,
            palette,
            primary,
            secondary,
        }),
        [now, lanyard, avatarUrl, playing, palette, primary, secondary],
    );

    return (
        <ExperienceCtx.Provider value={value}>
            {children}
        </ExperienceCtx.Provider>
    );
}
