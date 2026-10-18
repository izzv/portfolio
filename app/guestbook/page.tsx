import type { Metadata } from "next";
import Guestbook from "@/components/Guestbook";
import { getSite } from "@/lib/siteStore";
import { getGuestbook } from "@/lib/guestbookStore";
import { approvedEntries } from "@/lib/guestbook";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
    const site = await getSite();
    return {
        title: `guestbook — ${site.name}`,
        description: `leave a note for ${site.name}.`,
    };
}

export default async function GuestbookPage() {
    const [, entries] = await Promise.all([getSite(), getGuestbook()]);

    return (
        <div className="grid grid-rows-[1fr] items-start justify-items-center min-h-[100dvh] p-4 pb-20 sm:p-24">
            <main className="flex flex-col gap-8 items-start max-w-[680px] w-full">
                <div className="anim-item space-y-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-white/70">
                            <span className="h-[1px] w-4 bg-white/50" />
                            <span className="text-xs font-light tracking-wider">
                                say hi
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-white">
                            guestbook
                        </h1>
                    </div>
                    <p className="text-white/80 text-sm leading-relaxed max-w-[85%]">
                        the wall. leave a note, a link, or just a thought —
                        everything is read before it goes up.
                    </p>
                </div>

                <Guestbook entries={approvedEntries(entries)} />
            </main>
        </div>
    );
}
