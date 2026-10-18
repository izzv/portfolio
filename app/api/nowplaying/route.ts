import { NextResponse } from "next/server";
import { getNowPlaying } from "@/lib/lastfm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
    try {
        return NextResponse.json(await getNowPlaying(), {
            headers: { "Cache-Control": "no-store" },
        });
    } catch (e: any) {
        return NextResponse.json(
            { isPlaying: false, error: e?.message },
            { status: 200 },
        );
    }
}
