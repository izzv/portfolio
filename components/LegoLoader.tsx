"use client";

import { useEffect, useState } from "react";

/**
 * The brick-assembly loading screen.
 *
 * Three rows of bricks drop in and snap together, then the whole veil lifts.
 * It is purely decorative: `aria-hidden`, no pointer events and hidden unless
 * the layout's inline script has set `html[data-lego="on"]` (first load of a
 * session, no reduced motion). The component removes itself once the veil has
 * lifted so nothing stays in the DOM.
 */

const ROWS: number[][] = [
    [72, 50, 72, 50],
    [50, 72, 50, 72],
    [64, 58, 64, 58],
];

export default function LegoLoader({
    glow = "rgba(255, 255, 255, 0.12)",
    brick = "rgba(255, 255, 255, 0.26)",
}: {
    /** soft accent light behind the wall */
    glow?: string;
    /** fill for the accent-tinted bricks */
    brick?: string;
}) {
    const [gone, setGone] = useState(false);

    useEffect(() => {
        if (!document.documentElement.hasAttribute("data-lego")) {
            setGone(true);
            return;
        }
        // clear the gate slightly after the CSS veil has finished (2.05s)
        const t = setTimeout(() => {
            document.documentElement.removeAttribute("data-lego");
            setGone(true);
        }, 2050);
        return () => clearTimeout(t);
    }, []);

    if (gone) return null;

    let i = 0;
    return (
        <div
            className="lego-loader"
            aria-hidden="true"
            style={
                {
                    "--lego-glow": glow,
                    "--lego-brick": brick,
                } as React.CSSProperties
            }
        >
            <div className="lego-stage">
                <div className="lego-wall">
                    {ROWS.map((row, r) => (
                        <div className="lego-row" key={r}>
                            {row.map((w, b) => (
                                <span
                                    key={b}
                                    className="lego-brick"
                                    style={
                                        {
                                            "--w": `${w}px`,
                                            "--i": i++,
                                        } as React.CSSProperties
                                    }
                                />
                            ))}
                        </div>
                    ))}
                </div>
                <span className="lego-caption">assembling</span>
            </div>
        </div>
    );
}
