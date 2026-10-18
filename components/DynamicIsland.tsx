"use client";

import { useEffect, useRef, useState } from "react";
import { useExperience, type RGB } from "./ExperienceProvider";

const WAVE = [
    0.42, 0.7, 0.5, 0.9, 0.62, 1, 0.72, 0.95, 0.55, 0.82, 0.46, 0.74, 0.5, 0.64,
    0.4, 0.58,
];

function vivid([r, g, b]: RGB): string {
    const mx = Math.max(r, g, b) || 1;
    const boost = Math.min(1.75, 220 / mx);
    return `rgb(${Math.min(255, Math.round(r * boost))},${Math.min(255, Math.round(g * boost))},${Math.min(255, Math.round(b * boost))})`;
}

export default function DynamicIsland() {
    const { now, playing, primary } = useExperience();
    const [visible, setVisible] = useState(false);
    const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const show = () => {
        if (hideTimer.current) {
            clearTimeout(hideTimer.current);
            hideTimer.current = null;
        }
        setVisible(true);
    };

    const scheduleHide = () => {
        if (hideTimer.current) clearTimeout(hideTimer.current);
        hideTimer.current = setTimeout(() => setVisible(false), 3000);
    };

    useEffect(
        () => () => {
            if (hideTimer.current) clearTimeout(hideTimer.current);
        },
        [],
    );

    if (!playing || !now?.name) return null;

    const accent = vivid(primary);

    return (
        <div
            className="di-hotspot"
            onMouseEnter={show}
            onMouseLeave={scheduleHide}
        >
            <div
                className="di"
                style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(-12px)",
                    pointerEvents: visible ? "auto" : "none",
                }}
            >
                <span className="di-cover">
                    {now.image ? (
                        <img
                            src={now.image}
                            alt=""
                            style={{
                                animation: "albumpulse 4s ease-in-out infinite",
                            }}
                        />
                    ) : (
                        <span className="di-cover-fallback" />
                    )}
                </span>

                <span className="di-label">
                    <span className="di-label-text">
                        {now.name}
                        {now.artist && (
                            <span className="di-label-artist">
                                {" "}
                                — {now.artist}
                            </span>
                        )}
                    </span>
                </span>

                <span className="di-wave">
                    {WAVE.map((h, i) => (
                        <span
                            key={i}
                            className="di-bar"
                            style={{
                                height: `${Math.round(h * 100)}%`,
                                background: accent,
                                opacity: 0.5 + h * 0.5,
                                transformOrigin: "center",
                                animation: `eqbar ${640 + (i % 5) * 90}ms ease-in-out ${i * 55}ms infinite`,
                            }}
                        />
                    ))}
                </span>
            </div>
        </div>
    );
}
