import type { Appearance } from "./siteConfig";

/**
 * One-click looks for /admin → appearance.
 *
 * A preset only replaces the fields it names, so anything it leaves out (the
 * accent, the backdrop) survives the click. `matchPreset` treats the current
 * draft as that preset when every field it sets already matches, which is what
 * lights up the tile and turns the badge from "custom" to the preset name.
 */

export type AppearancePreset = {
    id: string;
    label: string;
    blurb: string;
    /** CSS background for the tile's swatch */
    swatch: string;
    patch: Partial<Appearance>;
};

export const APPEARANCE_PRESETS: AppearancePreset[] = [
    {
        id: "minimal",
        label: "Minimal",
        blurb: "no card, tight type",
        swatch: "linear-gradient(135deg, #fafafa, #52525b)",
        patch: {
            layout: "portfolio",
            card: "none",
            align: "left",
            seeThrough: 100,
            blur: 0,
            radius: 0,
            border: false,
            cardPad: 0,
            cardShadow: false,
            studs: false,
            width: 660,
            spacing: 0,
            heroHeight: "compact",
            avatar: 64,
            nameScale: 110,
            nameTracking: -0.03,
            nameUpper: false,
            textEffect: "none",
            buildStyle: "fade",
            motionSpeed: "subtle",
            stagger: 40,
            accentStrength: 0,
            backdropDim: 35,
        },
    },
    {
        id: "glass",
        label: "Glass",
        blurb: "frosted card, soft blur",
        swatch: "linear-gradient(135deg, #e2e8f0, #475569)",
        patch: {
            layout: "portfolio",
            card: "card",
            align: "left",
            seeThrough: 68,
            blur: 22,
            radius: 16,
            border: true,
            cardPad: 20,
            cardShadow: true,
            studs: false,
            width: 680,
            spacing: 0,
            heroHeight: "full",
            avatar: 72,
            nameScale: 100,
            nameTracking: 0,
            nameUpper: false,
            textEffect: "none",
            buildStyle: "rise",
            motionSpeed: "normal",
            stagger: 65,
            accentStrength: 42,
            backdropDim: 0,
        },
    },
    {
        id: "editorial",
        label: "Editorial",
        blurb: "centered, big name",
        swatch: "linear-gradient(135deg, #f8fafc, #94a3b8)",
        patch: {
            layout: "classic",
            card: "none",
            align: "center",
            width: 720,
            heroHeight: "compact",
            avatar: 96,
            nameScale: 150,
            nameTracking: -0.04,
            nameUpper: false,
            textEffect: "type",
            typeSpeed: 24,
            buildStyle: "fade",
            motionSpeed: "subtle",
            stagger: 50,
            accentStrength: 20,
            backdropDim: 30,
        },
    },
    {
        id: "lego",
        label: "Lego",
        blurb: "bricks, studs, snap-in",
        swatch:
            "repeating-linear-gradient(90deg, #f4f4f5 0 12px, #71717a 12px 24px)",
        patch: {
            layout: "portfolio",
            card: "card",
            seeThrough: 82,
            blur: 10,
            radius: 6,
            border: true,
            cardPad: 18,
            cardShadow: true,
            studs: true,
            legoIntro: true,
            width: 680,
            heroHeight: "full",
            avatar: 72,
            nameScale: 105,
            nameTracking: 0,
            textEffect: "scramble",
            typeSpeed: 28,
            buildStyle: "lego",
            motionSpeed: "normal",
            stagger: 70,
            accentStrength: 42,
        },
    },
    {
        id: "neon",
        label: "Neon",
        blurb: "accent glow, decode",
        swatch: "linear-gradient(135deg, #7c6cff, #5eead4)",
        patch: {
            layout: "modern",
            card: "card",
            align: "left",
            seeThrough: 30,
            blur: 24,
            radius: 14,
            border: true,
            cardPad: 20,
            cardShadow: true,
            studs: false,
            width: 700,
            heroHeight: "full",
            avatar: 64,
            nameScale: 115,
            nameTracking: -0.01,
            nameUpper: false,
            textEffect: "scramble",
            typeSpeed: 32,
            buildStyle: "rise",
            motionSpeed: "bold",
            stagger: 55,
            accent: "#7c6cff",
            accentStrength: 85,
            backdropDim: 45,
        },
    },
];

/** The id of the preset the draft currently matches, or `""` for custom. */
export function matchPreset(look: Appearance): string {
    const current = look as Record<string, unknown>;
    const hit = APPEARANCE_PRESETS.find((preset) =>
        Object.entries(preset.patch).every(
            ([key, value]) => current[key] === value,
        ),
    );
    return hit?.id ?? "";
}
