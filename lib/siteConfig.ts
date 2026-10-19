import { NAV_ICON_KEYS, type NavIconKey } from "./navIcons";

/**
 * The whole site's content model. Everything in here is editable from
 * /admin — the defaults are only the seed used the first time the store
 * is read (or when a field is missing/invalid).
 */

export type Socials = {
    discord: string;
    discordHandle: string;
    telegram: string;
    github: string;
    githubHandle: string;
    lastfm: string;
    lastfmHandle: string;
    roblox: string;
    robloxHandle: string;
};

/**
 * Nav items are sorted into three runs in the rail: what the site is (core),
 * what it sells (work), and where to talk to you (social). A hairline is drawn
 * where the group changes, so the rail reads as sections instead of eight
 * equal dots.
 */
export const NAV_GROUPS = ["core", "work", "social"] as const;
export type NavGroup = (typeof NAV_GROUPS)[number];

export type NavItem = {
    label: string;
    href: string;
    icon: NavIconKey;
    group: NavGroup;
    hidden: boolean;
};

export type Commission = {
    enabled: boolean;
    label: string;
    price: string;
    sponsor: string;
    sponsorUrl: string;
    sponsorIcon: string;
    /** comma separated, shown on /commissions — payment is crypto only */
    coins: string;
};

export type Biolink = {
    name: string;
    handle: string;
    url: string;
    img: string;
    note: string;
};

export type Contact = {
    platform: string;
    handle: string;
    note: string;
    action: string;
    url: string;
};

/**
 * How the public site looks. Everything here is editable from /admin →
 * appearance and applied on the next request, so the whole look is data —
 * the defaults are exactly the look the site shipped with.
 */
export const LAYOUTS = ["classic", "modern", "portfolio"] as const;
export type AppearanceLayout = (typeof LAYOUTS)[number];

/** `card` = bio in a glass card, `none` = bio straight on the page, `two` = split in half. */
export const CARD_STYLES = ["card", "none", "two"] as const;
export type AppearanceCard = (typeof CARD_STYLES)[number];

export const ALIGNMENTS = ["center", "left", "right", "spread"] as const;
export type AppearanceAlign = (typeof ALIGNMENTS)[number];

export const MOTION_SPEEDS = ["subtle", "normal", "bold"] as const;
export type AppearanceSpeed = (typeof MOTION_SPEEDS)[number];

export const HERO_HEIGHTS = ["full", "compact"] as const;
export type AppearanceHeroHeight = (typeof HERO_HEIGHTS)[number];

/** How the greeting and name arrive on screen. */
export const TEXT_EFFECTS = ["none", "type", "scramble"] as const;
export type AppearanceTextEffect = (typeof TEXT_EFFECTS)[number];

/** How blocks enter as you scroll. */
export const BUILD_STYLES = ["rise", "fade", "assemble", "lego"] as const;
export type AppearanceBuildStyle = (typeof BUILD_STYLES)[number];

export type Appearance = {
    layout: AppearanceLayout;
    card: AppearanceCard;
    /** horizontal placement of the hero; phones are always centered */
    align: AppearanceAlign;
    /** 0 = solid card, 100 = fully see-through */
    seeThrough: number;
    /** card backdrop blur, px */
    blur: number;
    /** card corner roundness, px */
    radius: number;
    /** hairline border on the card */
    border: boolean;
    /** card inner padding, px */
    cardPad: number;
    /** drop shadow under the card */
    cardShadow: boolean;
    /** a row of brick studs along the top edge of the card */
    studs: boolean;
    /** content column width, px */
    width: number;
    /** extra vertical padding on every section, px */
    spacing: number;
    /** hero fills the viewport, or ends where its content ends */
    heroHeight: AppearanceHeroHeight;
    /** portrait size, px — 0 hides it */
    avatar: number;
    /** name size, % of the default */
    nameScale: number;
    /** name letter spacing, em (may be negative) */
    nameTracking: number;
    /** render the name in caps */
    nameUpper: boolean;
    /** typing / scramble animation for the greeting and name */
    textEffect: AppearanceTextEffect;
    /** characters per second for the text effect */
    typeSpeed: number;
    /** how blocks enter while scrolling */
    buildStyle: AppearanceBuildStyle;
    /** ms between each block in a staggered build */
    stagger: number;
    /** brick-assembly loading screen on the first load of a session */
    legoIntro: boolean;
    /** `#rrggbb` to override the live palette, `""` to follow the music */
    accent: string;
    /** how strongly the accent tints gradients, % */
    accentStrength: number;
    /** build the page in as you scroll */
    motion: boolean;
    motionSpeed: AppearanceSpeed;
    /** animated blossom backdrop */
    scene: boolean;
    /** scene opacity, % */
    sceneIntensity: number;
    /** dark veil over the backdrop so text stays readable, % */
    backdropDim: number;
};

export type SiteConfig = {
    name: string;
    age: number;
    greeting: string;
    tagline: string;
    role: string;
    timezone: string;
    socials: Socials;
    commission: Commission;
    nav: NavItem[];
    skills: Record<string, string[]>;
    biolinks: Biolink[];
    contacts: Contact[];
    appearance: Appearance;
};

export const DEFAULT_APPEARANCE: Appearance = {
    layout: "portfolio",
    card: "card",
    align: "left",
    seeThrough: 100,
    blur: 12,
    radius: 8,
    border: true,
    cardPad: 16,
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
    typeSpeed: 28,
    buildStyle: "rise",
    stagger: 65,
    legoIntro: true,
    accent: "",
    accentStrength: 42,
    motion: true,
    motionSpeed: "normal",
    scene: true,
    sceneIntensity: 100,
    backdropDim: 0,
};

export const DEFAULT_SITE: SiteConfig = {
    name: "ryan",
    age: 0,
    greeting: "hey visitor",
    tagline: "building things for the internet.",
    role: "full stack dev",
    timezone: "America/New_York",
    socials: {
        discord: "1466155972379672871",
        discordHandle: "tv3q",
        telegram: "fentsniffer",
        github: "https://github.com/izzv",
        githubHandle: "izzv",
        lastfm: "https://www.last.fm/user/izzv",
        lastfmHandle: "izzv",
        roblox: "https://www.roblox.com/users/profile?username=coldgrieff",
        robloxHandle: "coldgrieff",
    },
    commission: {
        enabled: true,
        label: "commissions",
        price: "$50+",
        sponsor: "me",
        sponsorUrl: "/contact",
        sponsorIcon: "",
        coins: "BTC, ETH, USDT, SOL, LTC",
    },
    nav: [
        { label: "Home", href: "/", icon: "home", group: "core", hidden: false },
        {
            label: "Projects",
            href: "/projects",
            icon: "projects",
            group: "core",
            hidden: false,
        },
        { label: "Music", href: "/music", icon: "music", group: "core", hidden: false },
        {
            label: "Commissions",
            href: "/commissions",
            icon: "coin",
            group: "work",
            hidden: false,
        },
        {
            label: "Skills",
            href: "/skills",
            icon: "skills",
            group: "work",
            hidden: false,
        },
        {
            label: "Guestbook",
            href: "/guestbook",
            icon: "guestbook",
            group: "social",
            hidden: false,
        },
        {
            label: "Biolinks",
            href: "/biolinks",
            icon: "links",
            group: "social",
            hidden: false,
        },
        {
            label: "Contact",
            href: "/contact",
            icon: "contact",
            group: "social",
            hidden: false,
        },
    ],
    skills: {
        Languages: ["TypeScript", "JavaScript", "Python"],
        "Frameworks & Libraries": [
            "Next.js",
            "React",
            "TailwindCSS",
            "Node.js",
            "FastAPI",
            "Vite",
            "Webpack",
            "Bun",
            "Litestar",
        ],
        "Tools & Platforms": [
            "VSCode",
            "Git",
            "GitHub",
            "Docker",
            "Vercel",
            "PostgreSQL",
            "AWS",
            "Cloudflare",
            "Redis",
            "Kubernetes",
            "Zsh",
        ],
    },
    biolinks: [
        {
            name: "wsp.baby",
            handle: "yo",
            url: "https://wsp.baby/yo",
            img: "https://wsp.baby/icon.png",
            note: "my other profile",
        },
        {
            name: "injuri.ng",
            handle: "no",
            url: "https://injuri.ng/no",
            img: "https://injuri.ng/icon.png",
            note: "find me on injuri.ng",
        },
    ],
    contacts: [
        {
            platform: "Discord",
            handle: "tv3q",
            note: "fastest contact",
            action: "copy handle",
            url: "https://discord.com/users/1466155972379672871",
        },
        {
            platform: "GitHub",
            handle: "izzv",
            note: "code & projects",
            action: "open",
            url: "https://github.com/izzv",
        },
        {
            platform: "Telegram",
            handle: "fentsniffer",
            note: "quick messages",
            action: "open",
            url: "https://t.me/fentsniffer",
        },
        {
            platform: "Last.fm",
            handle: "izzv",
            note: "listening history",
            action: "open",
            url: "https://www.last.fm/user/izzv",
        },
        {
            platform: "Roblox",
            handle: "coldgrieff",
            note: "games & hangs",
            action: "open",
            url: "https://www.roblox.com/users/profile?username=coldgrieff",
        },
    ],
    appearance: DEFAULT_APPEARANCE,
};

/* ---------- normalization ---------- */

const MAX_NAV = 12;
const MAX_BIOLINKS = 40;
const MAX_CONTACTS = 40;
const MAX_SKILL_SECTIONS = 16;
const MAX_SKILLS = 48;

function obj(value: unknown): Record<string, unknown> {
    return value && typeof value === "object" && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : {};
}

function text(value: unknown, fallback: string, max = 200): string {
    if (typeof value === "string") return value.trim().slice(0, max);
    if (typeof value === "number" && Number.isFinite(value))
        return String(value).slice(0, max);
    return fallback;
}

function bool(value: unknown, fallback: boolean): boolean {
    if (value === true || value === "true" || value === 1) return true;
    if (value === false || value === "false" || value === 0) return false;
    return fallback;
}

function link(value: unknown, fallback = ""): string {
    const raw = text(value, "", 2048);
    if (!raw) return fallback;
    if (raw.startsWith("/") || raw.startsWith("#")) return raw;
    const candidate = /^[a-z][a-z0-9+.-]*:/i.test(raw)
        ? raw
        : `https://${raw}`;
    try {
        const u = new URL(candidate);
        if (u.protocol === "https:" || u.protocol === "http:") return u.toString();
    } catch {}
    return fallback;
}

function navHref(value: unknown, fallback: string): string {
    const raw = text(value, "", 300);
    if (!raw) return fallback;
    if (raw.startsWith("/") || raw.startsWith("#")) return raw;
    return link(raw, fallback);
}

function timezone(value: unknown, fallback: string): string {
    const raw = text(value, "", 60);
    if (!raw) return fallback;
    try {
        new Intl.DateTimeFormat("en-US", { timeZone: raw });
        return raw;
    } catch {
        return fallback;
    }
}

function iconKey(value: unknown, fallback: NavIconKey): NavIconKey {
    const raw = text(value, "", 24) as NavIconKey;
    return NAV_ICON_KEYS.includes(raw) ? raw : fallback;
}

/** Numbers that are allowed fractions (letter spacing, em). */
function clampNum(
    value: unknown,
    fallback: number,
    min: number,
    max: number,
): number {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.round(Math.min(max, Math.max(min, n)) * 1000) / 1000;
}

function clampInt(
    value: unknown,
    fallback: number,
    min: number,
    max: number,
): number {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, Math.round(n)));
}

function oneOf<T extends string>(
    value: unknown,
    options: readonly T[],
    fallback: T,
): T {
    return typeof value === "string" &&
        (options as readonly string[]).includes(value)
        ? (value as T)
        : fallback;
}

/** `#rgb`, `#rrggbb`, or `""`/`transparent` to follow the live palette. */
function hexColor(value: unknown, fallback: string): string {
    const raw = text(value, "", 9).trim();
    if (!raw || raw === "transparent") return raw ? "" : fallback;
    const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(raw);
    if (!match) return fallback;
    const body = match[1].toLowerCase();
    return `#${
        body.length === 3
            ? body
                  .split("")
                  .map((c) => c + c)
                  .join("")
            : body
    }`;
}

function normalizeAppearance(value: unknown): Appearance {
    const d = DEFAULT_APPEARANCE;
    const r = obj(value);
    return {
        layout: oneOf(r.layout, LAYOUTS, d.layout),
        card: oneOf(r.card, CARD_STYLES, d.card),
        align: oneOf(r.align, ALIGNMENTS, d.align),
        seeThrough: clampInt(r.seeThrough, d.seeThrough, 0, 100),
        blur: clampInt(r.blur, d.blur, 0, 40),
        radius: clampInt(r.radius, d.radius, 0, 32),
        border: bool(r.border, d.border),
        cardPad: clampInt(r.cardPad, d.cardPad, 0, 48),
        cardShadow: bool(r.cardShadow, d.cardShadow),
        studs: bool(r.studs, d.studs),
        width: clampInt(r.width, d.width, 560, 1100),
        spacing: clampInt(r.spacing, d.spacing, 0, 64),
        heroHeight: oneOf(r.heroHeight, HERO_HEIGHTS, d.heroHeight),
        avatar: clampInt(r.avatar, d.avatar, 0, 160),
        nameScale: clampInt(r.nameScale, d.nameScale, 70, 170),
        nameTracking: clampNum(r.nameTracking, d.nameTracking, -0.06, 0.12),
        nameUpper: bool(r.nameUpper, d.nameUpper),
        textEffect: oneOf(r.textEffect, TEXT_EFFECTS, d.textEffect),
        typeSpeed: clampInt(r.typeSpeed, d.typeSpeed, 8, 90),
        buildStyle: oneOf(r.buildStyle, BUILD_STYLES, d.buildStyle),
        stagger: clampInt(r.stagger, d.stagger, 0, 160),
        legoIntro: bool(r.legoIntro, d.legoIntro),
        accent: hexColor(r.accent, d.accent),
        accentStrength: clampInt(r.accentStrength, d.accentStrength, 0, 100),
        motion: bool(r.motion, d.motion),
        motionSpeed: oneOf(r.motionSpeed, MOTION_SPEEDS, d.motionSpeed),
        scene: bool(r.scene, d.scene),
        sceneIntensity: clampInt(r.sceneIntensity, d.sceneIntensity, 0, 100),
        backdropDim: clampInt(r.backdropDim, d.backdropDim, 0, 90),
    };
}

function normalizeSocials(value: unknown): Socials {
    const d = DEFAULT_SITE.socials;
    const r = obj(value);
    const discord = text(r.discord, d.discord, 128).replace(/[^\d]/g, "");
    return {
        discord: discord || d.discord,
        discordHandle: text(r.discordHandle, d.discordHandle, 40),
        telegram: text(r.telegram, d.telegram, 60).replace(/^@/, ""),
        github: link(r.github, d.github),
        githubHandle: text(r.githubHandle, d.githubHandle, 60),
        lastfm: link(r.lastfm, d.lastfm),
        lastfmHandle: text(r.lastfmHandle, d.lastfmHandle, 60),
        roblox: link(r.roblox, d.roblox),
        robloxHandle: text(r.robloxHandle, d.robloxHandle, 60),
    };
}

function navGroup(value: unknown, href: string): NavGroup {
    if (typeof value === "string" && (NAV_GROUPS as readonly string[]).includes(value))
        return value as NavGroup;
    // Saved configs predate groups: recover one from the item's known href
    // rather than its index, so a reordered rail still groups correctly.
    return DEFAULT_SITE.nav.find((n) => n.href === href)?.group ?? "core";
}

function normalizeNav(value: unknown): NavItem[] {
    if (!Array.isArray(value)) return DEFAULT_SITE.nav.map((n) => ({ ...n }));
    return value.slice(0, MAX_NAV).flatMap((raw, i) => {
        const r = obj(raw);
        const fallback = DEFAULT_SITE.nav[i];
        const label = text(r.label, fallback?.label ?? "", 32);
        const href = navHref(r.href, fallback?.href ?? "");
        if (!label || !href) return [];
        return [
            {
                label,
                href,
                icon: iconKey(r.icon, fallback?.icon ?? "sparkles"),
                group: navGroup(r.group, href),
                hidden: bool(r.hidden, false),
            },
        ];
    });
}

function normalizeCommission(value: unknown): Commission {
    const d = DEFAULT_SITE.commission;
    const r = obj(value);
    return {
        enabled: bool(r.enabled, d.enabled),
        label: text(r.label, d.label, 40),
        price: text(r.price, d.price, 40),
        sponsor: text(r.sponsor, d.sponsor, 60),
        sponsorUrl: link(r.sponsorUrl, d.sponsorUrl),
        sponsorIcon: link(r.sponsorIcon, d.sponsorIcon),
        coins: text(r.coins, d.coins, 140),
    };
}

function normalizeSkills(value: unknown): Record<string, string[]> {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return Object.fromEntries(
            Object.entries(DEFAULT_SITE.skills).map(([k, v]) => [k, [...v]]),
        );
    }
    const out: Record<string, string[]> = {};
    for (const [key, list] of Object.entries(value as Record<string, unknown>)) {
        if (Object.keys(out).length >= MAX_SKILL_SECTIONS) break;
        const section = text(key, "", 48);
        if (!section || !Array.isArray(list)) continue;
        const items = list
            .map((s) => text(s, "", 48))
            .filter(Boolean)
            .slice(0, MAX_SKILLS);
        if (items.length) out[section] = items;
    }
    return Object.keys(out).length
        ? out
        : Object.fromEntries(
              Object.entries(DEFAULT_SITE.skills).map(([k, v]) => [k, [...v]]),
          );
}

function normalizeBiolinks(value: unknown): Biolink[] {
    if (!Array.isArray(value)) return DEFAULT_SITE.biolinks.map((b) => ({ ...b }));
    return value.slice(0, MAX_BIOLINKS).flatMap((raw) => {
        const r = obj(raw);
        const name = text(r.name, "", 60);
        const url = link(r.url);
        const note = text(r.note, "", 160);
        if (!name && !note && !url) return [];
        return [
            {
                name: name || "link",
                handle: text(r.handle, "", 40),
                url,
                img: link(r.img),
                note,
            },
        ];
    });
}

function normalizeContacts(value: unknown): Contact[] {
    if (!Array.isArray(value)) return DEFAULT_SITE.contacts.map((c) => ({ ...c }));
    return value.slice(0, MAX_CONTACTS).flatMap((raw) => {
        const r = obj(raw);
        const platform = text(r.platform, "", 40);
        const handle = text(r.handle, "", 60);
        const url = link(r.url);
        if (!platform && !handle) return [];
        return [
            {
                platform: platform || "link",
                handle,
                note: text(r.note, "", 120),
                action: text(r.action, "open", 24) || "open",
                url,
            },
        ];
    });
}

export function normalizeSite(input: unknown): SiteConfig {
    const r = obj(input);
    const d = DEFAULT_SITE;
    const ageRaw = Number(r.age);
    return {
        name: text(r.name, d.name, 40) || d.name,
        age: Number.isFinite(ageRaw)
            ? Math.min(120, Math.max(0, Math.round(ageRaw)))
            : d.age,
        greeting: text(r.greeting, d.greeting, 60),
        tagline: text(r.tagline, d.tagline, 160),
        role: text(r.role, d.role, 60),
        timezone: timezone(r.timezone, d.timezone),
        socials: normalizeSocials(r.socials),
        commission: normalizeCommission(r.commission),
        nav: normalizeNav(r.nav),
        skills: normalizeSkills(r.skills),
        biolinks: normalizeBiolinks(r.biolinks),
        contacts: normalizeContacts(r.contacts),
        appearance: normalizeAppearance(r.appearance),
    };
}

export function defaultSite(): SiteConfig {
    return normalizeSite(DEFAULT_SITE);
}
