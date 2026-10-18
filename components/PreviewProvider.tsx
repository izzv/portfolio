"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useExperience } from "./ExperienceProvider";

/**
 * One shared <audio> element for the whole site.
 *
 * The clips are 30s store previews. They are positioned inside the song (see
 * `Preview.offsetMs` in lib/lastfm.ts), so a clip can be lined up with whatever
 * the owner is playing right now: press play at 1:24 and the clip starts 54s
 * into itself, which is 1:24 of the song. Everything that shows playback — the
 * music page, the header lyrics — reads this clock instead of guessing.
 *
 * It is deliberately mounted above the router so navigating between pages does
 * not stop the audio; a visitor can start a clip on /music, walk to the home
 * page, and the lyrics there stay on the line they are hearing.
 */

export type PreviewTrack = {
    key: string;
    name: string;
    artist: string;
    image: string;
    source: string;
    /** song position where the clip begins, ms */
    offsetMs: number;
    /** clip length, ms */
    previewMs: number;
    /** the store hit looked like the same recording, not a cover */
    matched: boolean;
};

export type PreviewStatus = "idle" | "loading" | "playing" | "paused" | "error";

export function trackKey(track: { name: string; artist: string }): string {
    return `${track.artist}\u0000${track.name}`.toLowerCase();
}

type Ctx = {
    track: PreviewTrack | null;
    status: PreviewStatus;
    error: string | null;
    /** playback position inside the clip, ms */
    positionMs: number;
    /** Date.now() the position was read at, for smooth interpolation */
    positionAt: number;
    /** clip length, ms */
    durationMs: number;
    playing: boolean;
    /** song position the clip is currently at, ms */
    songMs: number;
    /** true when the clip was started at the live playback position */
    aligned: boolean;
    play: (
        item: { name: string; artist: string; image?: string },
        opts?: { onEnded?: () => void },
    ) => Promise<void>;
    toggle: () => void;
    stop: () => void;
};

const PreviewCtx = createContext<Ctx | null>(null);

export function usePreview(): Ctx {
    const v = useContext(PreviewCtx);
    if (!v) throw new Error("usePreview must be used within PreviewProvider");
    return v;
}

function livePositionMs(now: {
    isPlaying: boolean;
    progressMs?: number;
    fetchedAt?: number;
} | null): number | null {
    if (!now?.isPlaying || typeof now.progressMs !== "number") return null;
    const at = now.fetchedAt ?? Date.now();
    return now.progressMs + Math.max(0, Date.now() - at);
}

function clamp(v: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, v));
}

export default function PreviewProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const { now } = useExperience();
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const nowRef = useRef(now);
    nowRef.current = now;

    const [track, setTrack] = useState<PreviewTrack | null>(null);
    const [status, setStatus] = useState<PreviewStatus>("idle");
    const [error, setError] = useState<string | null>(null);
    const [aligned, setAligned] = useState(false);
    const [timing, setTiming] = useState({ positionMs: 0, at: Date.now() });
    const [durationMs, setDurationMs] = useState(30_000);

    const trackRef = useRef<PreviewTrack | null>(null);
    trackRef.current = track;
    const onEndedRef = useRef<(() => void) | null>(null);
    const requestRef = useRef(0);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const read = () => {
            setTiming({
                positionMs: Math.round(audio.currentTime * 1000),
                at: Date.now(),
            });
        };
        const onPlay = () => setStatus("playing");
        const onPause = () => {
            setStatus((s) => (s === "error" ? s : "paused"));
            read();
        };
        const onDuration = () => {
            if (Number.isFinite(audio.duration) && audio.duration > 0)
                setDurationMs(Math.round(audio.duration * 1000));
        };
        const onEnded = () => {
            read();
            setStatus("paused");
            const cb = onEndedRef.current;
            onEndedRef.current = null;
            cb?.();
        };
        const onError = () => {
            // An interrupted src swap also fires `error`; ignore those.
            if (!audio.src) return;
            setStatus("error");
            setError("could not play that preview");
        };

        audio.addEventListener("play", onPlay);
        audio.addEventListener("pause", onPause);
        audio.addEventListener("timeupdate", read);
        audio.addEventListener("loadedmetadata", onDuration);
        audio.addEventListener("durationchange", onDuration);
        audio.addEventListener("ended", onEnded);
        audio.addEventListener("error", onError);

        const tick = setInterval(() => {
            if (!audio.paused) read();
        }, 200);

        return () => {
            clearInterval(tick);
            audio.pause();
            audio.removeEventListener("play", onPlay);
            audio.removeEventListener("pause", onPause);
            audio.removeEventListener("timeupdate", read);
            audio.removeEventListener("loadedmetadata", onDuration);
            audio.removeEventListener("durationchange", onDuration);
            audio.removeEventListener("ended", onEnded);
            audio.removeEventListener("error", onError);
            audio.removeAttribute("src");
            audio.load();
            audioRef.current = null;
        };
    }, []);

    const play = useCallback(
        async (
            item: { name: string; artist: string; image?: string },
            opts?: { onEnded?: () => void },
        ) => {
            const audio = audioRef.current;
            if (!audio || !item.name) return;
            onEndedRef.current = opts?.onEnded ?? null;

            const key = trackKey(item);
            const current = trackRef.current;
            if (current?.key === key && audio.src) {
                if (audio.paused) {
                    try {
                        await audio.play();
                    } catch {
                        setStatus("error");
                        setError("the browser blocked playback");
                    }
                }
                return;
            }

            const token = ++requestRef.current;
            setStatus("loading");
            setError(null);
            setAligned(false);
            setTiming({ positionMs: 0, at: Date.now() });
            setTrack({
                key,
                name: item.name,
                artist: item.artist,
                image: item.image || "",
                source: "",
                offsetMs: 0,
                previewMs: 30_000,
                matched: false,
            });

            let data: {
                audio?: string | null;
                name?: string;
                artist?: string;
                image?: string;
                source?: string;
                offsetMs?: number;
                previewMs?: number;
                matched?: boolean;
                error?: string;
            } | null = null;
            try {
                const res = await fetch(
                    `/api/play?artist=${encodeURIComponent(item.artist)}&track=${encodeURIComponent(item.name)}`,
                    { cache: "no-store" },
                );
                data = await res.json();
            } catch {
                data = null;
            }
            if (token !== requestRef.current) return;
            if (!data?.audio) {
                setStatus("error");
                setError(
                    data?.error === "missing params"
                        ? "no preview for that track"
                        : "no preview for that track",
                );
                return;
            }

            const offsetMs =
                typeof data.offsetMs === "number" && data.offsetMs >= 0
                    ? data.offsetMs
                    : 0;
            const previewMs =
                typeof data.previewMs === "number" && data.previewMs > 0
                    ? data.previewMs
                    : 30_000;
            setDurationMs(previewMs);
            setTrack({
                key,
                name: data.name || item.name,
                artist: data.artist || item.artist,
                image: data.image || item.image || "",
                source: data.source || "",
                offsetMs,
                previewMs,
                matched: data.matched !== false,
            });

            // Line the clip up with live playback when this is the track that is
            // playing. Outside the clip window there is nothing to align to, so
            // it starts at the beginning of the preview instead.
            const live = livePositionMs(nowRef.current);
            const canAlign =
                live != null &&
                offsetMs > 0 &&
                live >= offsetMs &&
                live <= offsetMs + previewMs - 400;
            const startMs = canAlign ? (live as number) - offsetMs : 0;
            setAligned(canAlign);

            audio.src = data.audio;
            const seek = () => {
                if (startMs > 0) {
                    try {
                        audio.currentTime = startMs / 1000;
                    } catch {}
                }
            };
            audio.addEventListener("loadedmetadata", seek, { once: true });
            try {
                await audio.play();
                if (startMs > 0 && audio.readyState >= 1) seek();
            } catch {
                if (token === requestRef.current) {
                    setStatus("error");
                    setError("the browser blocked playback");
                }
            }
        },
        [],
    );

    const toggle = useCallback(() => {
        const audio = audioRef.current;
        if (!audio || !audio.src) return;
        if (audio.paused) {
            audio.play().catch(() => {
                setStatus("error");
                setError("the browser blocked playback");
            });
        } else {
            audio.pause();
        }
    }, []);

    const stop = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;
        requestRef.current += 1;
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
        onEndedRef.current = null;
        setTrack(null);
        setStatus("idle");
        setError(null);
        setAligned(false);
        setTiming({ positionMs: 0, at: Date.now() });
    }, []);

    // A clip started against live playback has done its job once that track
    // stops being the one playing; leaving it running would narrate a song the
    // header no longer shows.
    useEffect(() => {
        if (status !== "playing" || !aligned || !track) return;
        if (now?.name && track.key !== trackKey(now)) stop();
    }, [now?.name, now?.artist, status, aligned, track, stop]);

    const value = useMemo<Ctx>(() => {
        const playing = status === "playing";
        const songMs = (track?.offsetMs ?? 0) + timing.positionMs;
        return {
            track,
            status,
            error,
            positionMs: timing.positionMs,
            positionAt: timing.at,
            durationMs,
            playing,
            songMs,
            aligned,
            play,
            toggle,
            stop,
        };
    }, [
        track,
        status,
        error,
        timing,
        durationMs,
        aligned,
        play,
        toggle,
        stop,
    ]);

    // A real element (not `new Audio()`) so it is one node, visible to
    // devtools and to anything that wants to read the playback position.
    return (
        <PreviewCtx.Provider value={value}>
            <audio ref={audioRef} preload="auto" className="hidden" />
            {children}
        </PreviewCtx.Provider>
    );
}

/** ms → `m:ss` */
export function clock(ms: number): string {
    const total = Math.max(0, Math.round(ms / 1000));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
}
