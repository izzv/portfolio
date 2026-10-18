"use client";

import { useEffect, useMemo, useRef } from "react";
import { useExperience, type RGB } from "./ExperienceProvider";

/* ---------- deterministic randomness (SSR-safe) ---------- */

function mulberry32(seed: number) {
    let a = seed >>> 0;
    return () => {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/* ---------- tapered limbs ---------- */

type Pt = [number, number];

function taper(pts: Pt[], widths: number[]): string {
    const left: Pt[] = [];
    const right: Pt[] = [];
    for (let i = 0; i < pts.length; i++) {
        const [x, y] = pts[i];
        const a = pts[Math.max(0, i - 1)];
        const b = pts[Math.min(pts.length - 1, i + 1)];
        const dx = b[0] - a[0];
        const dy = b[1] - a[1];
        const len = Math.hypot(dx, dy) || 1;
        const nx = -dy / len;
        const ny = dx / len;
        const w = widths[i] / 2;
        left.push([x + nx * w, y + ny * w]);
        right.push([x - nx * w, y - ny * w]);
    }
    const f = ([x, y]: Pt) => `${x.toFixed(1)} ${y.toFixed(1)}`;
    return `M${left.map(f).join("L")}L${right.reverse().map(f).join("L")}Z`;
}

const LIMBS = [
    {
        d: taper(
            [
                [1246, 920],
                [1232, 812],
                [1244, 706],
                [1274, 606],
                [1306, 520],
            ],
            [48, 40, 33, 25, 16],
        ),
        tone: 0.94,
    },
    {
        d: taper(
            [
                [1244, 712],
                [1160, 654],
                [1102, 566],
                [1074, 498],
            ],
            [16, 11, 6, 2],
        ),
        tone: 0.9,
    },
    {
        d: taper(
            [
                [1262, 648],
                [1348, 604],
                [1424, 548],
                [1478, 486],
            ],
            [15, 10, 6, 2],
        ),
        tone: 0.9,
    },
    {
        d: taper(
            [
                [1290, 556],
                [1226, 486],
                [1180, 408],
            ],
            [11, 6, 2],
        ),
        tone: 0.85,
    },
    {
        d: taper(
            [
                [1006, 920],
                [996, 820],
                [1014, 716],
                [1048, 612],
                [1078, 540],
            ],
            [36, 29, 23, 16, 9],
        ),
        tone: 0.9,
    },
    {
        d: taper(
            [
                [1012, 726],
                [930, 668],
                [866, 600],
            ],
            [13, 8, 3],
        ),
        tone: 0.86,
    },
    {
        d: taper(
            [
                [1046, 626],
                [972, 546],
                [926, 470],
            ],
            [10, 6, 2],
        ),
        tone: 0.82,
    },
    {
        d: taper(
            [
                [1074, 552],
                [1156, 486],
                [1206, 420],
            ],
            [9, 5, 2],
        ),
        tone: 0.82,
    },
    {
        d: taper(
            [
                [206, 920],
                [232, 830],
                [254, 762],
            ],
            [24, 15, 7],
        ),
        tone: 0.7,
    },
    {
        d: taper(
            [
                [230, 828],
                [146, 776],
                [96, 712],
            ],
            [9, 5, 2],
        ),
        tone: 0.68,
    },
    {
        d: taper(
            [
                [252, 768],
                [344, 706],
                [392, 636],
            ],
            [8, 5, 2],
        ),
        tone: 0.68,
    },
];

/* ---------- blossom masses ---------- */

type Bloom = { cx: number; cy: number; r: number; o: number; tone: string };

const anchor = (x: number, y: number, spread: number, n: number, r: number) => ({
    x,
    y,
    spread,
    n,
    r,
});

const MASSES = {
    far: {
        anchors: [
            anchor(1420, 330, 300, 14, 82),
            anchor(1230, 240, 250, 12, 74),
            anchor(980, 340, 230, 10, 62),
            anchor(1500, 560, 260, 12, 78),
            anchor(820, 520, 220, 9, 54),
        ],
        tone: "#e6e7e8",
        opacity: [0.5, 0.85],
    },
    mid: {
        anchors: [
            anchor(1300, 400, 280, 14, 70),
            anchor(1120, 300, 220, 11, 58),
            anchor(1460, 420, 220, 11, 62),
            anchor(1240, 620, 240, 12, 66),
            anchor(930, 690, 240, 11, 52),
            anchor(700, 430, 200, 10, 46),
            anchor(560, 640, 210, 9, 50),
            anchor(300, 780, 200, 9, 46),
        ],
        tone: "#f7f7f8",
        opacity: [0.72, 1],
    },
    near: {
        anchors: [
            anchor(1380, 300, 200, 9, 52),
            anchor(1180, 470, 190, 9, 48),
            anchor(1480, 660, 190, 8, 56),
            anchor(1080, 800, 220, 9, 58),
            anchor(640, 760, 190, 8, 46),
            anchor(360, 880, 160, 7, 42),
        ],
        tone: "#ffffff",
        opacity: [0.85, 1],
    },
};

function buildBlooms(
    anchors: ReturnType<typeof anchor>[],
    tone: string,
    opacity: [number, number],
    seed: number,
): Bloom[] {
    const rand = mulberry32(seed);
    const out: Bloom[] = [];
    for (const a of anchors) {
        for (let i = 0; i < a.n; i++) {
            out.push({
                cx: a.x + (rand() - 0.5) * a.spread,
                cy: a.y + (rand() - 0.5) * a.spread * 0.62,
                r: a.r * (0.45 + rand() * 0.75),
                o: opacity[0] + rand() * (opacity[1] - opacity[0]),
                tone,
            });
        }
    }
    return out;
}

const FAR_BLOOMS = buildBlooms(MASSES.far.anchors, MASSES.far.tone, [0.5, 0.85], 41);
const MID_BLOOMS = buildBlooms(MASSES.mid.anchors, MASSES.mid.tone, [0.72, 1], 907);
const NEAR_BLOOMS = buildBlooms(MASSES.near.anchors, MASSES.near.tone, [0.85, 1], 5501);

/* ---------- falling petals ---------- */

type Petal = {
    left: number;
    size: number;
    dur: number;
    delay: number;
    drift: number;
    spin: number;
    opacity: number;
};

const PETALS: Petal[] = (() => {
    const rand = mulberry32(2024);
    const out: Petal[] = [];
    for (let i = 0; i < 26; i++) {
        out.push({
            left: rand() * 100,
            size: 5 + rand() * 9,
            dur: 11 + rand() * 14,
            delay: -rand() * 24,
            drift: -90 + rand() * 220,
            spin: 260 + rand() * 540,
            opacity: 0.35 + rand() * 0.5,
        });
    }
    return out;
})();

/* ---------- component ---------- */

export default function BlossomBackground() {
    const { primary, secondary } = useExperience();
    const wrapRef = useRef<HTMLDivElement>(null);
    const frame = useRef(0);

    useEffect(() => {
        const el = wrapRef.current;
        if (!el) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        if (window.matchMedia("(pointer: coarse)").matches) return;

        const onMove = (e: PointerEvent) => {
            if (frame.current) return;
            frame.current = requestAnimationFrame(() => {
                frame.current = 0;
                const x = (e.clientX / window.innerWidth - 0.5) * 2;
                const y = (e.clientY / window.innerHeight - 0.5) * 2;
                el.style.setProperty("--px", x.toFixed(3));
                el.style.setProperty("--py", y.toFixed(3));
            });
        };
        const reset = () => {
            el.style.setProperty("--px", "0");
            el.style.setProperty("--py", "0");
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        window.addEventListener("pointerleave", reset);
        return () => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerleave", reset);
            if (frame.current) cancelAnimationFrame(frame.current);
        };
    }, []);

    const tint = useMemo(() => {
        const c = (v: RGB) => `${v[0]},${v[1]},${v[2]}`;
        return {
            background: `radial-gradient(120% 90% at 18% 12%, rgba(${c(primary)},0.5) 0%, rgba(${c(primary)},0) 62%), radial-gradient(110% 80% at 88% 78%, rgba(${c(secondary)},0.45) 0%, rgba(${c(secondary)},0) 66%)`,
        };
    }, [primary, secondary]);

    return (
        <div className="bb-wrap" aria-hidden="true" ref={wrapRef}>
            <div className="bb-sky" />
            <div className="bb-parallax">
                <svg
                    className="bb-art"
                    viewBox="0 0 1600 900"
                    preserveAspectRatio="xMidYMid slice"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        <linearGradient id="bb-sky-grad" x1="0" y1="0" x2="0.75" y2="1">
                            <stop offset="0" stopColor="#c8cacd" />
                            <stop offset="0.42" stopColor="#e2e3e5" />
                            <stop offset="1" stopColor="#f6f6f7" />
                        </linearGradient>
                        <radialGradient id="bb-storm" cx="0.78" cy="0.02" r="0.72">
                            <stop offset="0" stopColor="#22242a" stopOpacity="0.9" />
                            <stop offset="0.45" stopColor="#4a4e55" stopOpacity="0.42" />
                            <stop offset="1" stopColor="#6f7378" stopOpacity="0" />
                        </radialGradient>
                        <radialGradient id="bb-haze" cx="0.16" cy="0.86" r="0.6">
                            <stop offset="0" stopColor="#ffffff" stopOpacity="0.85" />
                            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
                        </radialGradient>
                        <filter id="bb-soft" x="-25%" y="-25%" width="150%" height="150%">
                            <feGaussianBlur stdDeviation="9" />
                        </filter>
                        <filter id="bb-soft-mid" x="-25%" y="-25%" width="150%" height="150%">
                            <feGaussianBlur stdDeviation="4.5" />
                        </filter>
                        <filter id="bb-soft-near" x="-25%" y="-25%" width="150%" height="150%">
                            <feGaussianBlur stdDeviation="1.6" />
                        </filter>
                    </defs>

                    <rect width="1600" height="900" fill="url(#bb-sky-grad)" />
                    <rect width="1600" height="900" fill="url(#bb-storm)" />
                    <rect width="1600" height="900" fill="url(#bb-haze)" />

                    {/* distant storm clouds */}
                    <g className="bb-clouds" opacity="0.72">
                        <ellipse cx="1290" cy="96" rx="330" ry="118" fill="#2b2e34" filter="url(#bb-soft)" />
                        <ellipse cx="1470" cy="26" rx="260" ry="96" fill="#1e2025" filter="url(#bb-soft)" />
                        <ellipse cx="1010" cy="52" rx="240" ry="72" fill="#5b6067" filter="url(#bb-soft)" />
                    </g>

                    {/* far canopy */}
                    <g className="bb-sway bb-sway-far" filter="url(#bb-soft)" opacity="0.78">
                        {FAR_BLOOMS.map((b, i) => (
                            <circle key={i} cx={b.cx} cy={b.cy} r={b.r} fill={b.tone} opacity={b.o} />
                        ))}
                    </g>

                    {/* tree limbs + mid canopy */}
                    <g className="bb-sway bb-sway-mid">
                        {LIMBS.map((l, i) => (
                            <path key={i} d={l.d} fill="#1c1d21" opacity={l.tone} />
                        ))}
                        <g filter="url(#bb-soft-mid)">
                            {MID_BLOOMS.map((b, i) => (
                                <circle key={i} cx={b.cx} cy={b.cy} r={b.r} fill={b.tone} opacity={b.o} />
                            ))}
                        </g>
                    </g>

                    {/* near blossoms */}
                    <g className="bb-sway bb-sway-near" filter="url(#bb-soft-near)">
                        {NEAR_BLOOMS.map((b, i) => (
                            <circle key={i} cx={b.cx} cy={b.cy} r={b.r} fill={b.tone} opacity={b.o} />
                        ))}
                    </g>

                    {/* twigs poking through the blossom mass */}
                    <g className="bb-sway bb-sway-near" fill="none" stroke="#2a2c31" strokeLinecap="round" opacity="0.72">
                        <path d="M1320 520 C1300 470 1258 452 1210 440" strokeWidth="3" />
                        <path d="M1276 600 C1252 560 1206 546 1160 540" strokeWidth="2.4" />
                        <path d="M1440 600 C1424 556 1390 534 1352 522" strokeWidth="2.6" />
                        <path d="M1104 596 C1082 556 1046 534 1006 524" strokeWidth="2.2" />
                        <path d="M980 690 C950 652 906 640 872 634" strokeWidth="2" />
                    </g>
                </svg>

                <div className="bb-tint" style={tint} />
                <div className="bb-glow" />
            </div>

            <div className="bb-petals">
                {PETALS.map((p, i) => (
                    <span
                        key={i}
                        className="bb-petal"
                        style={
                            {
                                left: `${p.left}%`,
                                width: `${p.size}px`,
                                height: `${p.size * 0.72}px`,
                                opacity: p.opacity,
                                animationDuration: `${p.dur}s`,
                                animationDelay: `${p.delay}s`,
                                "--o": p.opacity,
                                "--drift": `${p.drift}px`,
                                "--spin": `${p.spin}deg`,
                            } as React.CSSProperties
                        }
                    />
                ))}
            </div>

            <div className="bb-scrim" />
            <div className="bb-vignette" />
        </div>
    );
}
