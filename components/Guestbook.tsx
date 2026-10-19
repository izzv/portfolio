"use client";

import { useState } from "react";
import {
    GUEST_MESSAGE_MAX,
    GUEST_NAME_MAX,
    type GuestEntry,
} from "@/lib/guestbook";

function initial(name: string): string {
    return (name.trim()[0] || "?").toUpperCase();
}

export default function Guestbook({
    entries,
}: {
    entries: GuestEntry[];
}) {
    const [name, setName] = useState("");
    const [message, setMessage] = useState("");
    const [url, setUrl] = useState("");
    const [trap, setTrap] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);

    async function submit(event: React.FormEvent) {
        event.preventDefault();
        if (busy) return;
        setBusy(true);
        setError(null);
        setPending(false);
        try {
            const res = await fetch("/api/guestbook", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, message, url, website: trap }),
            });
            const data = (await res.json().catch(() => ({}))) as {
                error?: string;
                pending?: boolean;
            };
            if (!res.ok) {
                setError(data.error || "could not save that — try again");
                return;
            }
            setPending(true);
            setName("");
            setMessage("");
            setUrl("");
        } catch {
            setError("could not reach the server — try again");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="gb-wrap">
            <form data-reveal="" className="gb-form" onSubmit={submit}>
                <div className="gb-form-head">
                    <h2>leave a note</h2>
                    <span>
                        {entries.length} {entries.length === 1 ? "note" : "notes"}
                    </span>
                </div>

                <div className="gb-row">
                    <label className="gb-field">
                        <span>name</span>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={GUEST_NAME_MAX}
                            placeholder="who are you?"
                            required
                            autoComplete="nickname"
                        />
                    </label>
                    <label className="gb-field">
                        <span>
                            link <em>optional</em>
                        </span>
                        <input
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://"
                            inputMode="url"
                            autoComplete="url"
                        />
                    </label>
                </div>

                <label className="gb-field">
                    <span>
                        message <em>{message.length}/{GUEST_MESSAGE_MAX}</em>
                    </span>
                    <textarea
                        value={message}
                        onChange={(e) =>
                            setMessage(e.target.value.slice(0, GUEST_MESSAGE_MAX))
                        }
                        rows={4}
                        maxLength={GUEST_MESSAGE_MAX}
                        placeholder="say something nice (or don't)"
                        required
                    />
                </label>

                {/* honeypot — hidden from people, irresistible to bots */}
                <input
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    className="gb-trap"
                    value={trap}
                    onChange={(e) => setTrap(e.target.value)}
                    name="website"
                />

                <div className="gb-actions">
                    <p className="gb-note">
                        notes show up once they&#x27;re approved — no accounts,
                        no tracking.
                    </p>
                    <button type="submit" className="gb-submit" disabled={busy}>
                        {busy ? "sending…" : "sign it"}
                    </button>
                </div>

                {error && <p className="gb-msg gb-msg-bad">{error}</p>}
                {pending && !error && (
                    <p className="gb-msg gb-msg-good">
                        got it — your note is waiting for approval.
                    </p>
                )}
            </form>

            <div className="gb-list">
                {entries.length === 0 && (
                    <p className="gb-empty">
                        nothing here yet. be the first to leave a mark.
                    </p>
                )}
                {entries.map((entry) => (
                    <article key={entry.id} data-reveal="" className="gb-entry">
                        <header>
                            <span className="gb-avatar" aria-hidden="true">
                                {initial(entry.name)}
                            </span>
                            <span className="gb-meta">
                                {entry.url ? (
                                    <a
                                        href={entry.url}
                                        target="_blank"
                                        rel="noopener noreferrer nofollow"
                                        className="gb-name"
                                    >
                                        {entry.name}
                                    </a>
                                ) : (
                                    <span className="gb-name">{entry.name}</span>
                                )}
                                <time dateTime={new Date(entry.createdAt).toISOString()}>
                                    {new Date(entry.createdAt)
                                        .toISOString()
                                        .slice(0, 10)}
                                </time>
                            </span>
                        </header>
                        <p>{entry.message}</p>
                    </article>
                ))}
            </div>
        </div>
    );
}
