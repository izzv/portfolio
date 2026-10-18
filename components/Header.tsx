"use client";

import { useEffect, useRef, useState } from "react";
import { useExperience, type RGB } from "./ExperienceProvider";
import DiscordAvatar from "./DiscordAvatar";
import { site } from "@/lib/site";

type Line = { t: number; text: string };

function bright([r, g, b]: RGB): string {
    const mx = Math.max(r, g, b) || 1;
    const boost = Math.min(1.9, 235 / mx);
    const lift = (v: number) =>
        Math.min(255, Math.round(Math.max(v * boost, v + 40)));
    return `rgb(${lift(r)},${lift(g)},${lift(b)})`;
}

export default function Header() {
    const { now, lanyard, discordId, primary, secondary } = useExperience();
    const [lines, setLines] = useState<Line[]>([]);
    const [idx, setIdx] = useState(0);
    const timer = useRef<ReturnType<typeof setInterval> | null>(null);
    const handle = lanyard?.username
        ? `@${lanyard.username}`
        : site.socials.discordHandle
          ? `@${site.socials.discordHandle}`
          : "discord";
    const discordUrl = discordId
        ? `https://discord.com/users/${discordId}`
        : "#";

    const spotifySearch = (q: string) =>
        `https://open.spotify.com/search/${encodeURIComponent(q)}`;
    const trackUrl =
        now?.spotifyUrl ||
        (now?.name ? spotifySearch(`${now.name} ${now.artist}`) : "#");
    const artistUrl = now?.artist ? spotifySearch(now.artist) : "#";

    const gradStyle = {
        backgroundImage: `linear-gradient(90deg, ${bright(primary)}, ${bright(secondary)})`,
        WebkitBackgroundClip: "text" as const,
        backgroundClip: "text" as const,
        color: "transparent",
        WebkitTextFillColor: "transparent" as const,
    };

    useEffect(() => {
        if (!now?.name) return;
        let active = true;
        setLines([]);
        setIdx(0);
        (async () => {
            try {
                const ly = await (
                    await fetch(
                        `/api/lyrics?artist=${encodeURIComponent(now.artist)}&track=${encodeURIComponent(now.name)}&album=${encodeURIComponent(now.album || "")}&spotifyId=${encodeURIComponent(now.spotifyId || "")}`,
                        { cache: "no-store" },
                    )
                ).json();
                if (active && ly?.lines?.length) setLines(ly.lines);
            } catch {}
        })();
        return () => {
            active = false;
        };
    }, [now?.name, now?.artist, now?.album]);

    useEffect(() => {
        if (!lines.length) return;
        const synced =
            typeof now?.progressMs === "number" &&
            typeof now?.fetchedAt === "number";
        if (synced && now?.isPlaying) {
            const tick = () => {
                const pos =
                    (now.progressMs! + (Date.now() - now.fetchedAt!)) / 1000;
                let i = 0;
                for (let k = 0; k < lines.length; k++) {
                    if (lines[k].t <= pos) i = k;
                    else break;
                }
                setIdx(i);
            };
            tick();
            timer.current = setInterval(tick, 350);
        } else {
            timer.current = setInterval(
                () => setIdx((i) => (i + 1) % lines.length),
                3200,
            );
        }
        return () => {
            if (timer.current) clearInterval(timer.current);
        };
    }, [lines, now?.progressMs, now?.fetchedAt, now?.isPlaying]);

    return (
        <div className="relative w-full">
            <div className="space-y-1">
                <div className="flex items-center gap-2 text-white/70">
                    <span className="h-[1px] w-4 bg-white/50" />
                    <span className="text-xs font-light tracking-wider">
                        {site.greeting}
                    </span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-white">
                    <span className="relative">{site.name}</span>
                </h1>
                <div className="flex items-center gap-1.5 -mt-1">
                    <a
                        href={discordUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-white/60 text-xs transition-colors hover:text-white/90"
                    >
                        <DiscordAvatar size={18} />
                        <span>{handle}</span>
                    </a>
                </div>
            </div>

            {now?.name && (
                <div className="absolute right-0 bottom-0 flex w-[60%] flex-col items-end gap-1.5">
                    {lines.length > 0 && (
                        <div className="w-full overflow-hidden text-right">
                            <div key={idx} className="lyric-shift">
                                <div className="h-4 truncate text-[11px] leading-4 text-white/25">
                                    {lines[idx - 1]?.text || ""}
                                </div>
                                <div className="truncate text-[11px] font-semibold leading-4 text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]">
                                    {lines[idx]?.text || ""}
                                </div>
                                <div className="h-4 truncate text-[11px] leading-4 text-white/25">
                                    {lines[idx + 1]?.text || ""}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="group relative flex max-w-full items-center gap-1.5 overflow-hidden text-xs text-white/45">
                        <span
                            role="tooltip"
                            className="pointer-events-none absolute bottom-full right-0 mb-2 max-w-[280px] truncate rounded-lg border border-white/10 bg-[rgba(10,10,12,0.96)] px-2.5 py-1.5 text-xs font-medium opacity-0 translate-y-1 shadow-[0_10px_28px_-12px_rgba(0,0,0,0.9)] transition-all duration-150 group-hover:opacity-100 group-hover:translate-y-0 z-50"
                        >
                            <span className="text-white">{now.name}</span>
                            <span className="text-white/45"> · </span>
                            <span className="text-white/70">{now.artist}</span>
                        </span>
                        {now.image && (
                            <img
                                src={now.image}
                                alt=""
                                width={20}
                                height={20}
                                className="block shrink-0"
                                style={{
                                    width: 20,
                                    height: 20,
                                    aspectRatio: "1 / 1",
                                    objectFit: "cover",
                                    borderRadius: 6,
                                    boxShadow:
                                        "inset 0 0 0 1px rgba(255,255,255,0.15), 0 2px 6px -2px rgba(0,0,0,0.7)",
                                }}
                            />
                        )}
                        <span className="truncate">
                            {now.isPlaying ? "Listening to " : "Last played "}
                            <a
                                href={trackUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`Open ${now.name} on Spotify`}
                                className="font-semibold underline-offset-2 transition-[text-decoration-color] decoration-transparent hover:decoration-current hover:underline"
                                style={gradStyle}
                            >
                                {now.name}
                            </a>{" "}
                            by{" "}
                            <a
                                href={artistUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`Find ${now.artist} on Spotify`}
                                className="font-medium underline-offset-2 transition-[text-decoration-color] decoration-transparent hover:decoration-current hover:underline"
                                style={gradStyle}
                            >
                                {now.artist}
                            </a>
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
