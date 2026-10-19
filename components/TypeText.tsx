"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Text that builds itself in real time.
 *
 * - `type`    — letters appear one by one behind a caret
 * - `scramble` — random glyphs settle into the real letters, left to right
 *
 * The full string is always in the accessibility tree via `aria-label`, so the
 * animation never changes what a screen reader hears. Reduced motion renders
 * the final text straight away.
 */

export type TextEffect = "none" | "type" | "scramble";

const GLYPHS = "abcdefghijklmnopqrstuvwxyz0123456789/\\<>=+*#";

function reducedMotion(): boolean {
    try {
        return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
        return false;
    }
}

export default function TypeText({
    text,
    mode = "none",
    /** characters per second for `type`; `scramble` uses it as its frame rate */
    speed = 28,
    /** ms before the animation starts */
    delay = 0,
    className,
}: {
    text: string;
    mode?: TextEffect;
    speed?: number;
    delay?: number;
    className?: string;
}) {
    const chars = useMemo(() => Array.from(text), [text]);
    const [shown, setShown] = useState(() => (mode === "none" ? text : ""));
    const [typing, setTyping] = useState(false);
    const frame = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        setShown(mode === "none" ? text : "");
        setTyping(false);
        if (mode === "none" || !text) return;
        if (reducedMotion()) {
            setShown(text);
            return;
        }

        const rate = Math.max(6, speed);
        const step = Math.max(16, Math.round(1000 / rate));
        let i = 0;
        let started = false;

        const start = () => {
            started = true;
            setTyping(true);
            frame.current = setInterval(() => {
                i += 1;
                if (mode === "type") {
                    setShown(chars.slice(0, i).join(""));
                } else {
                    // scramble: settle the first i chars, randomise the next
                    // few, leave the rest blank until reachable
                    const settled = chars.slice(0, Math.max(0, i - 2)).join("");
                    const noise = chars
                        .slice(Math.max(0, i - 2), i)
                        .map(() => GLYPHS[Math.floor(Math.random() * GLYPHS.length)])
                        .join("");
                    setShown(settled + noise);
                }
                if (i >= chars.length) {
                    if (frame.current) clearInterval(frame.current);
                    frame.current = null;
                    setShown(text);
                    setTyping(false);
                }
            }, step);
        };

        const wait = started ? null : setTimeout(start, Math.max(0, delay));
        return () => {
            if (wait) clearTimeout(wait);
            if (frame.current) clearInterval(frame.current);
            frame.current = null;
        };
    }, [text, mode, speed, delay, chars]);

    if (mode === "none") {
        return <span className={className}>{text}</span>;
    }

    return (
        <span className={className} aria-label={text}>
            <span aria-hidden="true">{shown}</span>
            {typing && mode === "type" && (
                <span className="type-caret" aria-hidden="true" />
            )}
        </span>
    );
}
