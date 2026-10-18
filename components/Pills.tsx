"use client";

import { SiLastdotfm, SiRoblox } from "react-icons/si";
import { useSite } from "./SiteProvider";

const SHADOW =
    "shadow-[0px_32px_64px_-16px_#0000004c,0px_16px_32px_-8px_#0000004c,0px_8px_16px_-4px_#0000003d,0px_4px_8px_-2px_#0000003d,0px_-8px_16px_-1px_#00000029,0px_2px_4px_-1px_#0000003d,inset_0px_0px_0px_1px_#ffffff14,inset_0px_1px_0px_#ffffff33]";
const SHADOW_HOVER =
    "hover:shadow-[0px_16px_32px_-8px_#0000004c,0px_8px_16px_-4px_#0000003d,0px_4px_8px_-2px_#0000003d,0px_2px_4px_-1px_#0000003d,inset_0px_0px_0px_1px_#ffffff14,inset_0px_1px_0px_#ffffff33]";
const SHADOW_ACTIVE =
    "active:shadow-[0px_8px_16px_-4px_#0000003d,0px_4px_8px_-2px_#0000003d,0px_2px_4px_-1px_#0000003d,inset_0px_0px_0px_1px_#ffffff14,inset_0px_1px_0px_#ffffff33]";

const PILL = `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md transition-all duration-150 [&_svg]:size-3.5 [&_svg]:shrink-0 bg-cardColor/20 backdrop-blur-md hover:bg-cardColorForeground/30 py-2 h-6 px-2.5 text-xs ${SHADOW} ${SHADOW_HOVER} hover:translate-y-[0.5px] ${SHADOW_ACTIVE} active:translate-y-[1px]`;
const LINK_PILL = `${PILL} hover:text-brand cursor-pointer text-[#adadad]`;
const PLAIN_PILL = `${PILL} cursor-pointer text-white/85 hover:text-white`;

export default function Pills() {
    const site = useSite();
    return (
        <div className="mt-1 flex w-full flex-row flex-wrap gap-2.5">
            <a
                className={`${LINK_PILL} ${!site.commission.enabled ? "flex-1" : ""}`}
                target="_blank"
                rel="noopener noreferrer"
                href={`https://discord.com/users/${site.socials.discord}`}
            >
                <svg
                    viewBox="0 0 32 32"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    className="text-white/60"
                    fill="currentColor"
                >
                    <path d="M26.413,6.536c-1.971-.902-4.052-1.543-6.189-1.904-.292,.523-.557,1.061-.793,1.612-2.277-.343-4.592-.343-6.869,0-.236-.551-.5-1.089-.793-1.612-2.139,.365-4.221,1.006-6.194,1.909C1.658,12.336,.596,17.987,1.127,23.558h0c2.294,1.695,4.861,2.984,7.591,3.811,.615-.827,1.158-1.704,1.626-2.622-.888-.332-1.744-.741-2.56-1.222,.215-.156,.425-.316,.628-.472,4.806,2.26,10.37,2.26,15.177,0,.205,.168,.415,.328,.628,.472-.817,.483-1.676,.892-2.565,1.225,.467,.918,1.011,1.794,1.626,2.619,2.732-.824,5.301-2.112,7.596-3.808h0c.623-6.461-1.064-12.06-4.46-17.025Zm-15.396,13.596c-1.479,0-2.702-1.343-2.702-2.994s1.18-3.006,2.697-3.006,2.73,1.354,2.704,3.006-1.192,2.994-2.699,2.994Zm9.967,0c-1.482,0-2.699-1.343-2.699-2.994s1.18-3.006,2.699-3.006,2.723,1.354,2.697,3.006-1.189,2.994-2.697,2.994Z" />
                </svg>
                <span className="hidden sm:inline">Discord</span>
            </a>

            <a
                className={`${LINK_PILL} ${!site.commission.enabled ? "flex-1" : ""}`}
                target="_blank"
                rel="noopener noreferrer"
                href={site.socials.github}
            >
                <svg
                    viewBox="0 0 32 32"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    className="text-white/60"
                    fill="currentColor"
                >
                    <path d="M16,2.345c7.735,0,14,6.265,14,14-.002,6.015-3.839,11.359-9.537,13.282-.7,.14-.963-.298-.963-.665,0-.473,.018-1.978,.018-3.85,0-1.312-.437-2.152-.945-2.59,3.115-.35,6.388-1.54,6.388-6.912,0-1.54-.543-2.783-1.435-3.762,.14-.35,.63-1.785-.14-3.71,0,0-1.173-.385-3.85,1.435-1.12-.315-2.31-.472-3.5-.472s-2.38,.157-3.5,.472c-2.677-1.802-3.85-1.435-3.85-1.435-.77,1.925-.28,3.36-.14,3.71-.892,.98-1.435,2.24-1.435,3.762,0,5.355,3.255,6.563,6.37,6.913-.403,.35-.77,.963-.893,1.872-.805,.368-2.818,.963-4.077-1.155-.263-.42-1.05-1.452-2.152-1.435-1.173,.018-.472,.665,.017,.927,.595,.332,1.277,1.575,1.435,1.978,.28,.787,1.19,2.293,4.707,1.645,0,1.173,.018,2.275,.018,2.607,0,.368-.263,.787-.963,.665-5.719-1.904-9.576-7.255-9.573-13.283,0-7.735,6.265-14,14-14Z" />
                </svg>
                <span className="hidden sm:inline">GitHub</span>
            </a>

            <a
                className={`${LINK_PILL} ${!site.commission.enabled ? "flex-1" : ""}`}
                target="_blank"
                rel="noopener noreferrer"
                href={`https://t.me/${site.socials.telegram}`}
            >
                <svg
                    viewBox="0 0 32 32"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    className="text-white/60"
                    fill="currentColor"
                >
                    <path d="M16,2c-7.732,0-14,6.268-14,14s6.268,14,14,14,14-6.268,14-14S23.732,2,16,2Zm6.489,9.521c-.211,2.214-1.122,7.586-1.586,10.065-.196,1.049-.583,1.401-.957,1.435-.813,.075-1.43-.537-2.218-1.053-1.232-.808-1.928-1.311-3.124-2.099-1.382-.911-.486-1.412,.302-2.23,.206-.214,3.788-3.472,3.858-3.768,.009-.037,.017-.175-.065-.248-.082-.073-.203-.048-.29-.028-.124,.028-2.092,1.329-5.905,3.903-.559,.384-1.065,.571-1.518,.561-.5-.011-1.461-.283-2.176-.515-.877-.285-1.574-.436-1.513-.92,.032-.252,.379-.51,1.042-.773,4.081-1.778,6.803-2.95,8.164-3.517,3.888-1.617,4.696-1.898,5.222-1.907,.116-.002,.375,.027,.543,.163,.142,.115,.181,.27,.199,.379,.019,.109,.042,.357,.023,.551Z" />
                </svg>
                <span className="hidden sm:inline">Telegram</span>
            </a>

            <a
                className={`${LINK_PILL} ${!site.commission.enabled ? "flex-1" : ""}`}
                target="_blank"
                rel="noopener noreferrer"
                href={site.socials.lastfm}
            >
                <SiLastdotfm className="text-white/60" />
                <span className="hidden sm:inline">Last.fm</span>
            </a>

            <a
                className={`${LINK_PILL} ${!site.commission.enabled ? "flex-1" : ""}`}
                target="_blank"
                rel="noopener noreferrer"
                href={site.socials.roblox}
            >
                <SiRoblox className="text-white/60" />
                <span className="hidden sm:inline">Roblox</span>
            </a>

            {site.commission.enabled && (
            <button className={PLAIN_PILL}>
                <span className="relative inline-flex size-1.5 shrink-0 items-center justify-center">
                    <span className="absolute inset-0 animate-ping rounded-full bg-white/40 opacity-75" />
                    <span className="relative size-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.65)]" />
                </span>
                <span>{site.commission.label}</span>
                <span className="hidden text-white/25 sm:inline">·</span>
                <span className="hidden text-white/55 sm:inline">
                    {site.commission.price}
                </span>
            </button>
            )}
        </div>
    );
}
