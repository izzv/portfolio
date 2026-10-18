"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin({ configured }: { configured: boolean }) {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    async function submit(event: React.FormEvent) {
        event.preventDefault();
        if (busy) return;
        setBusy(true);
        setError(null);
        try {
            const res = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });
            const data = (await res.json().catch(() => ({}))) as {
                error?: string;
            };
            if (!res.ok) {
                setError(data.error || "login failed");
                return;
            }
            setPassword("");
            router.refresh();
        } catch {
            setError("network error");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="flex min-h-[100dvh] flex-col items-center justify-center p-4 pb-24 sm:p-24">
            <main className="w-full max-w-[360px]">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-white/70">
                        <span className="h-[1px] w-4 bg-white/50" />
                        <span className="text-xs font-light tracking-wider">
                            admin
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">
                        projects
                    </h1>
                </div>

                {configured ? (
                    <form onSubmit={submit} className="mt-6 space-y-3">
                        <label
                            htmlFor="admin-password"
                            className="block text-xs text-white/60"
                        >
                            password
                        </label>
                        <input
                            id="admin-password"
                            type="password"
                            autoFocus
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-md border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-white/25"
                            placeholder="••••••••"
                        />
                        <button
                            type="submit"
                            disabled={busy || !password}
                            className="w-full rounded-md border border-white/[0.12] bg-white/[0.08] px-3 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-white/[0.14] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {busy ? "checking…" : "unlock"}
                        </button>
                        {error && (
                            <p className="text-xs text-red-300/90">{error}</p>
                        )}
                    </form>
                ) : (
                    <p className="mt-6 rounded-md border border-white/[0.08] bg-cardColor/20 px-3 py-3 text-xs leading-relaxed text-white/60">
                        no admin password is set. add{" "}
                        <code className="text-white/80">ADMIN_PASSWORD</code>{" "}
                        (and <code className="text-white/80">ADMIN_SECRET</code>
                        ) to <code className="text-white/80">.env.local</code>{" "}
                        and restart the server.
                    </p>
                )}
            </main>
        </div>
    );
}
