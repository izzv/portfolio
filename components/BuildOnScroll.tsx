"use client";

import { useEffect } from "react";

/**
 * Finishes blocks marked `data-reveal` as they scroll into view, so the page
 * assembles itself instead of playing every entrance animation off-screen at
 * load.
 *
 * The hidden state lives in `app/build.css` behind `html[data-reveal="on"]`,
 * which the layout only sets when JS is available and motion is welcome.
 */
export default function BuildOnScroll() {
    useEffect(() => {
        if (document.documentElement.dataset.reveal !== "on") return;

        const items = Array.from(
            document.querySelectorAll<HTMLElement>("[data-reveal]"),
        );
        if (!items.length) return;

        // Stagger siblings so a row of cards builds in order instead of all at
        // once. `--reveal-i` is read by the transition-delay in build.css.
        const seen = new Map<Element, number>();
        for (const el of items) {
            const parent = el.parentElement ?? document.body;
            const i = seen.get(parent) ?? 0;
            seen.set(parent, i + 1);
            el.style.setProperty("--reveal-i", String(Math.min(i, 12)));
        }

        const build = (el: Element) => el.classList.add("is-built");

        if (typeof IntersectionObserver === "undefined") {
            items.forEach(build);
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (!entry.isIntersecting) continue;
                    build(entry.target);
                    observer.unobserve(entry.target);
                }
            },
            // Finish a little before the block reaches the very bottom edge.
            { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
        );

        items.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    return null;
}
