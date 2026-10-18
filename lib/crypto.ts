import crypto from "crypto";

const ALGO = "aes-256-gcm";
const VERSION = 1;
const MAGIC = `v${VERSION}:nXyYCoDeShAhA`;
const IV_BYTES = 12;
const KEY_BYTES = 32;
const SALT = "hero-views-static-salt";

function keyFrom(secret: string): Buffer {
    return crypto.scryptSync(secret, SALT, KEY_BYTES);
}

function secret(): string {
    const v = process.env.VIEWS_SECRET;
    if (!v) throw new Error("VIEWS_SECRET is not set");
    return v;
}

export function encryptJSON(value: unknown): string {
    const key = keyFrom(secret());
    const iv = crypto.randomBytes(IV_BYTES);
    const cipher = crypto.createCipheriv(ALGO, key, iv);
    const plain = Buffer.from(JSON.stringify(value), "utf8");
    const enc = Buffer.concat([cipher.update(plain), cipher.final()]);
    const tag = cipher.getAuthTag();
    return [MAGIC, iv.toString("base64"), tag.toString("base64"), enc.toString("base64")].join(".");
}

export function decryptJSON<T>(blob: string): T | null {
    try {
        const parts = blob.trim().split(".");
        if (parts.length !== 4 || parts[0] !== MAGIC) return null;
        const key = keyFrom(secret());
        const iv = Buffer.from(parts[1], "base64");
        const tag = Buffer.from(parts[2], "base64");
        const data = Buffer.from(parts[3], "base64");
        const decipher = crypto.createDecipheriv(ALGO, key, iv);
        decipher.setAuthTag(tag);
        const dec = Buffer.concat([decipher.update(data), decipher.final()]);
        return JSON.parse(dec.toString("utf8")) as T;
    } catch {
        return null;
    }
}
