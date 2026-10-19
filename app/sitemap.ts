import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/siteUrl";

/**
 * Every public page. `/admin` is deliberately absent (and disallowed in
 * robots.txt) — it is a private editor, not content.
 */
export default function sitemap(): MetadataRoute.Sitemap {
    const base = siteUrl();
    const now = new Date();
    const page = (
        path: string,
        priority: number,
        changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
    ) => ({
        url: `${base}${path}`,
        lastModified: now,
        changeFrequency,
        priority,
    });

    return [
        page("/", 1, "weekly"),
        page("/projects", 0.9, "weekly"),
        page("/commissions", 0.8, "monthly"),
        page("/music", 0.6, "daily"),
        page("/skills", 0.6, "monthly"),
        page("/contact", 0.6, "yearly"),
        page("/biolinks", 0.5, "monthly"),
        page("/guestbook", 0.4, "daily"),
    ];
}
