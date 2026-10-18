import { NextRequest } from "next/server";
import { IMAGE_PROXY_HOSTS } from "@/lib/projects";

export const dynamic = "force-dynamic";

const ALLOWED = IMAGE_PROXY_HOSTS;

export async function GET(req: NextRequest) {
    const raw = req.nextUrl.searchParams.get("url");
    if (!raw) return new Response("missing url", { status: 400 });
    let target: URL;
    try {
        target = new URL(raw);
    } catch {
        return new Response("bad url", { status: 400 });
    }
    if (target.protocol !== "https:" || !ALLOWED.includes(target.hostname)) {
        return new Response("forbidden host", { status: 403 });
    }
    try {
        const upstream = await fetch(target.toString(), {
            headers: { "User-Agent": "ryan-site/3.0" },
            cache: "no-store",
        });
        if (!upstream.ok)
            return new Response("upstream error", { status: 502 });
        const buf = await upstream.arrayBuffer();
        return new Response(buf, {
            headers: {
                "Content-Type":
                    upstream.headers.get("content-type") || "image/png",
                "Access-Control-Allow-Origin": "*",
                "Cache-Control": "public, max-age=3600",
            },
        });
    } catch (e: any) {
        return new Response("fetch failed", { status: 502 });
    }
}
