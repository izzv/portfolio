import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/siteUrl";

/**
 * The site is one scrolling page; the old section routes redirect into it, so
 * only `/` is a real URL. `/admin` is deliberately absent (and disallowed in
 * robots.txt) — it is a private editor, not content.
 */
export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: `${siteUrl()}/`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 1,
        },
    ];
}
