import { NextRequest, NextResponse } from "next/server";
import {
    ADMIN_COOKIE,
    ADMIN_TTL_SECONDS,
    checkPassword,
    makeToken,
    passwordConfigured,
} from "@/lib/adminAuth";
import { log } from "@/lib/logger";

export const dynamic = "force-dynamic";

const WINDOW_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 8;
const attempts = new Map<string, { count: number; reset: number }>();

function clientIp(req: NextRequest): string {
    const xff = req.headers.get("x-forwarded-for");
    if (xff) return xff.split(",")[0].trim();
    return req.headers.get("x-real-ip") || "unknown";
}

function isHttps(req: NextRequest): boolean {
    return (
        req.nextUrl.protocol === "https:" ||
        req.headers.get("x-forwarded-proto") === "https"
    );
}

export async function POST(req: NextRequest) {
    if (!passwordConfigured()) {
        log("error", "admin", "ADMIN_PASSWORD is not set");
        return NextResponse.json(
            { error: "admin password is not configured" },
            { status: 500 },
        );
    }

    const ip = clientIp(req);
    const now = Date.now();
    const record = attempts.get(ip);
    if (record && record.reset > now && record.count >= MAX_ATTEMPTS) {
        const retry = Math.ceil((record.reset - now) / 1000);
        return NextResponse.json(
            { error: `too many attempts, try again in ${retry}s` },
            { status: 429 },
        );
    }

    let password: unknown = "";
    try {
        const body = await req.json();
        password = body?.password;
    } catch {
        log("warn", "admin", "invalid login body", { ip });
    }

    if (!checkPassword(password)) {
        const fresh = !record || record.reset <= now;
        attempts.set(ip, {
            count: fresh ? 1 : record.count + 1,
            reset: fresh ? now + WINDOW_MS : record.reset,
        });
        log("warn", "admin", "failed login", { ip });
        return NextResponse.json(
            { error: "wrong password" },
            { status: 401 },
        );
    }

    attempts.delete(ip);
    log("info", "admin", "login ok", { ip });
    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE, makeToken(), {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: ADMIN_TTL_SECONDS,
        secure: isHttps(req),
    });
    return res;
}
