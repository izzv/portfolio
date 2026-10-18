import { NextResponse } from "next/server";
import { getNowPlaying, type NowPlaying } from "@/lib/lastfm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// The client polls every 2s for fast track changes; coalesce concurrent
// visitors onto one upstream call and keep Last.fm well inside its rate limit.
const MEMO_MS = 900;
let memo: { at: number; data: NowPlaying } | null = null;
let inflight: Promise<NowPlaying> | null = null;

async function nowPlaying(): Promise<NowPlaying> {
    if (memo && Date.now() - memo.at < MEMO_MS) return memo.data;
    if (inflight) return inflight;
    inflight = (async () => {
        try {
            const data = await getNowPlaying();
            memo = { at: Date.now(), data };
            return data;
        } finally {
            inflight = null;
        }
    })();
    return inflight;
}

export async function GET() {
    try {
        return NextResponse.json(await nowPlaying(), {
            headers: { "Cache-Control": "no-store" },
        });
    } catch (e: any) {
        return NextResponse.json(
            { isPlaying: false, error: e?.message },
            { status: 200 },
        );
    }
}
