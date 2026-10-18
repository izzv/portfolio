"use client";

import { useEffect, useState } from "react";

function cyrb53(str: string, seed = 0): string {
    let h1 = 0xdeadbeef ^ seed;
    let h2 = 0x41c6ce57 ^ seed;
    for (let i = 0; i < str.length; i++) {
        const ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 =
        Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
        Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 =
        Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
        Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0))
        .toString(16)
        .padStart(16, "0");
}

function canvasSignal(): string {
    try {
        const c = document.createElement("canvas");
        const ctx = c.getContext("2d");
        if (!ctx) return "no-canvas";
        ctx.textBaseline = "top";
        ctx.font = "14px 'Arial'";
        ctx.fillStyle = "#f60";
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = "#069";
        ctx.fillText("ryan-fp-\u26a1", 2, 15);
        ctx.fillStyle = "rgba(102,204,0,0.7)";
        ctx.fillText("ryan-fp-\u26a1", 4, 17);
        return c.toDataURL();
    } catch {
        return "canvas-err";
    }
}

function deviceFingerprint(): string {
    const n = navigator;
    const s = screen;
    const parts = [
        n.userAgent,
        n.language,
        (n.languages || []).join(","),
        (n as any).platform || "",
        String((n as any).hardwareConcurrency || 0),
        String((n as any).deviceMemory || 0),
        String((n as any).maxTouchPoints || 0),
        `${s.width}x${s.height}x${s.colorDepth}`,
        String(window.devicePixelRatio || 1),
        Intl.DateTimeFormat().resolvedOptions().timeZone || "",
        String(new Date().getTimezoneOffset()),
        canvasSignal(),
    ];
    return cyrb53(parts.join("|"));
}

function getDeviceId(): string {
    try {
        const stored = localStorage.getItem("ryan-device-id");
        if (stored) return stored;
        const id = deviceFingerprint();
        localStorage.setItem("ryan-device-id", id);
        return id;
    } catch {
        return deviceFingerprint();
    }
}

export default function Views() {
    const [count, setCount] = useState<string>("\u00B7\u00B7\u00B7");

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const deviceId = getDeviceId();
                const res = await fetch("/api/views", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ deviceId }),
                    cache: "no-store",
                });
                const data = await res.json();
                if (!cancelled && typeof data?.views === "number") {
                    setCount(data.views.toLocaleString());
                }
            } catch {
                try {
                    const res = await fetch("/api/views", {
                        method: "GET",
                        cache: "no-store",
                    });
                    const data = await res.json();
                    if (!cancelled && typeof data?.views === "number")
                        setCount(data.views.toLocaleString());
                } catch {}
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div className="fixed right-4 bottom-16 sm:bottom-4 z-40">
            <div
                className="relative inline-flex items-center gap-1.5 rounded-md h-6 px-2.5 text-[0.65rem] text-white/55 cursor-default"
                style={{
                    background: "rgba(20, 20, 22, 0.45)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    boxShadow:
                        "inset 0px 0px 0px 1px rgba(255,255,255,0.04), inset 0px 1px 0px rgba(255,255,255,0.10), 0 8px 18px -8px rgba(0,0,0,0.5)",
                }}
            >
                <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white/45 shrink-0"
                >
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                </svg>
                <span
                    className={
                        count === "\u00B7\u00B7\u00B7"
                            ? "text-white/30"
                            : "text-white/55"
                    }
                >
                    {count}
                </span>
                <span className="hidden sm:inline text-white/30">views</span>
            </div>
        </div>
    );
}
