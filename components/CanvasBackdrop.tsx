"use client";

import { useEffect, useRef, useState } from "react";
import { useExperience } from "./ExperienceProvider";

/**
 * Full-bleed background video for the track that is playing right now.
 *
 * `now.canvasUrl` only exists while Spotify reports playback and the track has
 * a Canvas, so with nothing playing this renders nothing and the blossom
 * background stays in place. The video is decorative: muted, looped, hidden
 * from reduced-motion users, paused while the tab is hidden, and every failure
 * path (blocked autoplay, 404, decode error) just leaves the normal background.
 */
export default function CanvasBackdrop() {
    const { now } = useExperience();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [on, setOn] = useState(false);
    const [enabled, setEnabled] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        const sync = () => setEnabled(!mq.matches);
        sync();
        mq.addEventListener("change", sync);
        return () => mq.removeEventListener("change", sync);
    }, []);

    const want = enabled && now?.isPlaying ? now.canvasUrl ?? null : null;

    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;

        if (!want) {
            setOn(false);
            const t = setTimeout(() => {
                v.pause();
                v.removeAttribute("src");
                v.load();
            }, 900);
            return () => clearTimeout(t);
        }

        if (v.getAttribute("src") !== want) {
            setOn(false);
            v.src = want;
            v.load();
        }

        let cancelled = false;
        const show = () => {
            if (cancelled) return;
            v.muted = true;
            v.play().catch(() => {});
            setOn(true);
        };
        if (v.readyState >= 2) show();
        else v.addEventListener("canplay", show, { once: true });

        return () => {
            cancelled = true;
            v.removeEventListener("canplay", show);
        };
    }, [want]);

    // Don't decode video for a tab nobody is looking at.
    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;
        const onVisibility = () => {
            if (document.visibilityState === "hidden") {
                v.pause();
            } else if (on) {
                v.play().catch(() => {});
            }
        };
        document.addEventListener("visibilitychange", onVisibility);
        return () =>
            document.removeEventListener("visibilitychange", onVisibility);
    }, [on]);

    return (
        <div
            className={`canvas-backdrop${on ? " is-on" : ""}`}
            aria-hidden="true"
        >
            <video
                ref={videoRef}
                className="canvas-video"
                muted
                loop
                playsInline
                preload="auto"
                tabIndex={-1}
            />
            <span className="canvas-scrim" />
        </div>
    );
}
