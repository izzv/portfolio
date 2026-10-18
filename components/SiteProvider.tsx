"use client";

import { createContext, useContext } from "react";
import { DEFAULT_SITE, type SiteConfig } from "@/lib/siteConfig";

const SiteCtx = createContext<SiteConfig>(DEFAULT_SITE);

export default function SiteProvider({
    config,
    children,
}: {
    config: SiteConfig;
    children: React.ReactNode;
}) {
    return <SiteCtx.Provider value={config}>{children}</SiteCtx.Provider>;
}

export function useSite(): SiteConfig {
    return useContext(SiteCtx);
}
