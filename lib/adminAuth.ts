import crypto from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "ryan_admin";
export const ADMIN_TTL_SECONDS = 60 * 60 * 24 * 7;

function secret(): string {
    return process.env.ADMIN_SECRET || process.env.VIEWS_SECRET || "";
}

function sign(value: string): string {
    return crypto.createHmac("sha256", secret()).update(value).digest("hex");
}

export function passwordConfigured(): boolean {
    return Boolean(process.env.ADMIN_PASSWORD);
}

export function checkPassword(input: unknown): boolean {
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected || typeof input !== "string" || !input) return false;
    const a = crypto.createHash("sha256").update(input).digest();
    const b = crypto.createHash("sha256").update(expected).digest();
    return crypto.timingSafeEqual(a, b);
}

export function makeToken(): string {
    const exp = String(Date.now() + ADMIN_TTL_SECONDS * 1000);
    return `${exp}.${sign(exp)}`;
}

export function verifyToken(token: string | undefined): boolean {
    if (!token || !secret()) return false;
    const [exp, sig] = token.split(".");
    if (!exp || !sig) return false;
    const expected = sign(exp);
    if (sig.length !== expected.length) return false;
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
        return false;
    }
    const expires = Number(exp);
    return Number.isFinite(expires) && expires > Date.now();
}

export async function isAuthed(): Promise<boolean> {
    return verifyToken(cookies().get(ADMIN_COOKIE)?.value);
}
