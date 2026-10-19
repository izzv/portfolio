"use client";

import { useState } from "react";
import { NAV_ICON_KEYS, navIcon } from "@/lib/navIcons";
import { APPEARANCE_PRESETS, matchPreset } from "@/lib/appearancePresets";
import AppearancePreview from "./AppearancePreview";
import {
    DEFAULT_APPEARANCE,
    NAV_GROUPS,
    type AppearanceLayout,
    type Biolink,
    type Contact,
    type NavItem,
    type SiteConfig,
} from "@/lib/siteConfig";
import {
    AddButton,
    AreaField,
    ChoiceCards,
    ColorField,
    Field,
    IconButton,
    INPUT,
    MoreOptions,
    Pill,
    RowTools,
    Section,
    Segmented,
    Slider,
    Stat,
    TextField,
    Toggle,
} from "./ui";

export type PanelProps = {
    draft: SiteConfig;
    patch: (partial: Partial<SiteConfig>) => void;
};

function moved<T>(list: T[], index: number, dir: -1 | 1): T[] {
    const next = [...list];
    const target = index + dir;
    if (target < 0 || target >= next.length) return list;
    [next[index], next[target]] = [next[target], next[index]];
    return next;
}

function Row({
    children,
    delay = 0,
}: {
    children: React.ReactNode;
    delay?: number;
}) {
    return (
        <li
            className="adm-rise adm-row relative rounded-lg border border-white/[0.06] bg-white/[0.02] p-3"
            style={{ animationDelay: `${delay}ms` }}
        >
            {children}
        </li>
    );
}

/* ---------------------------------------------------------------- overview */

export function OverviewPanel({
    draft,
    stats,
    projects,
    storage,
    savedAt,
    dirty,
    onJump,
    onExport,
    onImport,
    onReset,
}: {
    draft: SiteConfig;
    stats: { views: number; uniqueDevices: number };
    projects: number;
    storage: string;
    savedAt: number | null;
    dirty: boolean;
    onJump: (tab: string) => void;
    onExport: () => void;
    onImport: () => void;
    onReset: () => void;
}) {
    const socialCount = Object.values(draft.socials).filter(Boolean).length;
    const skillsCount = Object.values(draft.skills).reduce(
        (n, list) => n + list.length,
        0,
    );

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                <Stat
                    label="views"
                    value={stats.views}
                    detail="all time"
                    delay={0}
                />
                <Stat
                    label="visitors"
                    value={stats.uniqueDevices}
                    detail="unique devices"
                    delay={60}
                />
                <Stat label="projects" value={projects} detail="listed" delay={120} />
                <Stat
                    label="skills"
                    value={skillsCount}
                    detail={`${Object.keys(draft.skills).length} groups`}
                    delay={180}
                />
            </div>

            <Section
                title="live status"
                description="what the public site is currently serving."
                delay={120}
                badge={
                    <Pill tone={dirty ? "warn" : "good"}>
                        {dirty ? "unsaved draft" : "in sync"}
                    </Pill>
                }
            >
                <div className="grid gap-2.5 sm:grid-cols-2">
                    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                        <div className="text-[10px] uppercase tracking-[0.16em] text-white/35">
                            identity
                        </div>
                        <div className="mt-1 truncate text-sm text-white/85">
                            {draft.name}
                            <span className="text-white/35"> · </span>
                            <span className="text-white/55">{draft.greeting}</span>
                        </div>
                        <p className="mt-0.5 truncate text-[11px] text-white/40">
                            {draft.tagline}
                        </p>
                    </div>
                    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                        <div className="text-[10px] uppercase tracking-[0.16em] text-white/35">
                            links
                        </div>
                        <div className="mt-1 text-sm text-white/85">
                            {draft.biolinks.length} b!o ·{" "}
                            {draft.contacts.length} contacts · {socialCount} socials
                        </div>
                        <p className="mt-0.5 text-[11px] text-white/40">
                            {draft.nav.filter((n) => !n.hidden).length} nav items
                            shown
                        </p>
                    </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Pill>
                        <span className="size-1.5 rounded-full bg-white/50" />
                        storage: {storage}
                    </Pill>
                    <Pill>
                        {savedAt
                            ? `saved ${new Date(savedAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                              })}`
                            : "not saved this session"}
                    </Pill>
                    <Pill>
                        timezone: {draft.timezone}
                    </Pill>
                </div>
            </Section>

            <Section
                title="jump in"
                description="everything is one save away."
                delay={180}
            >
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {[
                        ["profile", "name, greeting, tagline"],
                        ["socials", "discord, github, last.fm"],
                        ["links", "biolinks & contact cards"],
                        ["skills", "sections and pills"],
                        ["nav", "order, labels, icons"],
                        ["commission", "status, price, sponsor"],
                        ["guestbook", "notes and moderation"],
                    ].map(([id, hint]) => (
                        <button
                            key={id}
                            type="button"
                            onClick={() => onJump(id)}
                            className="adm-jump group rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-left transition-[border-color,background,transform] duration-200 hover:-translate-y-px hover:border-white/[0.16] hover:bg-white/[0.05]"
                        >
                            <span className="flex items-center justify-between text-sm text-white/80">
                                {id}
                                <span className="text-white/25 transition-transform duration-200 group-hover:translate-x-0.5">
                                    →
                                </span>
                            </span>
                            <span className="mt-0.5 block text-[10px] text-white/35">
                                {hint}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={onExport}
                        className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-[11px] text-white/70 transition-colors hover:border-white/[0.2] hover:text-white"
                    >
                        ↓ export json
                    </button>
                    <button
                        type="button"
                        onClick={onImport}
                        className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-[11px] text-white/70 transition-colors hover:border-white/[0.2] hover:text-white"
                    >
                        ↑ import json
                    </button>
                    <button
                        type="button"
                        onClick={onReset}
                        className="rounded-md border border-red-400/20 bg-red-400/[0.05] px-2.5 py-1.5 text-[11px] text-red-200/70 transition-colors hover:border-red-400/40 hover:text-red-100"
                    >
                        reset to defaults
                    </button>
                </div>
            </Section>
        </div>
    );
}

/* ----------------------------------------------------------------- profile */

export function ProfilePanel({ draft, patch }: PanelProps) {
    return (
        <div className="flex flex-col gap-4">
            <Section
                title="hero"
                description="the first thing anyone reads."
                delay={0}
            >
                <div className="grid gap-3 sm:grid-cols-2">
                    <TextField
                        label="name"
                        value={draft.name}
                        maxLength={40}
                        placeholder="ryan"
                        onChange={(name) => patch({ name })}
                    />
                    <TextField
                        label="age"
                        type="number"
                        value={draft.age}
                        hint="0 hides it"
                        onChange={(age) => patch({ age: Number(age) || 0 })}
                    />
                    <TextField
                        label="greeting"
                        value={draft.greeting}
                        maxLength={60}
                        placeholder="hey visitor"
                        onChange={(greeting) => patch({ greeting })}
                    />
                    <TextField
                        label="role"
                        value={draft.role}
                        maxLength={60}
                        placeholder="full stack dev"
                        onChange={(role) => patch({ role })}
                    />
                    <TextField
                        label="tagline"
                        value={draft.tagline}
                        maxLength={160}
                        className="sm:col-span-2"
                        onChange={(tagline) => patch({ tagline })}
                    />
                    <TextField
                        label="timezone"
                        value={draft.timezone}
                        hint="IANA name"
                        className="sm:col-span-2"
                        placeholder="America/New_York"
                        onChange={(timezone) => patch({ timezone })}
                    />
                </div>
            </Section>

            <Section
                title="preview"
                description="how the header reads on the home page."
                delay={90}
            >
                <div className="adm-preview relative overflow-hidden rounded-lg border border-white/[0.07] bg-black/30 p-4">
                    <div className="flex items-center gap-2 text-white/70">
                        <span className="h-px w-4 bg-white/50" />
                        <span className="text-xs font-light tracking-wider">
                            {draft.greeting || "hey visitor"}
                        </span>
                    </div>
                    <div className="mt-1 text-2xl font-bold tracking-tight text-white">
                        {draft.name || "your name"}
                    </div>
                    <p className="mt-2 max-w-[85%] text-sm leading-relaxed text-white/70">
                        {draft.age > 0 && (
                            <span className="text-white/90">
                                {draft.age} yo{" "}
                            </span>
                        )}
                        <span className="text-white/90">
                            {draft.role || "what you do"}
                        </span>{" "}
                        {draft.tagline || "your tagline goes here."}
                    </p>
                </div>
            </Section>
        </div>
    );
}

/* -------------------------------------------------------------- appearance */

/**
 * Tiny mock of the hero, drawn in the same order the real one renders.
 *
 * Styled inline on purpose: the admin sheet is a frozen utility snapshot, so a
 * new Tailwind size class here would silently render nothing.
 */
function MockLine({
    w,
    h = 5,
    alpha = 0.22,
    round = 999,
}: {
    w: number | string;
    h?: number;
    alpha?: number;
    round?: number;
}) {
    return (
        <span
            style={{
                display: "block",
                width: w,
                height: h,
                borderRadius: round,
                background: `rgba(255, 255, 255, ${alpha})`,
            }}
        />
    );
}

const LAYOUT_PREVIEW: Record<AppearanceLayout, React.ReactNode> = {
    classic: (
        <span
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
                height: 56,
            }}
        >
            <span
                style={{
                    display: "block",
                    width: 18,
                    height: 18,
                    borderRadius: 999,
                    background: "rgba(255, 255, 255, 0.45)",
                }}
            />
            <MockLine w={48} alpha={0.3} />
            <MockLine w={64} alpha={0.14} />
        </span>
    ),
    modern: (
        <span
            style={{
                display: "flex",
                flexDirection: "column",
                gap: 5,
                height: 56,
            }}
        >
            <MockLine w="100%" h={10} alpha={0.3} round={3} />
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span
                    style={{
                        display: "block",
                        width: 18,
                        height: 18,
                        marginTop: -8,
                        borderRadius: 999,
                        background: "rgba(255, 255, 255, 0.45)",
                    }}
                />
                <MockLine w={44} alpha={0.3} />
            </span>
            <MockLine w={60} alpha={0.14} />
        </span>
    ),
    portfolio: (
        <span
            style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 5,
                height: 56,
            }}
        >
            <MockLine w={48} alpha={0.3} />
            <MockLine w="100%" h={20} alpha={0.14} round={4} />
            <MockLine w={64} alpha={0.14} />
        </span>
    ),
};

export function AppearancePanel({ draft, patch }: PanelProps) {
    const look = draft.appearance;
    const set = (partial: Partial<SiteConfig["appearance"]>) =>
        patch({ appearance: { ...look, ...partial } });
    const presetId = matchPreset(look);
    const preset = APPEARANCE_PRESETS.find((p) => p.id === presetId);

    return (
        <div className="flex flex-col gap-4">
            <Section
                title="quick looks"
                description="one click sets the whole look — every control below still works."
                delay={0}
                badge={
                    <Pill tone={preset ? "good" : "muted"}>
                        {preset ? preset.label : "custom"}
                    </Pill>
                }
            >
                <ChoiceCards
                    label="preset"
                    hint="changes this draft — save to publish"
                    value={presetId}
                    onChange={(id) => {
                        const next = APPEARANCE_PRESETS.find((p) => p.id === id);
                        if (next) set(next.patch);
                    }}
                    options={APPEARANCE_PRESETS.map((p) => ({
                        value: p.id,
                        label: p.label,
                        blurb: p.blurb,
                        preview: (
                            <span
                                style={{
                                    display: "block",
                                    height: 56,
                                    borderRadius: 4,
                                    background: p.swatch,
                                    opacity: 0.9,
                                }}
                            />
                        ),
                    }))}
                />
                <AppearancePreview site={draft} look={look} />
                <div className="pv-foot">
                    <span className="pv-note">
                        live preview — changes as you edit
                    </span>
                    <button
                        type="button"
                        className="adm-reset"
                        onClick={() =>
                            patch({ appearance: { ...DEFAULT_APPEARANCE } })
                        }
                    >
                        reset look
                    </button>
                </div>
            </Section>

            <Section
                title="layout"
                description="how the top of the home page is put together."
                delay={60}
                badge={<Pill>{look.layout}</Pill>}
            >
                <ChoiceCards
                    label="preset"
                    hint="home hero"
                    value={look.layout}
                    onChange={(layout) => set({ layout })}
                    options={[
                        {
                            value: "classic",
                            label: "Classic",
                            blurb: "portrait, then your name",
                            preview: LAYOUT_PREVIEW.classic,
                        },
                        {
                            value: "modern",
                            label: "Modern",
                            blurb: "wide card with a banner",
                            preview: LAYOUT_PREVIEW.modern,
                        },
                        {
                            value: "portfolio",
                            label: "Portfolio",
                            blurb: "card, then sections to scroll",
                            preview: LAYOUT_PREVIEW.portfolio,
                        },
                    ]}
                />

                <div className="mt-3 flex flex-col gap-3">
                    <Segmented
                        label="card style"
                        value={look.card}
                        onChange={(card) => set({ card })}
                        options={[
                            { value: "card", label: "Card" },
                            { value: "none", label: "No card" },
                            { value: "two", label: "Two columns" },
                        ]}
                    />
                    <p className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[11px] leading-relaxed text-white/40">
                        on phones everything is centered — the position below
                        only applies on wider screens.
                    </p>
                    <MoreOptions>
                        <Segmented
                            label="position on the page"
                            value={look.align}
                            onChange={(align) => set({ align })}
                            options={[
                                { value: "center", label: "Centered" },
                                { value: "left", label: "Left side" },
                                { value: "right", label: "Right side" },
                                { value: "spread", label: "Spread" },
                            ]}
                        />
                        <Slider
                            label="content width"
                            hint="every section follows it"
                            value={look.width}
                            min={560}
                            max={1100}
                            step={10}
                            suffix="px"
                            onChange={(width) => set({ width })}
                        />
                        <Slider
                            label="section spacing"
                            hint="extra padding per section"
                            value={look.spacing}
                            min={0}
                            max={64}
                            step={2}
                            suffix="px"
                            onChange={(spacing) => set({ spacing })}
                        />
                        <Segmented
                            label="hero height"
                            value={look.heroHeight}
                            onChange={(heroHeight) => set({ heroHeight })}
                            options={[
                                { value: "full", label: "Full screen" },
                                { value: "compact", label: "Compact" },
                            ]}
                        />
                        <Slider
                            label="portrait size"
                            hint="0 hides the picture"
                            value={look.avatar}
                            min={0}
                            max={160}
                            step={2}
                            suffix="px"
                            onChange={(avatar) => set({ avatar })}
                        />
                    </MoreOptions>
                </div>
            </Section>

            <Section
                title="card look"
                description="the glass the bio sits on."
                delay={60}
            >
                <div className="flex flex-col gap-3">
                    <Slider
                        label="see-through"
                        hint="100% = fully transparent"
                        value={look.seeThrough}
                        min={0}
                        max={100}
                        suffix="%"
                        onChange={(seeThrough) => set({ seeThrough })}
                    />
                    <Slider
                        label="blur behind"
                        value={look.blur}
                        min={0}
                        max={40}
                        suffix="px"
                        onChange={(blur) => set({ blur })}
                    />
                    <Slider
                        label="corner roundness"
                        value={look.radius}
                        min={0}
                        max={32}
                        suffix="px"
                        onChange={(radius) => set({ radius })}
                    />
                    <Slider
                        label="card padding"
                        value={look.cardPad}
                        min={0}
                        max={48}
                        step={2}
                        suffix="px"
                        onChange={(cardPad) => set({ cardPad })}
                    />
                    <Toggle
                        label="border"
                        hint="1px hairline around the card"
                        checked={look.border}
                        onChange={(border) => set({ border })}
                    />
                    <Toggle
                        label="drop shadow"
                        hint="lifts the card off the backdrop"
                        checked={look.cardShadow}
                        onChange={(cardShadow) => set({ cardShadow })}
                    />
                    <Toggle
                        label="brick studs"
                        hint="a row of LEGO studs along the top edge"
                        checked={look.studs}
                        onChange={(studs) => set({ studs })}
                    />
                </div>
            </Section>

            <Section
                title="text"
                description="the name on the card."
                delay={90}
            >
                <div className="flex flex-col gap-3">
                    <Slider
                        label="name size"
                        hint="% of the default"
                        value={look.nameScale}
                        min={70}
                        max={170}
                        step={2}
                        suffix="%"
                        onChange={(nameScale) => set({ nameScale })}
                    />
                    <Slider
                        label="letter spacing"
                        hint="negative = tighter"
                        value={Math.round(look.nameTracking * 1000)}
                        min={-60}
                        max={120}
                        step={5}
                        format={(v) => `${(v / 1000).toFixed(3)}em`}
                        onChange={(v) => set({ nameTracking: v / 1000 })}
                    />
                    <Toggle
                        label="uppercase name"
                        checked={look.nameUpper}
                        onChange={(nameUpper) => set({ nameUpper })}
                    />
                    <Segmented
                        label="arrival effect"
                        hint="how the greeting and name appear"
                        value={look.textEffect}
                        onChange={(textEffect) => set({ textEffect })}
                        options={[
                            { value: "none", label: "Still" },
                            { value: "type", label: "Typewriter" },
                            { value: "scramble", label: "Decode" },
                        ]}
                    />
                    {look.textEffect !== "none" && (
                        <Slider
                            label="typing speed"
                            hint="characters per second"
                            value={look.typeSpeed}
                            min={8}
                            max={90}
                            step={2}
                            suffix=" cps"
                            onChange={(typeSpeed) => set({ typeSpeed })}
                        />
                    )}
                </div>
            </Section>

            <Section
                title="accent"
                description="one colour that tints the rail, the gradients, the player and the backdrop."
                delay={120}
                badge={
                    <Pill tone={look.accent ? "good" : "muted"}>
                        {look.accent || "follows the music"}
                    </Pill>
                }
            >
                <ColorField
                    label="accent colour"
                    hint="hex"
                    value={look.accent}
                    placeholder="#7c6cff — leave empty to follow the track"
                    onChange={(accent) => set({ accent })}
                    swatches={[
                        "#7c6cff",
                        "#5eead4",
                        "#f472b6",
                        "#facc15",
                        "#38bdf8",
                        "#fb7185",
                    ]}
                />
                <div className="mt-3 flex flex-col gap-3">
                    <Slider
                        label="accent strength"
                        hint="how much colour the gradients carry"
                        value={look.accentStrength}
                        min={0}
                        max={100}
                        suffix="%"
                        onChange={(accentStrength) => set({ accentStrength })}
                    />
                    <p className="text-[11px] leading-relaxed text-white/35">
                        with no accent set, the colour follows whatever you are
                        listening to.
                    </p>
                </div>
            </Section>

            <Section
                title="motion & backdrop"
                description="what moves. both respect the reader's reduced-motion setting."
                delay={180}
            >
                <div className="flex flex-col gap-3">
                    <Toggle
                        label="build in as you scroll"
                        hint="blocks assemble themselves as they enter the viewport"
                        checked={look.motion}
                        onChange={(motion) => set({ motion })}
                    />
                    <Segmented
                        label="build speed"
                        value={look.motionSpeed}
                        onChange={(motionSpeed) => set({ motionSpeed })}
                        options={[
                            { value: "subtle", label: "Subtle" },
                            { value: "normal", label: "Normal" },
                            { value: "bold", label: "Bold" },
                        ]}
                    />
                    <Segmented
                        label="build style"
                        hint="how each block enters"
                        value={look.buildStyle}
                        onChange={(buildStyle) => set({ buildStyle })}
                        options={[
                            { value: "rise", label: "Rise" },
                            { value: "fade", label: "Fade" },
                            { value: "assemble", label: "Assemble" },
                            { value: "lego", label: "Lego" },
                        ]}
                    />
                    <Toggle
                        label="brick loading screen"
                        hint="bricks stack up once per tab session, before the page shows"
                        checked={look.legoIntro}
                        onChange={(legoIntro) => set({ legoIntro })}
                    />
                    <Slider
                        label="stagger"
                        hint="gap between blocks in a row"
                        value={look.stagger}
                        min={0}
                        max={160}
                        step={5}
                        suffix="ms"
                        onChange={(stagger) => set({ stagger })}
                    />
                    <Toggle
                        label="animated backdrop"
                        hint="the blossom scene behind everything"
                        checked={look.scene}
                        onChange={(scene) => set({ scene })}
                    />
                    <Slider
                        label="backdrop intensity"
                        value={look.sceneIntensity}
                        min={0}
                        max={100}
                        suffix="%"
                        onChange={(sceneIntensity) => set({ sceneIntensity })}
                    />
                    <Slider
                        label="backdrop dim"
                        hint="darken the scene behind the text"
                        value={look.backdropDim}
                        min={0}
                        max={90}
                        suffix="%"
                        onChange={(backdropDim) => set({ backdropDim })}
                    />
                </div>
            </Section>
        </div>
    );
}

/* ----------------------------------------------------------------- socials */

export function SocialsPanel({ draft, patch }: PanelProps) {
    const socials = draft.socials;
    const set = (key: keyof typeof socials, value: string) =>
        patch({ socials: { ...socials, [key]: value } });

    return (
        <div className="flex flex-col gap-4">
            <Section
                title="discord"
                description="the user id powers the live avatar and presence."
                delay={0}
                badge={<Pill>lanyard</Pill>}
            >
                <div className="grid gap-3 sm:grid-cols-2">
                    <TextField
                        label="user id"
                        value={socials.discord}
                        placeholder="1466155972379672871"
                        onChange={(v) => set("discord", v)}
                    />
                    <TextField
                        label="handle"
                        prefix="@"
                        value={socials.discordHandle}
                        placeholder="tv3q"
                        onChange={(v) => set("discordHandle", v)}
                    />
                </div>
            </Section>

            <Section title="profiles" delay={70}>
                <div className="grid gap-3 sm:grid-cols-2">
                    <TextField
                        label="github url"
                        value={socials.github}
                        placeholder="https://github.com/you"
                        onChange={(v) => set("github", v)}
                    />
                    <TextField
                        label="github handle"
                        value={socials.githubHandle}
                        placeholder="you"
                        onChange={(v) => set("githubHandle", v)}
                    />
                    <TextField
                        label="last.fm url"
                        value={socials.lastfm}
                        placeholder="https://www.last.fm/user/you"
                        onChange={(v) => set("lastfm", v)}
                    />
                    <TextField
                        label="last.fm handle"
                        value={socials.lastfmHandle}
                        placeholder="you"
                        onChange={(v) => set("lastfmHandle", v)}
                    />
                    <TextField
                        label="telegram"
                        prefix="@"
                        value={socials.telegram}
                        placeholder="username"
                        onChange={(v) => set("telegram", v)}
                    />
                    <TextField
                        label="roblox url"
                        value={socials.roblox}
                        placeholder="https://www.roblox.com/users/..."
                        onChange={(v) => set("roblox", v)}
                    />
                    <TextField
                        label="roblox handle"
                        value={socials.robloxHandle}
                        placeholder="username"
                        onChange={(v) => set("robloxHandle", v)}
                    />
                </div>
            </Section>
        </div>
    );
}

/* ------------------------------------------------------------------- links */

export function LinksPanel({ draft, patch }: PanelProps) {
    const setBiolinks = (biolinks: Biolink[]) => patch({ biolinks });
    const setContacts = (contacts: Contact[]) => patch({ contacts });

    function addBiolink() {
        setBiolinks([
            ...draft.biolinks,
            { name: "", handle: "", url: "", img: "", note: "" },
        ]);
    }

    function addContact() {
        setContacts([
            ...draft.contacts,
            { platform: "", handle: "", note: "", action: "open", url: "" },
        ]);
    }

    return (
        <div className="flex flex-col gap-4">
            <Section
                title="biolinks"
                description="the stacked cards on /biolinks. first one renders first."
                delay={0}
                badge={<Pill>{draft.biolinks.length} cards</Pill>}
            >
                <ul className="flex flex-col gap-2.5">
                    {draft.biolinks.map((link, i) => (
                        <Row key={i} delay={i * 35}>
                            <div className="grid gap-2.5 sm:grid-cols-2">
                                <TextField
                                    label="name"
                                    value={link.name}
                                    placeholder="wsp.baby"
                                    onChange={(name) =>
                                        setBiolinks(
                                            draft.biolinks.map((b, bi) =>
                                                bi === i ? { ...b, name } : b,
                                            ),
                                        )
                                    }
                                />
                                <TextField
                                    label="handle"
                                    value={link.handle}
                                    placeholder="yo"
                                    onChange={(handle) =>
                                        setBiolinks(
                                            draft.biolinks.map((b, bi) =>
                                                bi === i ? { ...b, handle } : b,
                                            ),
                                        )
                                    }
                                />
                                <TextField
                                    label="url"
                                    value={link.url}
                                    placeholder="https://example.com"
                                    className="sm:col-span-2"
                                    onChange={(url) =>
                                        setBiolinks(
                                            draft.biolinks.map((b, bi) =>
                                                bi === i ? { ...b, url } : b,
                                            ),
                                        )
                                    }
                                />
                                <TextField
                                    label="image url"
                                    value={link.img}
                                    hint="optional"
                                    onChange={(img) =>
                                        setBiolinks(
                                            draft.biolinks.map((b, bi) =>
                                                bi === i ? { ...b, img } : b,
                                            ),
                                        )
                                    }
                                />
                                <TextField
                                    label="note"
                                    value={link.note}
                                    onChange={(note) =>
                                        setBiolinks(
                                            draft.biolinks.map((b, bi) =>
                                                bi === i ? { ...b, note } : b,
                                            ),
                                        )
                                    }
                                />
                            </div>
                            <div className="mt-1 flex justify-end">
                                <RowTools
                                    index={i}
                                    total={draft.biolinks.length}
                                    onMove={(dir) =>
                                        setBiolinks(
                                            moved(draft.biolinks, i, dir),
                                        )
                                    }
                                    onRemove={() =>
                                        setBiolinks(
                                            draft.biolinks.filter(
                                                (_, bi) => bi !== i,
                                            ),
                                        )
                                    }
                                    removeLabel={`delete ${link.name || "link"}`}
                                />
                            </div>
                        </Row>
                    ))}
                </ul>
                <div className="mt-3">
                    <AddButton onClick={addBiolink}>add biolink</AddButton>
                </div>
            </Section>

            <Section
                title="contact cards"
                description="shown on /contact under the discord card."
                delay={90}
                badge={<Pill>{draft.contacts.length} entries</Pill>}
            >
                <ul className="flex flex-col gap-2.5">
                    {draft.contacts.map((contact, i) => (
                        <Row key={i} delay={i * 35}>
                            <div className="grid gap-2.5 sm:grid-cols-2">
                                <TextField
                                    label="platform"
                                    value={contact.platform}
                                    placeholder="GitHub"
                                    onChange={(platform) =>
                                        setContacts(
                                            draft.contacts.map((c, ci) =>
                                                ci === i
                                                    ? { ...c, platform }
                                                    : c,
                                            ),
                                        )
                                    }
                                />
                                <TextField
                                    label="handle"
                                    value={contact.handle}
                                    placeholder="izzv"
                                    onChange={(handle) =>
                                        setContacts(
                                            draft.contacts.map((c, ci) =>
                                                ci === i ? { ...c, handle } : c,
                                            ),
                                        )
                                    }
                                />
                                <TextField
                                    label="url"
                                    value={contact.url}
                                    className="sm:col-span-2"
                                    placeholder="https://..."
                                    onChange={(url) =>
                                        setContacts(
                                            draft.contacts.map((c, ci) =>
                                                ci === i ? { ...c, url } : c,
                                            ),
                                        )
                                    }
                                />
                                <TextField
                                    label="note"
                                    value={contact.note}
                                    placeholder="code & projects"
                                    onChange={(note) =>
                                        setContacts(
                                            draft.contacts.map((c, ci) =>
                                                ci === i ? { ...c, note } : c,
                                            ),
                                        )
                                    }
                                />
                                <Field label="action">
                                    <select
                                        value={contact.action}
                                        onChange={(e) =>
                                            setContacts(
                                                draft.contacts.map((c, ci) =>
                                                    ci === i
                                                        ? {
                                                              ...c,
                                                              action:
                                                                  e.target
                                                                      .value,
                                                          }
                                                        : c,
                                                ),
                                            )
                                        }
                                        className={INPUT}
                                    >
                                        <option value="open">open</option>
                                        <option value="copy handle">
                                            copy handle
                                        </option>
                                    </select>
                                </Field>
                            </div>
                            <div className="mt-1 flex justify-end">
                                <RowTools
                                    index={i}
                                    total={draft.contacts.length}
                                    onMove={(dir) =>
                                        setContacts(
                                            moved(draft.contacts, i, dir),
                                        )
                                    }
                                    onRemove={() =>
                                        setContacts(
                                            draft.contacts.filter(
                                                (_, ci) => ci !== i,
                                            ),
                                        )
                                    }
                                    removeLabel={`delete ${contact.platform || "contact"}`}
                                />
                            </div>
                        </Row>
                    ))}
                </ul>
                <div className="mt-3">
                    <AddButton onClick={addContact}>add contact</AddButton>
                </div>
                <p className="mt-2.5 text-[11px] leading-relaxed text-white/30">
                    a contact named “Discord” is left out of the grid, because
                    discord already has its own big card.
                </p>
            </Section>
        </div>
    );
}

/* ------------------------------------------------------------------ skills */

export function SkillsPanel({ draft, patch }: PanelProps) {
    const [drafts, setDrafts] = useState<Record<string, string>>({});
    const entries = Object.entries(draft.skills);

    function setSections(next: Record<string, string[]>) {
        patch({ skills: next });
    }

    function rename(index: number, name: string) {
        const next: Record<string, string[]> = {};
        entries.forEach(([key, list], i) => {
            next[i === index ? name : key] = list;
        });
        setSections(next);
    }

    function setItems(index: number, items: string[]) {
        const next: Record<string, string[]> = {};
        entries.forEach(([key, list], i) => {
            next[key] = i === index ? items : list;
        });
        setSections(next);
    }

    function addItem(index: number) {
        const key = entries[index][0];
        const value = (drafts[key] || "").trim();
        if (!value) return;
        setItems(index, [...entries[index][1], value]);
        setDrafts((d) => ({ ...d, [key]: "" }));
    }

    function removeSection(index: number) {
        const next: Record<string, string[]> = {};
        entries.forEach(([key, list], i) => {
            if (i !== index) next[key] = list;
        });
        setSections(next);
    }

    function addSection() {
        const next: Record<string, string[]> = {};
        let name = "new group";
        let n = 2;
        entries.forEach(([key, list]) => {
            next[key] = list;
        });
        while (next[name]) name = `new group ${n++}`;
        next[name] = [];
        setSections(next);
    }

    return (
        <div className="flex flex-col gap-4">
            <Section
                title="skill groups"
                description="each group renders as its own row of pills on /skills."
                delay={0}
                badge={<Pill>{entries.length} groups</Pill>}
            >
                <ul className="flex flex-col gap-3">
                    {entries.map(([key, items], index) => (
                        <Row key={`section-${index}`} delay={index * 45}>
                            <div className="flex items-center gap-2">
                                <input
                                    value={key}
                                    aria-label="group name"
                                    onChange={(e) =>
                                        rename(index, e.target.value)
                                    }
                                    className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-1 py-0.5 text-sm font-medium text-white/85 outline-none transition-colors hover:border-white/10 focus:border-white/25 focus:bg-white/[0.04]"
                                />
                                <span className="shrink-0 text-[10px] tabular-nums text-white/30">
                                    {items.length}
                                </span>
                                <RowTools
                                    index={index}
                                    total={entries.length}
                                    onMove={(dir) => {
                                        if (
                                            (dir === -1 && index === 0) ||
                                            (dir === 1 &&
                                                index === entries.length - 1)
                                        )
                                            return;
                                        const copy = [...entries];
                                        const target = index + dir;
                                        [copy[index], copy[target]] = [
                                            copy[target],
                                            copy[index],
                                        ];
                                        setSections(
                                            Object.fromEntries(copy),
                                        );
                                    }}
                                    onRemove={() => removeSection(index)}
                                    removeLabel={`delete group ${key}`}
                                />
                            </div>

                            <div className="mt-2 flex flex-wrap gap-1.5">
                                {items.map((item, ii) => (
                                    <span
                                        key={`${item}-${ii}`}
                                        className="adm-chip group inline-flex items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.04] py-1 pl-2 pr-1 text-[11px] text-white/70"
                                    >
                                        {item}
                                        <button
                                            type="button"
                                            aria-label={`remove ${item}`}
                                            onClick={() =>
                                                setItems(
                                                    index,
                                                    items.filter(
                                                        (_, x) => x !== ii,
                                                    ),
                                                )
                                            }
                                            className="grid size-4 place-items-center rounded text-white/30 transition-colors hover:bg-white/10 hover:text-white/80"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                                {items.length === 0 && (
                                    <span className="text-[11px] text-white/25">
                                        empty — add one below.
                                    </span>
                                )}
                            </div>

                            <div className="mt-2 flex gap-1.5">
                                <input
                                    value={drafts[key] || ""}
                                    placeholder="add a skill and press enter"
                                    onChange={(e) =>
                                        setDrafts((d) => ({
                                            ...d,
                                            [key]: e.target.value,
                                        }))
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            addItem(index);
                                        }
                                    }}
                                    className={`${INPUT} h-7 py-1 text-xs`}
                                />
                                <button
                                    type="button"
                                    onClick={() => addItem(index)}
                                    className="shrink-0 rounded-md border border-white/[0.1] bg-white/[0.05] px-2 text-[11px] text-white/65 transition-colors hover:bg-white/[0.1] hover:text-white"
                                >
                                    add
                                </button>
                            </div>
                        </Row>
                    ))}
                </ul>
                <div className="mt-3">
                    <AddButton onClick={addSection}>add group</AddButton>
                </div>
            </Section>
        </div>
    );
}

/* --------------------------------------------------------------------- nav */

export function NavPanel({ draft, patch }: PanelProps) {
    const setNav = (nav: NavItem[]) => patch({ nav });

    function update(index: number, partial: Partial<NavItem>) {
        setNav(
            draft.nav.map((item, i) =>
                i === index ? { ...item, ...partial } : item,
            ),
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <Section
                title="navigation"
                description="the floating rail. items are drawn in group order (core → work → social) with a divider between groups; hidden items stay saved but disappear from the site."
                delay={0}
                badge={<Pill>{draft.nav.filter((n) => !n.hidden).length} visible</Pill>}
            >
                <ul className="flex flex-col gap-2">
                    {draft.nav.map((item, i) => {
                        const icon = navIcon(item.icon);
                        return (
                            <Row key={i} delay={i * 40}>
                                <div className="flex flex-wrap items-end gap-2">
                                    <div className="flex items-end gap-2">
                                        <span className="grid size-8 shrink-0 place-items-center rounded-md bg-white/[0.06] ring-1 ring-white/[0.08]">
                                            <svg
                                                stroke="currentColor"
                                                fill="currentColor"
                                                strokeWidth="0"
                                                viewBox={icon.viewBox}
                                                className="size-3.5 text-white/70"
                                                aria-hidden="true"
                                            >
                                                <path d={icon.path} />
                                            </svg>
                                        </span>
                                        <Field label="icon">
                                            <select
                                                value={item.icon}
                                                onChange={(e) =>
                                                    update(i, {
                                                        icon: e.target
                                                            .value as NavItem["icon"],
                                                    })
                                                }
                                                className={`${INPUT} py-1`}
                                            >
                                                {NAV_ICON_KEYS.map((key) => (
                                                    <option key={key} value={key}>
                                                        {key}
                                                    </option>
                                                ))}
                                            </select>
                                        </Field>
                                        <Field label="group">
                                            <select
                                                value={item.group}
                                                onChange={(e) =>
                                                    update(i, {
                                                        group: e.target
                                                            .value as NavItem["group"],
                                                    })
                                                }
                                                className={`${INPUT} py-1`}
                                            >
                                                {NAV_GROUPS.map((g) => (
                                                    <option key={g} value={g}>
                                                        {g}
                                                    </option>
                                                ))}
                                            </select>
                                        </Field>
                                    </div>
                                    <div className="min-w-[110px] flex-1">
                                        <TextField
                                            label="label"
                                            value={item.label}
                                            onChange={(label) =>
                                                update(i, { label })
                                            }
                                        />
                                    </div>
                                    <div className="min-w-[140px] flex-[1.4]">
                                        <TextField
                                            label="href"
                                            value={item.href}
                                            onChange={(href) =>
                                                update(i, { href })
                                            }
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            update(i, {
                                                hidden: !item.hidden,
                                            })
                                        }
                                        aria-pressed={item.hidden}
                                        className={`mb-0.5 rounded-md border px-2 py-1.5 text-[10px] uppercase tracking-wider transition-colors ${
                                            item.hidden
                                                ? "border-amber-300/20 bg-amber-300/[0.08] text-amber-100/70"
                                                : "border-emerald-300/20 bg-emerald-300/[0.08] text-emerald-100/70"
                                        }`}
                                    >
                                        {item.hidden ? "hidden" : "shown"}
                                    </button>
                                    <div className="mb-0.5">
                                        <RowTools
                                            index={i}
                                            total={draft.nav.length}
                                            onMove={(dir) =>
                                                setNav(moved(draft.nav, i, dir))
                                            }
                                            onRemove={() =>
                                                setNav(
                                                    draft.nav.filter(
                                                        (_, ni) => ni !== i,
                                                    ),
                                                )
                                            }
                                            removeLabel={`delete ${item.label}`}
                                        />
                                    </div>
                                </div>
                            </Row>
                        );
                    })}
                </ul>
                <div className="mt-3">
                    <AddButton
                        onClick={() =>
                            setNav([
                                ...draft.nav,
                                {
                                    label: "New",
                                    href: "/",
                                    icon: "external",
                                    group: "core",
                                    hidden: false,
                                },
                            ])
                        }
                    >
                        add nav item
                    </AddButton>
                </div>
            </Section>
        </div>
    );
}

/* -------------------------------------------------------------- commission */

export function CommissionPanel({ draft, patch }: PanelProps) {
    const c = draft.commission;
    const set = (partial: Partial<typeof c>) =>
        patch({ commission: { ...c, ...partial } });

    return (
        <div className="flex flex-col gap-4">
            <Section
                title="commissions"
                description="when enabled, the bar shows above /projects and the pill on home."
                delay={0}
                badge={
                    <Pill tone={c.enabled ? "good" : "muted"}>
                        {c.enabled ? "open" : "closed"}
                    </Pill>
                }
            >
                <Toggle
                    label="taking commissions"
                    hint="turns the animated availability bar on and off."
                    checked={c.enabled}
                    onChange={(enabled) => set({ enabled })}
                />
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <TextField
                        label="label"
                        value={c.label}
                        placeholder="commissions"
                        onChange={(label) => set({ label })}
                    />
                    <TextField
                        label="price"
                        value={c.price}
                        placeholder="$50+"
                        onChange={(price) => set({ price })}
                    />
                    <TextField
                        label="accepted coins"
                        value={c.coins}
                        hint="comma separated · crypto only"
                        className="sm:col-span-2"
                        placeholder="BTC, ETH, USDT, SOL"
                        onChange={(coins) => set({ coins })}
                    />
                    <TextField
                        label="sponsor"
                        value={c.sponsor}
                        placeholder="me"
                        onChange={(sponsor) => set({ sponsor })}
                    />
                    <TextField
                        label="sponsor link"
                        value={c.sponsorUrl}
                        placeholder="/contact"
                        onChange={(sponsorUrl) => set({ sponsorUrl })}
                    />
                    <TextField
                        label="sponsor icon"
                        value={c.sponsorIcon}
                        hint="optional image url"
                        className="sm:col-span-2"
                        placeholder="https://..."
                        onChange={(sponsorIcon) => set({ sponsorIcon })}
                    />
                </div>
                <div className="mt-3">
                    <div className="adm-preview relative overflow-hidden rounded-lg border border-white/[0.07] bg-black/30 p-3">
                        <div className="flex items-center justify-between gap-3">
                            <span className="flex items-center gap-2.5">
                                <span className="relative inline-flex size-1.5 items-center justify-center">
                                    <span className="absolute inset-0 animate-ping rounded-full bg-white/40" />
                                    <span className="relative size-1.5 rounded-full bg-white" />
                                </span>
                                <span className="text-xs text-white/85">
                                    taking {c.label || "commissions"}
                                </span>
                                <span className="text-xs text-white/30">·</span>
                                <span className="text-xs text-white/55">
                                    from{" "}
                                    <span className="text-white/85">
                                        {c.price || "$??"}
                                    </span>
                                </span>
                            </span>
                            <span className="text-[10px] text-white/35">
                                {c.sponsor || "sponsor"}
                            </span>
                        </div>
                    </div>
                </div>
            </Section>
        </div>
    );
}
