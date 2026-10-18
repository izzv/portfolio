import { NextRequest, NextResponse } from "next/server";
import { getViews, recordView } from "@/lib/viewsStore";
import { log } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function clientIp(req: NextRequest): string {
    const xff = req.headers.get("x-forwarded-for");
    if (xff) return xff.split(",")[0].trim();
    return req.headers.get("x-real-ip") || "unknown";
}

export async function GET() {
    const { total, uniqueDevices } = await getViews();
    return NextResponse.json(
        { views: total, uniqueDevices },
        { headers: { "Cache-Control": "no-store" } },
    );
}

export async function POST(req: NextRequest) {
    const ip = clientIp(req);
    const ua = req.headers.get("user-agent") || "unknown";

    let deviceId = "";
    try {
        const body = await req.json();
        if (typeof body?.deviceId === "string")
            deviceId = body.deviceId.trim().slice(0, 128);
    } catch {
        log("warn", "views", "invalid request body", { ip });
    }

    if (!deviceId) {
        const { total } = await getViews();
        log("warn", "views", "missing deviceId, not counted", {
            ip,
            ua: ua.slice(0, 60),
        });
        return NextResponse.json(
            { views: total, counted: false },
            { headers: { "Cache-Control": "no-store" } },
        );
    }

    const { total, unique, uniqueDevices } = await recordView(deviceId, {
        ua,
        ip,
    });
    log(
        unique ? "info" : "info",
        "views",
        unique ? "new unique device counted" : "known device revisit",
        {
            device: deviceId.slice(0, 12),
            ip,
            total,
            uniqueDevices,
        },
    );

    return NextResponse.json(
        { views: total, counted: unique, uniqueDevices },
        { headers: { "Cache-Control": "no-store" } },
    );
}
