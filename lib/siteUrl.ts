import { CANONICAL_HOST } from "./domains";

/**
 * The site's public origin, with no trailing slash.
 *
 * Metadata (Open Graph, JSON-LD), the sitemap and robots all need absolute
 * URLs, and with several domains pointed at the same deployment they must all
 * agree on one: the canonical host. `NEXT_PUBLIC_SITE_URL` overrides it (useful
 * for a staging deploy), otherwise it is the domain in `lib/domains.ts`.
 */
export function siteUrl(): string {
    const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
    if (explicit) return explicit.replace(/\/+$/, "");
    return `https://${CANONICAL_HOST}`;
}

export function absoluteUrl(path = "/"): string {
    return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}
