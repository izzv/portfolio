"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useExperience, type RGB } from "./ExperienceProvider";
import { clock, trackKey, usePreview } from "./PreviewProvider";

function tint([r, g, b]: RGB, base: number, mix: number, alpha: number): string {
  const c = (v: number) => Math.min(255, Math.round(base + v * mix));
  return `rgba(${c(r)},${c(g)},${c(b)},${alpha})`;
}

type Item = { rank: number; name: string; artist: string; plays: number; image: string; url: string };

const TABS = ["albums", "tracks", "favourite", "stats"] as const;
type Tab = (typeof TABS)[number];

function isTab(v: string | null): v is Tab {
  return !!v && (TABS as readonly string[]).includes(v);
}
const LABELS: Record<(typeof TABS)[number], string> = {
  albums: "Albums",
  tracks: "Tracks",
  favourite: "Favourite",
  stats: "Stats"
};

export default function MusicTabs() {
  const searchParams = useSearchParams();
  const { primary } = useExperience();

  const lum = (0.299 * primary[0] + 0.587 * primary[1] + 0.114 * primary[2]) / 255;
  const boxBase = Math.round(6 + (1 - lum) * 26);
  const indicatorBg = tint(primary, boxBase, 0.05, 0.62);
  const indicatorBorder = `rgba(255,255,255,${(0.08 + (1 - lum) * 0.1).toFixed(3)})`;
  const [tab, setTab] = useState<Tab>(() => {
    const t = searchParams.get("tab");
    return isTab(t) ? t : "albums";
  });

  useEffect(() => {
    const t = searchParams.get("tab");
    if (isTab(t)) setTab(t);
  }, [searchParams]);

  function selectTab(v: Tab) {
    setTab(v);
    // The section lives on the home page now; keep the tab in the URL without
    // navigating away from the scroll position.
    const url = new URL(window.location.href);
    url.searchParams.set("tab", v);
    window.history.replaceState(null, "", url);
  }
  const [albums, setAlbums] = useState<Item[]>([]);
  const [tracks, setTracks] = useState<Item[]>([]);
  const [artists, setArtists] = useState<Item[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selIdx, setSelIdx] = useState<number | null>(null);
  const preview = usePreview();

  const listRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [indicator, setIndicator] = useState<{ left: number; width: number; ready: boolean }>({
    left: 0,
    width: 0,
    ready: false
  });

  const favList = tracks.slice(0, 15);

  useEffect(() => {
    const measure = () => {
      const list = listRef.current;
      const el = tabRefs.current[TABS.indexOf(tab)];
      if (!list || !el) return;
      const lr = list.getBoundingClientRect();
      const er = el.getBoundingClientRect();
      setIndicator({ left: er.left - lr.left - list.clientLeft, width: er.width, ready: true });
    };
    measure();
    const id = setTimeout(measure, 80);
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(id);
      window.removeEventListener("resize", measure);
    };
  }, [tab]);

  useEffect(() => {
    (async () => {
      const [a, t, ar, s] = await Promise.all([
        fetch("/api/top?type=albums&limit=20").then((r) => r.json()),
        fetch("/api/top?type=tracks&limit=20").then((r) => r.json()),
        fetch("/api/top?type=artists&limit=10").then((r) => r.json()),
        fetch("/api/stats").then((r) => r.json()).catch(() => null)
      ]);
      setAlbums(a.items || []);
      setTracks(t.items || []);
      setArtists(ar.items || []);
      setStats(s);
    })();
  }, []);

  const selected = selIdx != null ? favList[selIdx] : null;
  const selectedKey = selected ? trackKey(selected) : "";
  const previewForSelection = !!selected && preview.track?.key === selectedKey;
  const isPlaying = previewForSelection && preview.playing;

  function playIndex(i: number) {
    const it = favList[i];
    if (!it) return;
    setSelIdx(i);
    void preview.play(
      { name: it.name, artist: it.artist, image: it.image },
      { onEnded: () => step(1) },
    );
  }

  function togglePlay() {
    if (!selected) {
      if (favList.length) playIndex(0);
      return;
    }
    if (previewForSelection) preview.toggle();
    else playIndex(selIdx ?? 0);
  }

  function step(delta: number) {
    const len = favList.length;
    if (!len) return;
    const base = selIdx == null ? 0 : selIdx;
    playIndex((base + delta + len) % len);
  }

  const progress = {
    positionMs: previewForSelection ? preview.positionMs : 0,
    durationMs: preview.durationMs || 30_000,
    aligned: previewForSelection && preview.aligned,
    loading: previewForSelection && preview.status === "loading",
    error: previewForSelection ? preview.error : null
  };

  return (
    <div data-slot="tabs" data-reveal="" className="flex flex-col gap-2 w-full">
      <div
        ref={listRef}
        role="tablist"
        data-slot="tabs-list"
        className="relative inline-flex h-10 w-full items-center justify-start rounded-lg border p-1 backdrop-blur-md transition-[background,border-color] duration-700 ease-out"
        style={{
          backgroundColor: tint(primary, 10, 0.22, 0.5),
          borderColor: tint(primary, 50, 0.4, 0.18)
        }}
      >
        <div
          aria-hidden="true"
          className="absolute top-1 bottom-1 left-0 z-0 rounded-md"
          style={{
            transform: `translateX(${indicator.left}px)`,
            width: indicator.width,
            opacity: indicator.ready ? 1 : 0,
            background: indicatorBg,
            boxShadow: `inset 0 0 0 1px ${indicatorBorder}, inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 14px -5px rgba(0,0,0,0.7)`,
            transition:
              "transform 420ms cubic-bezier(0.22, 1, 0.36, 1), width 420ms cubic-bezier(0.22, 1, 0.36, 1), background 700ms, box-shadow 700ms, opacity 220ms"
          }}
        />
        {TABS.map((v, i) => {
          const active = tab === v;
          return (
            <button
              key={v}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              role="tab"
              data-state={active ? "active" : "inactive"}
              onClick={() => selectTab(v)}
              className={
                "relative z-10 flex h-[calc(100%-1px)] flex-1 items-center justify-center whitespace-nowrap rounded-md px-3.5 py-1.5 text-sm font-semibold transition-colors duration-300 " +
                (active ? "text-white" : "text-white/55 hover:text-white/85")
              }
            >
              {LABELS[v]}
            </button>
          );
        })}
      </div>

      <div data-slot="tabs-contents" className="mt-8">
        {tab === "albums" && <Albums items={albums} />}
        {tab === "tracks" && <Tracks items={tracks} />}
        {tab === "favourite" && (
          <Favourite
            items={favList}
            selIdx={selIdx}
            isPlaying={isPlaying}
            onSelect={playIndex}
            onToggle={togglePlay}
            onPrev={() => step(-1)}
            onNext={() => step(1)}
            progress={progress}
          />
        )}
        {tab === "stats" && <Stats albums={albums} tracks={tracks} artists={artists} stats={stats} />}
      </div>
    </div>
  );
}

function Albums({ items }: { items: Item[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 w-full">
      {items.map((a, i) => (
        <div
          key={i}
          className="group relative aspect-square rounded-lg overflow-hidden bg-white/[0.02] transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-lg"
        >
          <a href={a.url} target="_blank" rel="noopener noreferrer" className="relative block w-full h-full">
            <Thumb
              item={a}
              className="w-full h-full object-cover opacity-100"
              style={{ transitionDuration: "560ms" }}
            />
            <div className="pointer-events-none absolute inset-0 z-[2]">
              <div className="absolute inset-0 ring-1 ring-inset ring-white/16 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.2)]" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_26%,rgba(0,0,0,0.68)_100%)] mix-blend-multiply" />
              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.34),rgba(0,0,0,0.06)_36%,rgba(0,0,0,0.5))]" />
              <div className="absolute inset-0 shadow-[inset_0_-38px_46px_-22px_rgba(0,0,0,0.66),inset_0_20px_28px_-20px_rgba(0,0,0,0.42)]" />
            </div>
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500 pointer-events-none">
              <div className="text-center px-4">
                <h3 className="font-semibold text-white text-sm leading-tight mb-1 drop-shadow-lg">{a.name}</h3>
                <p className="text-white/80 text-xs mb-2 drop-shadow-lg">{a.artist}</p>
                <div className="flex flex-col items-center gap-1 text-xs text-white/70 drop-shadow-lg">
                  <span>{a.plays} plays</span>
                </div>
              </div>
            </div>
          </a>
        </div>
      ))}
    </div>
  );
}

function Thumb({
  item,
  className = "w-full h-full object-cover",
  style
}: {
  item: Item;
  className?: string;
  style?: React.CSSProperties;
}) {
  if (item.image) {
    return <img src={item.image} alt={item.name} className={className} style={style} />;
  }
  return (
    <span
      aria-hidden="true"
      className={"grid place-items-center bg-white/[0.06] text-white/45 " + className}
      style={style}
    >
      <span className="text-sm font-semibold uppercase">{item.name.slice(0, 1)}</span>
    </span>
  );
}

function TrackRowInner({ item, idx, active = false }: { item: Item; idx: number; active?: boolean }) {
  return (
    <div
      className={
        "flex items-center relative overflow-hidden transition-all duration-300 backdrop-blur-sm border rounded-lg shadow-lg h-12 " +
        (active
          ? "border-white/25 bg-white/[0.07]"
          : "border-white/[0.08] bg-white/[0.02] group-hover:border-white/[0.15] group-hover:bg-white/[0.05]")
      }
    >
      {item.image && (
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            backgroundImage: `url(${item.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(10px) saturate(0.9)",
            opacity: active ? 0.42 : 0.2
          }}
        />
      )}
      <div className="absolute inset-0 bg-black/35" />
      <div className="flex items-center gap-2 sm:gap-2.5 p-2 sm:p-2.5 w-full relative z-10">
        <span className="text-white/60 text-xs w-6 flex-shrink-0 z-10 text-center">
          {String(idx + 1).padStart(2, "0")}
        </span>
        <div
          className="flex-shrink-0 overflow-hidden bg-white/[0.06] z-10"
          style={{ width: 38, height: 38, borderRadius: 8, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.14)" }}
        >
          <Thumb item={item} />
        </div>
        <div className="flex-1 min-w-0 z-10">
          <div className="truncate font-medium text-white text-sm leading-tight">{item.name}</div>
          <div className="truncate text-white/65 text-xs">{item.artist}</div>
        </div>
        <span className="text-white/55 text-xs flex-shrink-0 z-10 hidden sm:inline">{item.plays}</span>
      </div>
    </div>
  );
}

type IconDef = { d: string; vb: string };

const ICON: Record<"play" | "pause" | "back" | "fwd", IconDef> = {
  play: {
    d: "M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80L0 432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.3-23-41L73 39z",
    vb: "0 0 384 512"
  },
  pause: {
    d: "M48 64C21.5 64 0 85.5 0 112L0 400c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-288c0-26.5-21.5-48-48-48L48 64zm192 0c-26.5 0-48 21.5-48 48l0 288c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-288c0-26.5-21.5-48-48-48l-32 0z",
    vb: "0 0 320 512"
  },
  back: {
    d: "M459.5 440.6c9.5 7.9 22.8 9.7 34.1 4.4s18.4-16.6 18.4-29l0-320c0-12.4-7.2-23.7-18.4-29s-24.5-3.6-34.1 4.4L288 209.3 288 96c0-12.4-7.2-23.7-18.4-29s-24.5-3.6-34.1 4.4l-192 160C36.2 237.5 32 246.5 32 256s4.2 18.5 11.5 24.6l192 160c9.5 7.9 22.8 9.7 34.1 4.4s18.4-16.6 18.4-29l0-113.3L459.5 440.6z",
    vb: "0 0 512 512"
  },
  fwd: {
    d: "M52.5 440.6c-9.5 7.9-22.8 9.7-34.1 4.4S0 428.4 0 416L0 96C0 83.6 7.2 72.3 18.4 67s24.5-3.6 34.1 4.4L224 209.3 224 96c0-12.4 7.2-23.7 18.4-29s24.5-3.6 34.1 4.4l192 160c7.3 6.1 11.5 15.1 11.5 24.6s-4.2 18.5-11.5 24.6l-192 160c-9.5 7.9-22.8 9.7-34.1 4.4S224 428.4 224 416l0-113.3L52.5 440.6z",
    vb: "0 0 512 512"
  }
};

function Ctrl({
  onClick,
  aria,
  icon,
  primary = false
}: {
  onClick: () => void;
  aria: string;
  icon: IconDef;
  primary?: boolean;
}) {
  const s = primary ? 36 : 30;
  const g = primary ? 14 : 12;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={aria}
      className="inline-flex shrink-0 items-center justify-center rounded-lg text-white/85 transition-all duration-150 hover:text-white hover:translate-y-[0.5px] active:translate-y-[1px]"
      style={{
        width: s,
        height: s,
        background: primary ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.07)",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.14)"
      }}
    >
      <svg
        viewBox={icon.vb}
        fill="currentColor"
        preserveAspectRatio="xMidYMid meet"
        style={{ width: g, height: g, display: "block" }}
        aria-hidden="true"
      >
        <path d={icon.d} />
      </svg>
    </button>
  );
}

function Tracks({ items }: { items: Item[] }) {
  return (
    <div className="grid grid-cols-1 gap-1 w-full">
      {items.map((t, i) => (
        <a key={i} href={t.url} target="_blank" rel="noopener noreferrer" className="group block">
          <TrackRowInner item={t} idx={i} />
        </a>
      ))}
    </div>
  );
}

function Favourite({
  items,
  selIdx,
  isPlaying,
  onSelect,
  onToggle,
  onPrev,
  onNext,
  progress
}: {
  items: Item[];
  selIdx: number | null;
  isPlaying: boolean;
  onSelect: (i: number) => void;
  onToggle: () => void;
  onPrev: () => void;
  onNext: () => void;
  progress: {
    positionMs: number;
    durationMs: number;
    aligned: boolean;
    loading: boolean;
    error: string | null;
  };
}) {
  const sel = selIdx != null ? items[selIdx] : null;
  const fraction = Math.min(
    1,
    Math.max(0, progress.positionMs / Math.max(1, progress.durationMs))
  );
  return (
    <div className="w-full space-y-4">
      {sel ? (
        <div className="relative w-full select-none overflow-hidden rounded-xl border border-white/[0.08] shadow-[0_10px_30px_-12px_rgba(0,0,0,0.7)]">
          {sel.image && (
            <div
              className="absolute inset-0 transition-opacity duration-700"
              style={{
                backgroundImage: `url(${sel.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "blur(30px) saturate(1.15)",
                transform: "scale(1.25)",
                opacity: 0.55
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/35 to-black/60" />
          <div className="relative z-10 flex items-center gap-3 px-3 py-3">
            <div
              className="grid shrink-0 place-items-center overflow-hidden bg-white/[0.06]"
              style={{ width: 54, height: 54, borderRadius: 12, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.18)" }}
            >
              <Thumb item={sel} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-white">{sel.name}</div>
              <div className="truncate text-xs text-white/65">{sel.artist}</div>
            </div>
            <div className="flex items-center gap-1.5">
              <Ctrl onClick={onPrev} aria="Previous track" icon={ICON.back} />
              <Ctrl onClick={onToggle} aria={isPlaying ? "Pause" : "Play"} icon={isPlaying ? ICON.pause : ICON.play} primary />
              <Ctrl onClick={onNext} aria="Next track" icon={ICON.fwd} />
            </div>
          </div>
          <div className="relative z-10 px-3 pb-2.5">
            <div className="mu-progress">
              <div className="mu-bar" role="presentation">
                <span
                  className="mu-fill"
                  style={{ transform: `scaleX(${fraction.toFixed(4)})` }}
                />
              </div>
              <div className="mu-meta">
                <span>
                  {clock(progress.positionMs)} / {clock(progress.durationMs)}
                </span>
                <span className="mu-note">
                  {progress.loading ? (
                    "loading preview…"
                  ) : progress.error ? (
                    <span className="mu-err">{progress.error}</span>
                  ) : progress.aligned ? (
                    <>
                      <span className="mu-dot" aria-hidden="true" />
                      matched to live playback
                    </>
                  ) : (
                    "30s preview"
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex w-full select-none items-center rounded-lg border border-white/[0.08] bg-cardColor/20 px-3.5 backdrop-blur-md shadow-[0_6px_18px_-10px_rgba(0,0,0,0.6)]" style={{ height: 40 }}>
          <span className="text-xs text-white/45">Select a track</span>
        </div>
      )}
      <div className="grid grid-cols-1 gap-1 w-full">
        {items.map((t, i) => (
          <button key={i} onClick={() => onSelect(i)} className="group block w-full text-left">
            <TrackRowInner item={t} idx={i} active={i === selIdx} />
          </button>
        ))}
      </div>
    </div>
  );
}

function Stats({
  albums,
  tracks,
  artists,
  stats
}: {
  albums: Item[];
  tracks: Item[];
  artists: Item[];
  stats: any;
}) {
  const top = artists[0];
  const total = albums.reduce((s, a) => s + (a.plays || 0), 0) || stats?.playcount || 0;
  return (
    <div className="w-full space-y-3 sm:space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="rounded-lg bg-white/[0.02] border border-white/[0.08] backdrop-blur-sm p-3 sm:p-4 transition-all duration-200">
          <div className="text-white/70 text-xs sm:text-sm font-medium">Albums</div>
          <div className="text-xl sm:text-2xl font-semibold text-white mt-1 sm:mt-2">{albums.length}</div>
        </div>
        <div className="rounded-lg bg-white/[0.02] border border-white/[0.08] backdrop-blur-sm p-3 sm:p-4 transition-all duration-200">
          <div className="text-white/70 text-xs sm:text-sm font-medium">Tracks</div>
          <div className="text-xl sm:text-2xl font-semibold text-white mt-1 sm:mt-2">{tracks.length}</div>
        </div>
      </div>
      <div className="relative rounded-lg bg-white/[0.02] border border-white/[0.08] backdrop-blur-sm p-3 sm:p-4 overflow-hidden transition-all duration-300">
        {top?.image && (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${top.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(12px) saturate(0.7)",
              opacity: 0.25
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/20 to-transparent" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 sm:gap-4">
          <div className="flex-1 min-w-0">
            <div className="text-lg sm:text-2xl font-semibold text-white truncate">{top?.name || "\u2014"}</div>
            <div className="text-white/60 text-xs mt-1">{top?.plays || 0} plays</div>
          </div>
          <div className="text-left sm:text-right flex-shrink-0">
            <div className="text-white/70 text-xs">Total Plays</div>
            <div className="text-xl sm:text-2xl font-semibold text-white">{total}</div>
          </div>
        </div>
      </div>
      <div className="rounded-lg bg-white/[0.02] border border-white/[0.08] backdrop-blur-sm p-3 sm:p-4">
        <div className="text-white/70 text-xs sm:text-sm font-medium mb-3 sm:mb-4">Top Artists</div>
        <div className="space-y-2">
          {artists.map((a, i) => (
            <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" className="group block">
              <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-lg shadow-lg relative overflow-hidden h-10 sm:h-12 transition-all duration-200">
                {a.image && (
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url(${a.image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      filter: "blur(8px) saturate(0.8)",
                      opacity: 0.3
                    }}
                  />
                )}
                <div className="absolute inset-0 bg-black/20" />
                <div className="flex items-center gap-1.5 sm:gap-2 p-2 sm:p-3 w-full h-10 sm:h-12 relative z-10">
                  <div className="text-white/60 text-xs w-4 flex-shrink-0 hidden sm:block">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 rounded-lg overflow-hidden bg-white/[0.05] border border-white/[0.08]">
                    <Thumb item={a} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-xs sm:text-sm font-medium truncate">{a.name}</div>
                  </div>
                  <div className="text-white/60 text-xs flex-shrink-0">{a.plays}</div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
