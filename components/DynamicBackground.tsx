"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useExperience, type RGB } from "./ExperienceProvider";

const STEP = 3.39;
const SPECKS = 60;
const POS_SEED = 1337;
const BASE = "linear-gradient(rgba(6,6,8,0.68), rgba(6,6,8,0.68))";

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

const SPOTS: { x: string; y: string }[] = (() => {
    const rand = mulberry32(POS_SEED);
    const out: { x: string; y: string }[] = [];
    for (let i = 0; i < SPECKS; i++) {
        out.push({
            x: (Math.round(rand() * 29) * STEP).toFixed(2),
            y: (Math.round(rand() * 29) * STEP).toFixed(2),
        });
    }
    return out;
})();

function buildMesh(palette: RGB[]): string {
    if (!palette.length) return BASE;
    const layers: string[] = [BASE];
    for (let i = 0; i < SPECKS; i++) {
        const { x, y } = SPOTS[i];
        const [r, g, b] = palette[i % palette.length];
        layers.push(
            `radial-gradient(circle at ${x}% ${y}%, rgba(${r},${g},${b},0.04) 0%, rgba(${r},${g},${b},0.022) 24%, rgba(${r},${g},${b},0.01) 46%, rgba(${r},${g},${b},0) 78%)`,
        );
    }
    const b1 = palette[0];
    const b2 = palette[1] ?? palette[0];
    const b3 = palette[2] ?? palette[0];
    layers.push(
        `radial-gradient(200% 200% at 50% -20%, rgba(${b1[0]},${b1[1]},${b1[2]},0.12) 0%, rgba(${b1[0]},${b1[1]},${b1[2]},0.084) 20%, rgba(${b1[0]},${b1[1]},${b1[2]},0.036) 40%, rgba(0,0,0,0) 60%)`,
    );
    layers.push(
        `radial-gradient(180% 180% at 15% 50%, rgba(${b2[0]},${b2[1]},${b2[2]},0.08) 0%, rgba(${b2[0]},${b2[1]},${b2[2]},0.048) 30%, rgba(${b2[0]},${b2[1]},${b2[2]},0.016) 50%, rgba(0,0,0,0) 70%)`,
    );
    layers.push(
        `radial-gradient(160% 160% at 85% 50%, rgba(${b3[0]},${b3[1]},${b3[2]},0.05) 0%, rgba(${b3[0]},${b3[1]},${b3[2]},0.035) 25%, rgba(${b3[0]},${b3[1]},${b3[2]},0.015) 45%, rgba(0,0,0,0) 65%)`,
    );
    return layers.join(", ");
}

const WRAP: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    zIndex: -1,
    pointerEvents: "none",
    overflow: "hidden",
    background: "#0a0a0a",
};

const LAYER_BASE: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    transition: "opacity 1600ms ease-in-out",
};

export default function DynamicBackground() {
    const { palette } = useExperience();
    const target = useMemo(() => buildMesh(palette), [palette]);

    const [a, setA] = useState(target);
    const [b, setB] = useState(target);
    const [showA, setShowA] = useState(true);
    const showARef = useRef(true);
    const lastRef = useRef(target);

    useEffect(() => {
        if (target === lastRef.current) return;
        lastRef.current = target;
        if (showARef.current) {
            setB(target);
            showARef.current = false;
            setShowA(false);
        } else {
            setA(target);
            showARef.current = true;
            setShowA(true);
        }
    }, [target]);

    return (
        <div style={WRAP} aria-hidden="true">
            <div
                style={{ ...LAYER_BASE, background: a, opacity: showA ? 1 : 0 }}
            />
            <div
                style={{ ...LAYER_BASE, background: b, opacity: showA ? 0 : 1 }}
            />
        </div>
    );
}
