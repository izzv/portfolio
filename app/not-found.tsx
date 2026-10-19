import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "404",
    robots: { index: false, follow: false },
};

const LINKS = [
    { href: "/", label: "home" },
    { href: "/projects", label: "projects" },
    { href: "/commissions", label: "commissions" },
    { href: "/contact", label: "contact" },
];

export default function NotFound() {
    return (
        <div className="grid grid-rows-[1fr] items-center justify-items-center min-h-[100dvh] p-4 pb-20 sm:p-24">
            <main className="flex flex-col gap-6 items-start max-w-[560px] w-full">
                <div className="anim-item space-y-4">
                    <div className="flex items-center gap-2 text-white/70">
                        <span className="h-[1px] w-4 bg-white/50" />
                        <span className="text-xs font-light tracking-wider">
                            404
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">
                        this page doesn&apos;t exist
                    </h1>
                    <p className="text-sm leading-relaxed text-white/80">
                        the link is broken, the page moved, or it never existed.
                        nothing is on fire.
                    </p>
                </div>

                <nav
                    aria-label="Where to go next"
                    className="anim-item flex flex-wrap gap-2.5"
                    style={{ animationDelay: "80ms" }}
                >
                    {LINKS.map((l) => (
                        <Link
                            key={l.href}
                            href={l.href}
                            className="lift inline-flex items-center justify-center rounded-md border border-white/[0.06] bg-cardColor/20 px-3 py-2 text-xs text-[#adadad] outline-none backdrop-blur-md transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-white/30"
                        >
                            {l.label}
                        </Link>
                    ))}
                </nav>

                <p className="anim-item text-xs text-white/40">
                    tip: press{" "}
                    <kbd className="rounded border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 font-sans text-[10px] text-white/60">
                        Ctrl
                    </kbd>{" "}
                    <kbd className="rounded border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 font-sans text-[10px] text-white/60">
                        K
                    </kbd>{" "}
                    anywhere to search the site.
                </p>
            </main>
        </div>
    );
}
