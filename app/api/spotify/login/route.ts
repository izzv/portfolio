import { NextResponse } from "next/server";
import { spotifyLoginUrl } from "@/lib/spotify";

export const dynamic = "force-dynamic";

export async function GET() {
    return NextResponse.redirect(spotifyLoginUrl());
}
