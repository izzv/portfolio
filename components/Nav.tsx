"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useEffect, useRef, useState } from "react";
import { useExperience, type RGB } from "./ExperienceProvider";
import { useSite } from "./SiteProvider";
import { navIcon } from "@/lib/navIcons";
import { NAV_GROUPS, type NavGroup } from "@/lib/siteConfig";

function tint(
    [r, g, b]: RGB,
    base: number,
    mix: number,
    alpha: number,
): string {
    const c = (v: number) => Math.min(255, Math.round(base + v * mix));
    return `rgba(${c(r)},${c(g)},${c(b)},${alpha})`;
}

export default function Nav() {
    const pathname = usePathname();
    const { primary } = useExperience();
    const { nav } = useSite();

    const groupRank = (g: NavGroup) => {
        const i = NAV_GROUPS.indexOf(g);
        return i === -1 ? NAV_GROUPS.length : i;
    };
    // Groups stay contiguous and in a fixed order (core → work → social); the
    // order picked in /admin is kept inside each group.
    const ITEMS = nav
        .filter((it) => !it.hidden)
        .map((it, i) => ({ it, i }))
        .sort(
            (a, b) =>
                groupRank(a.it.group) - groupRank(b.it.group) || a.i - b.i,
        )
        .map(({ it }) => {
            const icon = navIcon(it.icon);
            return { ...it, viewBox: icon.viewBox, path: icon.path };
        });

    const navBg = tint(primary, 7, 0.2, 0.72);
    const navBorder = tint(primary, 36, 0.32, 0.16);
    const tipBg = tint(primary, 11, 0.26, 0.94);
    const tipBorder = tint(primary, 40, 0.34, 0.2);
    const glow = tint(primary, 0, 0.5, 0.22);
    const activeBg = tint(primary, 40, 0.55, 0.32);
    const activeBorder = tint(primary, 95, 0.6, 0.5);
    const activeInk = tint(primary, 130, 0.55, 1);

    const activeIndex = ITEMS.findIndex((it) =>
        it.href === "/" ? pathname === "/" : pathname.startsWith(it.href),
    );
    const ulRef = useRef<HTMLUListElement>(null);
    const itemRefs = useRef<Array<HTMLAnchorElement | null>>([]);
    const [box, setBox] = useState({ x: 0, y: 0, w: 0, h: 0, ready: false });

    useEffect(() => {
        const measure = () => {
            const ul = ulRef.current;
            const el = itemRefs.current[activeIndex];
            if (!ul || !el) {
                setBox((b) => ({ ...b, ready: false }));
                return;
            }
            const ur = ul.getBoundingClientRect();
            const er = el.getBoundingClientRect();
            setBox({
                x: er.left - ur.left,
                y: er.top - ur.top,
                w: er.width,
                h: er.height,
                ready: true,
            });
        };
        measure();
        const id = setTimeout(measure, 90);
        window.addEventListener("resize", measure);
        return () => {
            clearTimeout(id);
            window.removeEventListener("resize", measure);
        };
    }, [activeIndex, pathname]);

    return (
        <nav
            aria-label="Primary"
            style={
                {
                    background: navBg,
                    borderColor: navBorder,
                    boxShadow: `0 20px 44px -20px ${glow}, 0 20px 40px -20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)`,
                    ["--tip-bg" as string]: tipBg,
                    ["--tip-border" as string]: tipBorder,
                } as React.CSSProperties
            }
            className="site-nav rounded-xl border p-1 backdrop-blur-xl transition-[background,border-color,box-shadow] duration-700 ease-out sm:rounded-lg"
        >
            <ul
                ref={ulRef}
                className="relative flex flex-row gap-0.5 sm:flex-col"
            >
                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-0 top-0 z-0 rounded-md"
                    style={{
                        width: box.w,
                        height: box.h,
                        transform: `translate(${box.x}px, ${box.y}px)`,
                        background: activeBg,
                        boxShadow: `inset 0 0 0 1px ${activeBorder}`,
                        opacity: box.ready ? 1 : 0,
                        transition:
                            "transform 420ms cubic-bezier(0.22, 1, 0.36, 1), width 420ms cubic-bezier(0.22, 1, 0.36, 1), height 420ms cubic-bezier(0.22, 1, 0.36, 1), background 300ms, box-shadow 300ms, opacity 220ms",
                    }}
                />
                {ITEMS.map((it, i) => {
                    const active = i === activeIndex;
                    const startsGroup =
                        i > 0 && ITEMS[i - 1].group !== it.group;
                    return (
                        <Fragment key={it.href}>
                            {startsGroup && (
                                <li
                                    className="nav-sep"
                                    aria-hidden="true"
                                />
                            )}
                            <li className="nav-item relative">
                                <Link
                                    ref={(el) => {
                                        itemRefs.current[i] = el;
                                    }}
                                    aria-current={active ? "page" : undefined}
                                    aria-label={it.label}
                                    href={it.href}
                                    className={
                                        "relative z-10 flex h-8 items-center justify-center rounded-md px-2.5 outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-white/30 sm:h-8 sm:w-8 sm:px-0 " +
                                        (active
                                            ? ""
                                            : "text-white/45 hover:text-white/85")
                                    }
                                >
                                    <span
                                        className="relative z-10 inline-flex items-center transition-colors duration-300"
                                        style={
                                            active
                                                ? { color: activeInk }
                                                : undefined
                                        }
                                    >
                                        <svg
                                            stroke="currentColor"
                                            fill="currentColor"
                                            strokeWidth="0"
                                            viewBox={it.viewBox}
                                            style={{
                                                width: 16,
                                                height: 16,
                                                flexShrink: 0,
                                            }}
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path d={it.path} />
                                        </svg>
                                    </span>
                                </Link>
                                <span className="nav-tip" role="tooltip">
                                    {it.label}
                                </span>
                            </li>
                        </Fragment>
                    );
                })}
            </ul>
        </nav>
    );
}
