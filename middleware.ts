import { NextRequest, NextResponse } from "next/server";
import { CANONICAL_HOST, isAliasHost } from "@/lib/domains";

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
    // The site answers on several domains; only one may be indexed, so every
    // alias host permanently redirects there with the path and query intact.
    if (isAliasHost(req.headers.get("host"))) {
        const target = new URL(
            `${req.nextUrl.pathname}${req.nextUrl.search}`,
            `https://${CANONICAL_HOST}`,
        );
        return NextResponse.redirect(target, 308);
    }

    const { pathname } = req.nextUrl;
    const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
    const isApi = pathname.startsWith("/api/admin");
    if (!isAdmin && !isApi) return NextResponse.next();

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
    // Everything except the build output and the icon, so alias domains are
    // caught before any page is rendered.
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
