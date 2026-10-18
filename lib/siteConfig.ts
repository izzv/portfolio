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

export type NavItem = {
    label: string;
    href: string;
    icon: NavIconKey;
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
        { label: "Home", href: "/", icon: "home", hidden: false },
        { label: "Music", href: "/music", icon: "music", hidden: false },
        { label: "Projects", href: "/projects", icon: "projects", hidden: false },
        { label: "Commissions", href: "/commissions", icon: "coin", hidden: false },
        { label: "Skills", href: "/skills", icon: "skills", hidden: false },
        { label: "Biolinks", href: "/biolinks", icon: "links", hidden: false },
        { label: "Guestbook", href: "/guestbook", icon: "guestbook", hidden: false },
        { label: "Contact", href: "/contact", icon: "contact", hidden: false },
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
    };
}

export function defaultSite(): SiteConfig {
    return normalizeSite(DEFAULT_SITE);
}
