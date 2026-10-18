import { NextRequest, NextResponse } from "next/server";
import { getCanvasUrl } from "@/lib/canvas";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    const id = req.nextUrl.searchParams.get("id") || "";
    if (!/^[A-Za-z0-9]{22}$/.test(id)) {
        return NextResponse.json({ error: "bad track id" }, { status: 400 });
    }
    const url = await getCanvasUrl(id);
    return NextResponse.json(
        { id, url },
        {
            headers: {
                // Canvas URLs are stable per track; let the CDN hold onto them.
                "Cache-Control": url
                    ? "public, s-maxage=3600, stale-while-revalidate=86400"
                    : "no-store",
            },
        },
    );
}
