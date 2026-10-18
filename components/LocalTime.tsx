"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/site";

function fmt(date: Date, tz?: string, hour12 = true): string {
    try {
        return new Intl.DateTimeFormat("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            hour12,
            timeZone: tz,
        }).format(date);
    } catch {
        return new Intl.DateTimeFormat("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            hour12,
        }).format(date);
    }
}

export default function LocalTime() {
    const [now, setNow] = useState<Date | null>(null);
    const [hour12, setHour12] = useState<boolean>(true);

    useEffect(() => {
        setNow(new Date());
        const id = setInterval(() => setNow(new Date()), 15000);
        try {
            const opts = Intl.DateTimeFormat().resolvedOptions();
            if (typeof opts.hour12 === "boolean") {
                setHour12(opts.hour12);
            }
        } catch {}
        return () => clearInterval(id);
    }, []);

    const yours = now ? fmt(now, undefined, hour12) : "--:--";
    const mine = now ? fmt(now, site.timezone, hour12) : "--:--";

    return (
        <p className="text-xs text-white/60 leading-relaxed">
            i&#x27;ll get back to you. your{" "}
            <span className="rounded-[5px] bg-white/[0.08] px-1.5 py-0.5 text-white/90 tabular-nums">
                {yours}
            </span>{" "}
            is my{" "}
            <span className="rounded-[5px] bg-white/[0.08] px-1.5 py-0.5 text-white/90 tabular-nums">
                {mine}
            </span>
        </p>
    );
}
