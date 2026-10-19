/**
 * The site answers on several domains. One of them is canonical — it is what
 * the sitemap, Open Graph tags, JSON-LD and share links use — and every other
 * host 301s to it in `middleware.ts` so search engines only ever see one URL
 * per page.
 *
 * Adding a domain: add it here, point its DNS at the project, and add it under
 * Vercel → Settings → Domains. Nothing else changes.
 */

/** Bare host that owns the content. */
export const CANONICAL_HOST = "ryan.ong";

/** Hosts that permanently redirect to the canonical one. */
export const ALIAS_HOSTS = [
    "www.ryan.ong",
    "ryandev.lol",
    "www.ryandev.lol",
    "ryanbuttlord.fun",
    "www.ryanbuttlord.fun",
];

/** `host:port` -> host, lowercased. */
export function hostOf(header: string | null): string {
    return (header || "")
        .trim()
        .toLowerCase()
        .replace(/^\[.*\]:\d+$/, "")
        .replace(/:\d+$/, "");
}

export function isAliasHost(header: string | null): boolean {
    const host = hostOf(header);
    return ALIAS_HOSTS.includes(host);
}
