import { NextRequest, NextResponse } from "next/server";
import { exchangeCode } from "@/lib/spotify";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    const code = req.nextUrl.searchParams.get("code");
    const error = req.nextUrl.searchParams.get("error");
    if (error)
        return new NextResponse(`Spotify auth error: ${error}`, {
            status: 400,
        });
    if (!code) return new NextResponse("Missing code", { status: 400 });

    const tok = await exchangeCode(code);
    const refresh = tok?.refresh_token;
    if (!refresh) {
        return new NextResponse(
            `Failed to get refresh token: ${JSON.stringify(tok)}`,
            { status: 400 },
        );
    }

    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Spotify connected</title>
<style>body{background:#0a0a0c;color:#eee;font-family:ui-monospace,monospace;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;padding:24px}
.box{max-width:680px}h1{font-size:18px}code{display:block;word-break:break-all;background:#16161a;border:1px solid #ffffff1a;padding:14px;border-radius:10px;margin:12px 0;color:#7CFC9B}
p{color:#aaa;line-height:1.6;font-size:14px}</style></head>
<body><div class="box"><h1>✓ Spotify connected</h1>
<p>Add this line to your <b>.env.local</b>, then restart the dev server:</p>
<code>SPOTIFY_REFRESH_TOKEN=${refresh}</code>
<p>After restarting, your live Spotify playback (with exact progress + synced lyrics) will show on the site. This token is stored only on your server — visitors just see what you're playing.</p>
</div></body></html>`;
    return new NextResponse(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
    });
}
