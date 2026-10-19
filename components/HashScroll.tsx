"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * A deep link like `/#contact` is resolved by the browser before the music
 * tabs and images have their final height, which can leave the reader a
 * screen or more above the section. Re-align on layout changes until the
 * reader takes over (wheel, touch, key or click).
 */
export default function HashScroll() {
    const pathname = usePathname();

    useEffect(() => {
        if (pathname !== "/") return;
        const id = decodeURIComponent(window.location.hash.slice(1));
        if (!id) return;
        const el = document.getElementById(id);
        if (!el) return;

        let active = true;

        const align = () => {
            if (!active) return;
            if (Math.abs(el.getBoundingClientRect().top) <= 2) return;
            window.scrollTo({
                top: el.getBoundingClientRect().top + window.scrollY,
                behavior: "instant",
            });
        };

        const observer = new ResizeObserver(align);
        observer.observe(document.body);

        const stop = () => {
            active = false;
            observer.disconnect();
            window.removeEventListener("wheel", stop);
            window.removeEventListener("touchstart", stop);
            window.removeEventListener("keydown", stop);
            window.removeEventListener("pointerdown", stop);
        };

        const frame = requestAnimationFrame(align);
        const timers = [120, 700, 1600].map((ms) =>
            window.setTimeout(align, ms),
        );

        window.addEventListener("wheel", stop, { passive: true });
        window.addEventListener("touchstart", stop, { passive: true });
        window.addEventListener("keydown", stop);
        window.addEventListener("pointerdown", stop);

        return () => {
            active = false;
            cancelAnimationFrame(frame);
            timers.forEach((t) => clearTimeout(t));
            observer.disconnect();
            window.removeEventListener("wheel", stop);
            window.removeEventListener("touchstart", stop);
            window.removeEventListener("keydown", stop);
            window.removeEventListener("pointerdown", stop);
        };
    }, [pathname]);

    return null;
}
