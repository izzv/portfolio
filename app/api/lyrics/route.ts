import { NextRequest, NextResponse } from "next/server";
import { getLyrics } from "@/lib/lastfm";
import { getCachedLyrics, saveLyrics } from "@/lib/lyricsCache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
    const artist = req.nextUrl.searchParams.get("artist") || "";
    const track = req.nextUrl.searchParams.get("track") || "";
    const album = req.nextUrl.searchParams.get("album") || "";
    const spotifyId = req.nextUrl.searchParams.get("spotifyId") || "";
    try {
        const cached = await getCachedLyrics(artist, track, spotifyId);
        if (cached) {
            return NextResponse.json(
                { lines: cached, cached: true },
                { headers: { "Cache-Control": "no-store" } },
            );
        }
        const res = await getLyrics(artist, track, album, spotifyId);
        if (res.lines?.length)
            await saveLyrics(artist, track, album, res.lines, spotifyId);
        return NextResponse.json(res, {
            headers: { "Cache-Control": "no-store" },
        });
    } catch (e: any) {
        return NextResponse.json(
            { lines: [], error: e?.message },
            { status: 200 },
        );
    }
}
