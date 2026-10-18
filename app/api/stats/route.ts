import { NextResponse } from "next/server";
import { getUserInfo } from "@/lib/lastfm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
    try {
        return NextResponse.json(await getUserInfo(), {
            headers: { "Cache-Control": "no-store" },
        });
    } catch (e: any) {
        return NextResponse.json({ error: e?.message }, { status: 200 });
    }
}
