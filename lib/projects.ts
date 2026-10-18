export type Project = {
    id: string;
    name: string;
    description: string;
    url: string;
    cta: string;
    icon: string;
    shot: string;
    year: string;
    featured: boolean;
};

const MAX_PROJECTS = 40;

function str(value: unknown, max: number): string {
    return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function link(value: unknown): string {
    const raw = str(value, 2048);
    if (!raw) return "";
    if (raw.startsWith("/")) return raw;
    const candidate = /^[a-z][a-z0-9+.-]*:/i.test(raw)
        ? raw
        : `https://${raw}`;
    try {
        const u = new URL(candidate);
        if (u.protocol === "https:" || u.protocol === "http:") return u.toString();
    } catch {}
    return "";
}

function slugify(value: string): string {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 60);
}

function bool(value: unknown): boolean {
    return value === true || value === "true" || value === 1;
}

export function normalizeProjects(input: unknown): Project[] {
    if (!Array.isArray(input)) return [];
    const seen = new Set<string>();
    const out: Project[] = [];

    for (const raw of input.slice(0, MAX_PROJECTS)) {
        if (!raw || typeof raw !== "object") continue;
        const r = raw as Record<string, unknown>;
        const name = str(r.name, 80);
        const description = str(r.description, 600);
        const url = link(r.url);
        if (!name && !description && !url) continue;

        let id = str(r.id, 64).replace(/[^a-zA-Z0-9-]/g, "");
        if (!id) id = slugify(name) || "project";
        if (seen.has(id)) {
            let n = 2;
            while (seen.has(`${id}-${n}`)) n += 1;
            id = `${id}-${n}`;
        }
        seen.add(id);

        out.push({
            id,
            name: name || "untitled",
            description,
            url,
            cta: str(r.cta, 60) || "open",
            icon: link(r.icon),
            shot: link(r.shot),
            year: str(r.year, 12),
            featured: bool(r.featured),
        });
    }

    return out;
}

export function newProject(): Project {
    return {
        id: Math.random().toString(36).slice(2, 10),
        name: "",
        description: "",
        url: "",
        cta: "view live site",
        icon: "",
        shot: "",
        year: String(new Date().getFullYear()),
        featured: false,
    };
}

export const DEFAULT_PROJECTS: Project[] = [
    {
        id: "grief",
        name: "grief",
        description:
            "the public site for my discord bot: landing page, searchable command browser, live status board, changelog, embed builder and a per-server dashboard. next.js app router with no database — it renders the json the bot publishes.",
        url: "https://grief.pics",
        cta: "view live site",
        icon: "https://grief.pics/icon.png",
        shot: "/media/projects/grief-website.png",
        year: "2026",
        featured: true,
    },
];

/**
 * Upstream image hosts that send `Cross-Origin-Resource-Policy: same-origin`
 * (or otherwise block hotlinking) and must be served through /api/img.
 */
export const IMAGE_PROXY_HOSTS = [
    "lastfm.freetls.fastly.net",
    "lastfm-img.freetls.fastly.net",
    "lastfm-img2.akamaized.net",
    "cdn.discordapp.com",
    "media.discordapp.net",
    "i.scdn.co",
    "e-cdns-images.dzcdn.net",
    "cdns-images.dzcdn.net",
    "is1-ssl.mzstatic.com",
    "is2-ssl.mzstatic.com",
    "is3-ssl.mzstatic.com",
    "is4-ssl.mzstatic.com",
    "is5-ssl.mzstatic.com",
    "grief.pics",
    "www.grief.pics",
];

export function proxiedImage(src: string): string {
    if (!src) return "";
    let u: URL;
    try {
        u = new URL(src);
    } catch {
        return src;
    }
    if (u.protocol !== "https:" || !IMAGE_PROXY_HOSTS.includes(u.hostname)) {
        return src;
    }
    return `/api/img?url=${encodeURIComponent(u.toString())}`;
}
