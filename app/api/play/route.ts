import { NextRequest, NextResponse } from "next/server";
import { resolvePreview } from "@/lib/lastfm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
    const artist = req.nextUrl.searchParams.get("artist") || "";
    const track = req.nextUrl.searchParams.get("track") || "";
    if (!artist && !track)
        return NextResponse.json(
            { audio: null, error: "missing params" },
            { status: 400 },
        );
    try {
        return NextResponse.json(await resolvePreview(artist, track), {
            headers: { "Cache-Control": "no-store" },
        });
    } catch (e: any) {
        return NextResponse.json(
            { audio: null, error: e?.message },
            { status: 200 },
        );
    }
}
