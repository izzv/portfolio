import type { Metadata } from "next";
import Link from "next/link";
import { getSite } from "@/lib/siteStore";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
    const site = await getSite();
    return {
        title: `commissions — ${site.name}`,
        description: `work with ${site.name}. crypto only.`,
        alternates: { canonical: "/commissions" },
    };
}

export default async function CommissionsPage() {
    const site = await getSite();
    const c = site.commission;
    const coins = c.coins
        .split(",")
        .map((coin) => coin.trim())
        .filter(Boolean);

    return (
        <div className="cm-page">
            <main className="cm-shell">
                <header className="cm-head anim-item">
                    <div className="cm-eyebrow">
                        <span className="cm-rule" aria-hidden="true" />
                        work with me
                    </div>
                    <h1>commissions</h1>
                    <p className="cm-lede">
                        websites, bots, dashboards and the backend behind them.
                        small scope, fixed price, no agency runaround.
                    </p>

                    <div className="cm-status">
                        <span
                            className={`cm-status-dot${
                                c.enabled ? " is-open" : ""
                            }`}
                            aria-hidden="true"
                        />
                        <span className="cm-status-label">
                            {c.enabled ? "open right now" : "closed right now"}
                        </span>
                        <span className="cm-sep" aria-hidden="true">
                            ·
                        </span>
                        <span className="cm-status-price">
                            from <strong>{c.price}</strong>
                        </span>
                        <span className="cm-sep" aria-hidden="true">
                            ·
                        </span>
                        <span className="cm-status-crypto">crypto only</span>
                    </div>
                </header>

                <section className="cm-payment anim-item" aria-labelledby="pay">
                    <div className="cm-pay-top">
                        <h2 id="pay">payment</h2>
                        <span className="cm-pay-badge">crypto only</span>
                    </div>
                    <p>
                        paid in crypto, up front for new clients or half/half
                        for larger builds. no paypal, no cards, no bank
                        transfers — if it isn&apos;t on-chain, it isn&apos;t a
                        slot.
                    </p>
                    <ul className="cm-coins">
                        {coins.map((coin) => (
                            <li key={coin}>{coin}</li>
                        ))}
                    </ul>
                    <p className="cm-fine">
                        other majors on request. network fees are on the
                        sender; the quote is the amount that lands in the
                        wallet.
                    </p>
                </section>

                <div className="cm-grid">
                    <section
                        className="cm-card anim-item"
                        aria-labelledby="build"
                        style={{ animationDelay: "80ms" }}
                    >
                        <h2 id="build">what i build</h2>
                        <ul>
                            <li>websites &amp; landing pages</li>
                            <li>discord bots &amp; integrations</li>
                            <li>web apps &amp; dashboards</li>
                            <li>api &amp; backend work</li>
                            <li>polish passes on something you already have</li>
                        </ul>
                    </section>

                    <section
                        className="cm-card anim-item"
                        aria-labelledby="how"
                        style={{ animationDelay: "150ms" }}
                    >
                        <h2 id="how">how it works</h2>
                        <ol>
                            <li>
                                <span>01</span>
                                you send the scope, deadline and budget in
                                crypto terms.
                            </li>
                            <li>
                                <span>02</span>
                                i reply with a fixed quote and what is / isn&apos;t
                                included.
                            </li>
                            <li>
                                <span>03</span>
                                payment clears, i build, you get the repo and the
                                deploy.
                            </li>
                        </ol>
                    </section>
                </div>

                <section
                    className="cm-cta anim-item"
                    style={{ animationDelay: "220ms" }}
                >
                    <div>
                        <h2>got something in mind?</h2>
                        <p>
                            {c.enabled
                                ? "slot is open — message me with the details."
                                : "the queue is closed for now, but you can still ask about the next slot."}
                        </p>
                    </div>
                    <div className="cm-cta-actions">
                        <a
                            href={`https://discord.com/users/${site.socials.discord}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cm-btn cm-btn-primary"
                        >
                            message on discord
                        </a>
                        <Link href="/contact" className="cm-btn">
                            other ways to reach me
                        </Link>
                    </div>
                </section>
            </main>
        </div>
    );
}
