import Guestbook from "@/components/Guestbook";
import Section from "@/components/sections/Section";
import type { GuestEntry } from "@/lib/guestbook";

export default function GuestbookSection({
    entries,
}: {
    entries: GuestEntry[];
}) {
    return (
        <Section id="guestbook">
            <div data-reveal="" className="space-y-4">
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

            <Guestbook entries={entries} />
        </Section>
    );
}
