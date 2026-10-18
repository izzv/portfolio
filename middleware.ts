import { NextRequest, NextResponse } from "next/server";

const COOKIE = "ryan_admin";

/**
 * Cheap pre-check: is there a session cookie with a plausible, unexpired
 * payload? The real HMAC verification happens in the Node runtime
 * (`lib/adminAuth.ts`) because the edge bundle inlines env vars at build time,
 * while the login route reads them at runtime.
 */
function hasSessionCookie(req: NextRequest): boolean {
    const token = req.cookies.get(COOKIE)?.value;
    if (!token) return false;
    const [exp, sig] = token.split(".");
    if (!exp || !sig) return false;
    const expires = Number(exp);
    return Number.isFinite(expires) && expires > Date.now();
}

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const isApi = pathname.startsWith("/api/admin");
    const isPublicApi =
        pathname === "/api/admin/login" || pathname === "/api/admin/logout";

    let res: NextResponse;

    if (isApi && !isPublicApi && !hasSessionCookie(req)) {
        res = NextResponse.json(
            { error: "unauthorized" },
            { status: 401 },
        );
    } else {
        res = NextResponse.next();
    }

    // Admin responses must never be cached or embedded elsewhere.
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.headers.set("Pragma", "no-cache");
    res.headers.set("Expires", "0");
    res.headers.set("X-Frame-Options", "DENY");
    res.headers.set("Content-Security-Policy", "frame-ancestors 'none'");
    res.headers.set("X-Content-Type-Options", "nosniff");
    res.headers.set("Referrer-Policy", "no-referrer");
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
}

export const config = {
    matcher: ["/admin/:path*", "/api/admin/:path*"],
};
