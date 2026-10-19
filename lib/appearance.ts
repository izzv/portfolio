import type { Appearance, AppearanceSpeed } from "./siteConfig";

/**
 * The appearance config turned into CSS custom properties, so one inline style
 * on the page shell drives the card look, the column width and the build-in
 * animation without threading props through every section.
 */

const REVEAL: Record<AppearanceSpeed, { distance: number; blur: number; ms: number }> =
    {
        subtle: { distance: 10, blur: 3, ms: 520 },
        normal: { distance: 18, blur: 5, ms: 640 },
        bold: { distance: 28, blur: 9, ms: 820 },
    };

export function appearanceVars(
    appearance: Appearance,
): Record<string, string> {
    const reveal = REVEAL[appearance.motionSpeed] ?? REVEAL.normal;
    const accent = accentRgb(appearance.accent);
    const strength = Math.min(1, Math.max(0, appearance.accentStrength / 100));
    return {
        // accent tint for the hero banner and card highlights
        "--accent-1": accent
            ? `rgba(${accent.join(", ")}, ${strength.toFixed(2)})`
            : `rgba(255, 255, 255, ${(0.24 * strength).toFixed(2)})`,
        "--accent-2": accent
            ? `rgba(${accentSecondary(accent).join(", ")}, ${(strength * 0.24).toFixed(2)})`
            : "rgba(255, 255, 255, 0.02)",
        // card look
        "--card-tint": (1 - appearance.seeThrough / 100).toFixed(3),
        "--card-blur": `${appearance.blur}px`,
        "--card-radius": `${appearance.radius}px`,
        "--card-pad": `${appearance.cardPad}px`,
        "--card-border": appearance.border
            ? "rgba(255, 255, 255, 0.05)"
            : "transparent",
        "--card-shadow": appearance.cardShadow
            ? "0 18px 50px -28px rgba(0, 0, 0, 0.85)"
            : "none",
        // layout + hero
        "--shell-width": `${appearance.width}px`,
        "--section-pad-extra": `${appearance.spacing}px`,
        "--hero-min": appearance.heroHeight === "compact" ? "auto" : "100dvh",
        "--name-size": `${((1.5 * appearance.nameScale) / 100).toFixed(3)}rem`,
        "--name-tracking": `${appearance.nameTracking}em`,
        // build-in motion
        "--reveal-distance": `${reveal.distance}px`,
        "--reveal-blur": `${reveal.blur}px`,
        "--reveal-ms": `${reveal.ms}ms`,
        "--reveal-stagger": `${appearance.stagger}ms`,
    };
}

/** `#rrggbb` → `[r, g, b]`, or null when there is no override. */
export function accentRgb(accent: string): [number, number, number] | null {
    const match = /^#([0-9a-f]{6})$/i.exec(accent.trim());
    if (!match) return null;
    const value = parseInt(match[1], 16);
    return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

/** A second colour for gradients: same hue, lifted toward white. */
export function accentSecondary(
    [r, g, b]: [number, number, number],
): [number, number, number] {
    const lift = 0.45;
    const to = (v: number) => Math.round(v + (255 - v) * lift);
    return [to(r), to(g), to(b)];
}
