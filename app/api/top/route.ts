import { NextRequest, NextResponse } from "next/server";
import { getTop } from "@/lib/lastfm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
    const type = (req.nextUrl.searchParams.get("type") || "albums") as
        | "albums"
        | "tracks"
        | "artists";
    const period = req.nextUrl.searchParams.get("period") || "1month";
    const limit = Number(req.nextUrl.searchParams.get("limit") || 24);
    try {
        return NextResponse.json(
            { items: await getTop(type, period, limit) },
            { headers: { "Cache-Control": "no-store" } },
        );
    } catch (e: any) {
        return NextResponse.json(
            { items: [], error: e?.message },
            { status: 200 },
        );
    }
}
