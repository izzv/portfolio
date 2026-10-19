# ryan

Personal site — Next.js 14 (App Router), React 18, Tailwind. One scrolling page:
home, projects, music, commissions, skills, guestbook, biolinks and contact are
stacked as full-height sections on `/` and reached by scrolling, with live
Discord presence (Lanyard) and Last.fm listening data. Everything public is
edited from the private admin at `/admin`.

```bash
bun install        # or npm install
bun dev            # http://localhost:3000
bunx tsc --noEmit  # typecheck
bun run build      # production build
```

Everything personal lives in **`site.json`** through the editor at **`/admin`**.
Defaults (the seed before the first save) are in `lib/siteConfig.ts`, and every
page follows whatever the config says.

---

## Sections

| Section (on `/`) | Old route | Renders | Data |
| --- | --- | --- | --- |
| `#home` | `/` | name, Discord handle/avatar, short bio, listening line, social pills | `site.name`, `site.socials`, Lanyard, `/api/nowplaying` |
| `#projects` | `/projects` | featured project card(s) with screenshots, then any extra projects | `projects.json` via `lib/projectsStore.ts` |
| `#music` | `/music` | albums, tracks, favourite (with preview playback + progress), stats | Last.fm via `/api/top`, `/api/stats`, `/api/play` |
| `#commissions` | `/commissions` | status, crypto-only payment block with accepted coins, scope and process | `site.commission` |
| `#skills` | `/skills` | grouped skill pills with brand icons | `site.skills` |
| `#guestbook` | `/guestbook` | open form plus approved notes | `guestbook.json` via `/api/guestbook` |
| `#biolinks` | `/biolinks` | two external profile links (`wsp.baby/yo`, `injuri.ng/no`) | `site.biolinks` |
| `#contact` | `/contact` | Discord hero card + one card per contact | `site.socials`, `site.contacts` |
| `/admin` | — | password-gated site editor: profile, socials, links, skills, nav, commissions, guestbook, projects, dashboard | `site.json` / `guestbook.json` / `projects.json` |

Every section route still exists and answers with a `307` to `/#section`, so old
links and bookmarks keep working. `/` is the only public URL in `sitemap.xml`.
The root layout supplies the `name — role` `<title>` plus the social/SEO metadata
described below, and `app/not-found.tsx` renders a real 404 status.

## Where identity lives

`site.json` is the single source of truth (edited at `/admin`, seeded from
`lib/siteConfig.ts`): `name`, `age`, `greeting`, `tagline`, `role`, `timezone`,
`socials` (IDs **and** display handles), `contacts`, `biolinks`, `skills`,
`commission`, `nav`. Projects live in their own file — see below.

Two deliberate choices:

- **Handles are stored separately from URLs** (`github` + `githubHandle`). Cards
  need a copyable `@handle`; links need a URL. Deriving one from the other would
  mean parsing URLs in JSX.
- **Socials are typed positions, not a list.** `socials.discord` / `socials.github`
  are consumed directly by `Header`, `Pills`, `ExperienceProvider` and the home
  bio. Lists are reserved for `contacts` and `biolinks`, which are rendered
  generically.

The name is `ryan` (it was `ryan.ong`). Nothing else hardcodes it — the home
`<h1>`, `<title>`s, metadata description and page headers all read `site.name`.

## Projects

Projects are data, not source: `projects.json` at the repo root is the source of
truth and the projects section reads it on every request (`export const dynamic =
"force-dynamic"`), so an admin save shows up without a rebuild.

One project is listed right now:

- **grief** — the public site for the Discord bot, live at
  **https://grief.pics**. The screenshot is a real capture saved to
  `public/media/projects/grief-website.png`.

### Managing projects — `/admin` → projects

Password-gated with `ADMIN_PASSWORD`; a successful login sets an
`HttpOnly`, `SameSite=Strict`, HMAC-signed cookie (7 days). The signing key is
`SHA-256(ADMIN_SECRET | ADMIN_PASSWORD)`, so rotating the password invalidates
every session issued under the old one. The page is `noindex`, disallowed in
`robots.txt`, and not linked from the public nav.

Defence in depth — none of these layers replaces another:

| Layer | What it does |
| --- | --- |
| `middleware.ts` | rejects `/api/admin/*` without a session cookie before the route runs, and stamps every admin response with `no-store`, `X-Frame-Options: DENY`, `frame-ancestors 'none'`, `nosniff`, `no-referrer`, `X-Robots-Tag: noindex` |
| page (`app/admin/projects/page.tsx`) | re-verifies the HMAC server-side and renders only the login form when it fails — project data is never in the HTML for an unauthenticated visitor |
| route handlers | `isAuthed()` HMAC verification, same origin required for writes, body capped at 128 KB |
| cookie | `HttpOnly` (no JS access), `SameSite=Strict` (no cross-site sends), `Secure` on https, 7-day expiry |
| login | constant-time password compare, 8 attempts per IP per 5 minutes, generic error |

- add a project, edit any field, reorder with ↑/↓, mark **featured** (large card
  with screenshot), delete (with confirm)

`/admin/projects` still exists as a redirect to `/admin?tab=projects`.
- **save changes** writes `projects.json` atomically and revalidates `/projects`
- failures surface inline; unsaved work warns before leaving the page

Fields: `name`, `year`, `description`, `url`, `cta`, `icon`, `shot`, `featured`.
Validation lives in `lib/projects.ts` (`normalizeProjects`) — strings are trimmed
and capped, links are restricted to `http(s)` or root-relative paths (a bare
`grief.pics` becomes `https://grief.pics/`), ids are slugged and de-duplicated,
and empty rows are dropped. `lib/projectsStore.ts` writes to a temp file then
renames it, so a crash can't leave a half-written `projects.json`.

```bash
curl -s -c /tmp/cj -X POST localhost:3000/api/admin/login \
  -H 'Content-Type: application/json' -d '{"password":"<ADMIN_PASSWORD>"}'
curl -s -b /tmp/cj localhost:3000/api/admin/projects
```

Unauthenticated `GET`/`PUT /api/admin/projects` returns `401`; a forged or
expired cookie gets `401`, and an API write carrying another origin gets `403`.
Login is rate limited to 8 attempts per IP per 5 minutes.

### Images that refuse to hotlink

`grief.pics` serves its icon with `Cross-Origin-Resource-Policy: same-origin`, so
a browser blocks it as an `<img>` on another origin even though `curl` returns
`200 image/png` (that was the "broken grief icon"). `lib/projects.ts` lists such
hosts in `IMAGE_PROXY_HOSTS` and `proxiedImage()` rewrites them to
`/api/img?url=…`, so the browser loads them same-origin through the existing
proxy. `/api/img` imports the same list — one allowlist, no drift.

The page also tolerates incomplete entries: a missing screenshot renders a
letter tile, a missing icon a letter badge, a project without a URL is rendered
as a plain card (never `href=""`), and the "more projects" section is omitted
when nothing non-featured exists.

## Site editor — `/admin`

The whole site is data, not source. `/admin` is a password-gated control room
with ten tabs: **overview** (views, visitors, counts, quick actions),
**profile** (name, age, greeting, role, tagline, timezone, live hero preview),
**appearance** (layout, card, typography, text effects, accent, motion — see
below), **socials** (discord id + handle, github, last.fm, telegram, roblox),
**links** (biolinks and contact cards, add/remove/reorder),
**skills** (groups and pills), **nav** (label, href, icon preset, group,
visibility, order), **commissions** (toggle, price, accepted coins, sponsor,
preview),
**guestbook** (approve / delete notes) and **projects** (the existing editor,
embedded).

Saving is one draft: edits stay local until **save** (or ⌘S / ctrl+S), which
`PUT`s the whole config. **discard** drops the draft, **reset** returns to the
shipped defaults, and overview can **export/import** `site.json` for backup or
seeding another instance. Unsaved work warns before leaving. `Cmd+S`,
`?tab=…` deep links and a floating status bar keep the loop fast.

Content lives in `site.json` at the repo root (gitignored) through
`lib/siteStore.ts`, which mirrors the projects store: Vercel Blob when
`BLOB_READ_WRITE_TOKEN` is set, the repo file on a normal VPS, the OS temp dir
with a warning on a read-only host. `lib/siteConfig.ts` owns the types,
defaults and `normalizeSite()` — every string is trimmed and capped, URLs are
restricted to `http(s)` or root-relative, icon keys must be a known nav preset,
the timezone is validated with `Intl`, and empty rows are dropped. The root
layout loads the config on each request and hands it to the client through
`SiteProvider`, so edits are server-rendered on the next page load (the API
calls `revalidatePath("/", "layout")` after a save).

`app/admin-utilities.css` is a generated utility snapshot used only by the
admin markup (the site's main utility sheet predates it); regenerate it if you
add new utility classes to `components/admin/*`. Because it loads after the
site sheet, its `.left-1\/2` used to win over the nav's placement rule and park
the bar in the middle of the page — `.site-nav` in `app/nav.css` owns that
placement now so the two sheets cannot fight over it.

```bash
curl -s -c /tmp/cj -X POST localhost:3000/api/admin/login \
  -H 'Content-Type: application/json' -d '{"password":"<ADMIN_PASSWORD>"}'
curl -s -b /tmp/cj localhost:3000/api/admin/site
```

`GET`/`PUT /api/admin/site` returns `401` without a session, `403` for a write
from another origin, `413` above 256 KB.

## Appearance — `/admin` → appearance

The look is data too. Every control writes an `appearance` object into the same
`site.json`, and `lib/appearance.ts` turns it into CSS custom properties on the
home shell (plus `data-*` attributes), so the whole look is one inline style and
one CSS file rather than a prop threaded through every component.

- **layout** — `classic` (portrait, then the name), `modern` (a wide card with a
  banner and the picture beside the name) or `portfolio` (name + card, then the
  sections), a card style (`card` / `none` / `two columns`), and, under *more
  options*, the horizontal position, content width, per-section spacing, hero
  height and portrait size (0 hides it).
- **card look** — see-through (`100%` = glass you can read through), backdrop
  blur, corner roundness, inner padding, the hairline border and the drop
  shadow.
- **text** — name size, letter spacing, uppercase, plus the **arrival effect**:
  `typewriter` types the greeting and then the name behind a caret,
  `decode` settles scrambled glyphs into the real text (`components/TypeText.tsx`).
  Typing speed is characters per second; both effects honour
  `prefers-reduced-motion` and keep the full string in the accessibility tree.
- **accent** — a hex colour that overrides the palette picked from the current
  track (empty = follow the music), and how strongly it tints the gradients.
- **motion & backdrop** — build-on-scroll on/off, speed, **build style**
  (`rise`, `fade`, `assemble`, `lego`), stagger, a LEGO brick loading screen,
  the animated blossom scene, its intensity and a dim veil for readability.
- **LEGO details** — `brick studs` adds a row of studs to the top edge of the
  hero card, and `brick loading screen` plays `components/LegoLoader.tsx`: three
  rows of bricks drop in and snap together, then the veil lifts. It is pure
  decoration (`aria-hidden`, no pointer events), runs once per tab session via
  `sessionStorage`, is gated on `html[data-lego="on"]` before first paint, and
  never appears with `prefers-reduced-motion`. The inline failsafe removes the
  gate after 2.6 s, so a failed bundle cannot leave a visitor behind an overlay.
  `app/lego.css` holds both the loader and the `[data-build="lego"]` entrance,
  which drops each block in from above with a springy snap.

Above the raw controls, **quick looks** applies a whole preset in one click —
`minimal`, `glass`, `editorial`, `lego` or `neon` — and the badge reads `custom`
as soon as the draft stops matching (`lib/appearancePresets.ts`, matched field by
field). Every preset only sets the fields it names, so a saved accent or
backdrop survives the click, and **reset look** returns the appearance section
to the shipped defaults without touching the rest of the site.

The **live preview** under the presets is the real hero: the same
`appearanceVars()`, the same `data-*` attributes and the same `.hero-*` rules as
`app/page.tsx`, boxed by `.pv` in `app/admin.css`. A slider updates it in the
same frame, and a typing effect shows its caret there too.

The defaults in `lib/siteConfig.ts` are exactly the look the site shipped with,
so an old `site.json` upgrades cleanly: `normalizeSite()` clamps every number and
falls back for every enum. The hero markup lives in
`components/sections/HeroSection.tsx`, the CSS variables in `lib/appearance.ts`
and their rules in `app/appearance.css`; nav width, section width and the
commission page follow `--shell-width` from the same file.

## One scrolling page

`app/page.tsx` composes the whole public site: `components/sections/*` renders
the eight blocks, each at least `100dvh` tall with its own top padding, so the
fixed top bar never sits on the content and an anchor jump lands with the
section's top edge at the viewport top.

- **`components/Nav.tsx`** draws the bar itself (centered, icons only, group
  hairlines) and, on `/`, tracks which section is crossing the upper third of
  the viewport with a passive scroll listener so the active pill follows the
  reader without any clicks.
- **`components/HashScroll.tsx`** re-aligns a deep link (`/#contact`) after the
  music tabs and images settle in and change the page height, and stops the
  moment the reader scrolls, taps or types.
- **Section routes redirect**: `app/projects/page.tsx` and friends are seven-line
  `redirect("/#section")` pages, so nothing else had to change to keep the URLs
  alive.

Music tab clicks used to `router.replace('/music?tab=…')`; they now update the
query string with `history.replaceState`, which keeps the reader exactly where
they are instead of bouncing through a route.

## Build-on-scroll

The page assembles itself as you scroll instead of playing every entrance
transition off-screen at load:

- Any block marked `data-reveal` starts unbuilt (`opacity: 0`, pushed down,
  blurred) and is finished by `components/BuildOnScroll.tsx` when it enters the
  viewport. Only `opacity`, `transform` and `filter` animate, so nothing reflows
  and section heights/offsets are unchanged.
- Blocks stagger: the component assigns `--reveal-i` per element in DOM order
  within each parent, and `app/build.css` turns that into `--reveal-stagger`
  (65 ms by default, editable in appearance), so a row of pills or cards builds
  left to right.
- Four build styles share that machinery, chosen in `/admin` → appearance:
  `rise` (the default: up, unblur, fade), `fade` (opacity only), `assemble`
  (a clip-path cut closes as the block is built) and `lego` (a brick dropped
  from above with a springy overshoot), keyed off `html[data-build]`.
  The hero's greeting and name can type themselves in at the same time
  (`components/TypeText.tsx`), which is what makes the page look like it is
  being written while you watch.
- **The hidden half only exists behind a JS gate.** The layout sets
  `html[data-reveal="on"]` before first paint, and only when the reader has not
  asked for reduced motion; the CSS keys every hiding rule off that attribute.
  Without JS, with `prefers-reduced-motion: reduce`, or if the reveal script ever
  fails (a 5 s failsafe drops the attribute), the page is simply all there. A
  `visibility: hidden` on the hidden state also keeps unbuilt controls out of the
  tab order.
- The bar carries a 2 px progress hairline along its bottom edge, driven by the
  same `requestAnimationFrame` scroll listener that tracks the active section
  (`--nav-progress`, no React re-render per frame).

The older `.anim-item` load animation is still used by `/admin`, `/not-found`
and the admin panels; the public sections no longer use it.

## Guestbook

The guestbook is the `#guestbook` section (`/guestbook` redirects to it): name,
message and an optional link, no account.
Notes land with `approved: false` and are invisible until they are approved in
`/admin` → guestbook, which is the only moderation step. `PUT
/api/admin/guestbook` replaces the list; deleting a note is a `PUT` without it.

`lib/guestbook.ts` caps name/message (`32`/`500`), strips everything else and
drops empty rows; `lib/guestbookStore.ts` is the same blob/file/temp store as
site and projects. `POST /api/guestbook` is origin-checked, body-capped at 8 KB,
rate-limited to 3 notes per 10 minutes per IP (12/day), and silently accepts
and drops submissions that fill the hidden `website` honeypot. Entries render
as plain React text (escaped) and optional links are `nofollow`.

## Commissions — crypto only

The `#commissions` section (`/commissions` redirects to it) is the offer:
current availability, the starting price from
`site.commission.price`, a payment block that says **crypto only** in as many
ways as is tasteful, the accepted coins (`site.commission.coins`, comma
separated, default `BTC, ETH, USDT, SOL, LTC`), what gets built, a three-step
process and a Discord CTA. The toggle in `/admin` → commissions controls the
"open right now" / "closed right now" line, the bar above the projects section
and the pill on home; the section itself is always there.

The same crypto-only line is in the commission modal (`components/
CommissionModal.tsx`), which links here for the full terms.

## Preview audio in sync

Music tabs used to play a clip from 0:00 and pretend. Now every page shares one
`<audio>` element (`components/PreviewProvider.tsx`):

- `GET /api/play` resolves the best-matching 30s store preview (Deezer first,
then Spotify, then iTunes — with a title/artist score so a cover cannot win)
and reports `offsetMs`, where the clip starts inside the song.
- Pressing play on the header, or a track in the music section, seeks the clip to the
live playback position (when the track is the one playing and that position is
inside the clip), so the audio you hear is the part the lyrics are on. The
header's word-by-word clock uses the audio position while a clip plays, not the
estimated Last.fm clock; the live track changing stops the clip.
- The player survives client-side navigation, so a clip started from the music
section keeps playing while you scroll on and the lyrics stay with it. The music
section shows a real progress bar, elapsed/duration and whether the clip is
matched to live playback.

## Command palette

`⌘K` / `ctrl+K` (or `/` outside a field, or the `⌘K` pill on home) opens a
palette over sections, projects, socials and three actions (copy Discord handle,
open `/admin`, scroll to top). Section entries scroll on `/` and navigate from
anywhere else. `↑`/`↓` move, `↵` opens, `esc` closes.
Arrow/enter work without touching the mouse, and the list is fuzzy-filtered.

## How it was built

### 1. Audit for template leftovers

Rather than grepping for one name, search for the *shape* of the data — social
domains, handle fields, empty interpolations, the old project name:

```bash
grep -rniE '(hero|cosmin|discord|github|lastfm|roblox|telegram)\.(com|fm|gg)' \
  app components lib package.json
```

That found the remaining non-branding leftovers: a sponsor image hotlinked from
`cosmin.gg` in `Pills.tsx` (removed — the commission pill now only renders from
`site.commission`), `hero-*` localStorage/canvas keys in `Views.tsx` (renamed),
and the package name.

### 2. Propagate the rename

| File | Change |
| --- | --- |
| `lib/siteConfig.ts` | `name: "ryan"` (the shipped default) |
| `package.json`, `package-lock.json`, `bun.lock` | `name: ryan-site` |
| `app/api/img/route.ts`, `lib/lastfm.ts` | `User-Agent: ryan-site/3.0` |

`app/layout.tsx`, every page's `metadata`, `components/Header.tsx` and the
`README` all derive from `site.name`, so they needed no edits.

### 3. Fix what the audit found on real pages

| Bug | Fix |
| --- | --- |
| Contact page's Discord "open" button linked to the raw user ID (`href="1466…"`), not a URL | `https://discord.com/users/${site.socials.discord}` |
| Contact grid used `site.contacts.slice(1)`, assuming Discord was first | filter `platform !== "Discord"` |
| Image proxy allowlist had `lastfm.freetls.fastly.net` but not the host Last.fm actually serves (`lastfm-img.freetls.fastly.net`), so album art 403'd and the dynamic palette never left its fallback | host added |
| `VIEWS_SECRET` was empty, so every `POST /api/views` threw and the counter stayed at `0` | generated a 32-byte secret in `.env.local` |
| View fingerprint keys still said `hero-` | renamed to `ryan-device-id` / `ryan-fp` |
| `cmd.exe` was described as a "Built-in SSH client" | relabelled "windows shell" |

### 4. Verify against rendered HTML and real APIs

A green build doesn't prove the pages say the right thing, so the production
build was served and every route was inspected:

```bash
bunx tsc --noEmit          # clean
bun run build              # every route compiles
bunx next start -p 3015 &
for p in / /music /projects /skills /biolinks /contact; do
  curl -s -o /dev/null -w "$p %{http_code}\n" localhost:3015$p
done
```

Confirmed:

- all seven routes return `200`; titles are `ryan`, `music — ryan`, `projects — ryan`, …
- `/projects` renders `grief`, the grief.pics link, the screenshot and the
  proxied icon (verified in a real browser: `naturalWidth` 500, while the raw
  `https://grief.pics/icon.png` is blocked), with no past-collabs section
- `/contact` links to `https://discord.com/users/1466155972379672871` and shows
  `@tv3q`, `@izzv`, `@fentsniffer`, `@coldgrieff` with correct hrefs
- `/` shows `ryan`, `@tv3q`, the bio and the GitHub/Last.fm links
- `/skills` renders every configured group
- `/api/top` returns the real account's top albums, `/api/stats` reports the real
  playcount, `/api/play` returns an audio preview
- `POST /api/views` returns `{"views":1,"counted":true}` (the test counter file is
  deleted afterwards)
- `/api/img` proxies an allowed Last.fm image and rejects unknown hosts with `403`

### 5. Resolve values that weren't in the codebase

- **Discord handle** — Lanyard exposes the live username, so it was read from the
  API rather than guessed:

  ```bash
  curl -s https://api.lanyard.rest/v1/users/1466155972379672871 | jq '.data.discord_user.username'
  # "tv3q"
  ```

  `Header` still prefers `lanyard.username` at runtime and falls back to
  `site.socials.discordHandle`.
- **Last.fm username** — `LASTFM_USER=izzv` in `.env.local`, because
  `lib/lastfm.ts` reads the user from env, not from the site config.

## Changing something later

- **Name, handles, bio, links, skills, nav, commissions** → `/admin` (or edit
  `site.json` by hand, then reload). defaults live in `lib/siteConfig.ts`.
- **Adding a project** → `/admin?tab=projects` (or edit `projects.json` by hand).
  Omit `icon`/`shot` and the page falls back to letter tiles; mark it
  `featured` for the big card, otherwise it lands under "more projects".
- **Adding a contact card** → add it in `/admin` → links; the grid renders it and
  picks an icon from `BRAND_ICON` by `platform` (unknown platforms get a link
  glyph).
- **Adding a biolink** → add it in `/admin` → links; omit `img` and the pill falls back to a letter tile. `#biolinks` renders as one embed-style card (`components/sections/BiolinksSection.tsx` + the `.embed-*` rules in `app/globals.css`): a hero banner with `site.tagline`, then every biolink plus the socials from `site.socials` as pills, so adding a link needs no markup change. The section currently points at two external profiles (`https://wsp.baby/yo`, `https://injuri.ng/no`).
- **Last.fm account** → `.env.local` (`LASTFM_USER`) plus `socials.lastfm`.
- **Timezone** → profile tab (used by `LocalTime`).
- **Navigation** → nav tab; icons come from the presets in `lib/navIcons.ts`.
  Every item also has a **group** (`core`, `work`, `social`). The bar always
  draws groups in that order with a hairline between them, and keeps the admin
  order inside each group — so the bar reads: home/projects/music, then
  commissions/skills, then guestbook/biolinks/contact. Saved configs from
  before groups existed are classified by their `href`, not their position.
  An item whose `href` names a section on `/` becomes a `/#section` anchor, so
  the same config drives both the bar and the scrolling page.

## Background

`components/BlossomBackground.tsx` renders a full-screen grayscale cherry-blossom
scene (stormy sky top-right, dark limbs, layered white blossom masses) as inline
SVG behind every route. It is drawn rather than shipped as a bitmap, so it stays
sharp at any viewport size and the layered groups can move independently.

- geometry is generated from a seeded PRNG (`mulberry32`) so server and client
  markup match — no hydration mismatch
- `filter: grayscale(1) brightness(0.92) contrast(1.12)` plus a radial scrim keep
  white text readable over the bright blossom areas
- `.bb-tint` reuses the album palette from `ExperienceProvider`, so the old
  album-reactive backdrop still tints the scene via `mix-blend-mode: soft-light`.
  The palette follows playback the same way the cover backdrop does — the
  playing track's cover while a song is on, the avatar (and its fallback) when
  it isn't

To use a photograph instead, drop it in `public/media/` and swap the `<svg>` for
an `<img>` — the petals, sway and parallax layers wrap it unchanged.

### Spotify Canvas backdrop

When the track that is playing has a Spotify Canvas, its looping video replaces
the blossom scene (`components/CanvasBackdrop.tsx`, `lib/canvas.ts`). With
nothing playing — or a track without a Canvas — the scene stays as it is.

- `getCanvasUrl(trackId)` reads the community endpoint (`spotify-canva`), which
  parses Spotify's internal protobuf response, and only accepts `*.scdn.co`
  URLs. Hits are cached for 6h, misses for 10min, in-flight lookups are shared,
  and a 30/min burst cap stops the public `/api/canvas` route from being used to
  enumerate ids.
- The video is muted, looped, `object-fit: cover`, faded in over 900ms with a
  slow 14s zoom, paused while the tab is hidden, and hidden entirely under
  `prefers-reduced-motion`. Playback failures (autoplay blocked, 404) leave the
  normal background in place.
- **A track id is required, so this needs Spotify credentials.**
  `SPOTIFY_CLIENT_ID` + `SPOTIFY_CLIENT_SECRET` are enough (they make
  `searchSpotifyTrack` return ids); `SPOTIFY_REFRESH_TOKEN` additionally gives
  exact playback position. Without either, `now.spotifyId` is null and no canvas
  is ever requested.

## Lyrics

`/api/lyrics` returns `{ lines, synced }`, where `synced` is true only when the
provider gave real LRC timestamps (`spotify-lyrics-ts` or lrclib). The flag is
cached alongside the lines so a second visit doesn't re-fetch.

`components/Header.tsx` turns that into playback-following lyrics:

- the position comes from `progressMs` + `fetchedAt` in `/api/nowplaying`, and is
  re-anchored on every poll (2s visible, 15s backgrounded), so it cannot drift
- a `requestAnimationFrame` loop picks the active line and sets the progress
  hairline's `scaleX`, so transitions land on the exact timestamp
- unsynced (plain) lyrics have no timestamps, so they keep the old 3.2s cycle,
  and the hairline stays hidden

Exact timing needs Spotify owner credentials. Without them `lib/playClock.ts`
returns an estimate anchored on the first poll that saw the track playing, so
the words follow the song approximately (and only from the point the server
noticed it).

## Motion

All page motion lives in `app/globals.css` (this project has no Tailwind
runtime, so utility classes alone would not animate anything):

- `.page-enter` — fade/rise on every route change, re-keyed by `pathname` in
  `components/PageTransition.tsx`
- `.anim-item` — staggered reveal, delay set per item inline
- `.lift` — hover lift shared by project, contact and home cards
- biolinks embed — `.embed-wash` drifting banner light, `.embed-dot` float, the
  name/tagline rise, staggered `.embed-pill` reveals and a hover lift per pill
- `.anim-glow` — slow glow pulse available for status dots
- background scene — `.bb-sway-far` / `.bb-sway-mid` / `.bb-sway-near` canopy
  sway at three speeds, `.bb-art` 54s breathe zoom, `.bb-petal` falling petals
  (26 on desktop, 14 under 640px), `.bb-glow` drifting light, and pointer
  parallax on `.bb-parallax` via `--px`/`--py` (skipped on coarse pointers)
- album backdrop — `components/CoverBackdrop.tsx` blurs the now-playing cover
  into two crossfading full-screen layers under the content (`.cover-*` in
  `app/cover.css`); the image goes through `/api/img` because Last.fm's CDN
  blocks cross-origin reads. It is a playback effect, not a permanent layer: it
  paints only while a track is playing, and the moment playback stops (including
  a pause, or a track the API can't see) the default blossom scene is back. No
  artwork is remembered between visits, so there is nothing to flash on load

Animations use `animation-fill-mode: backwards` so no transform lingers to
become a containing block for `position: fixed` children, and everything is
disabled under `prefers-reduced-motion: reduce` (verified in Chrome: reported
`animationName` is `pageRise` normally and `none` with reduced motion). The
background scene is included: sway/breathe/glow stop and the petals are
`display: none` under reduced motion, verified across all six routes.

## Domains

The site is reachable on several domains, but only one is canonical:

| Host | Behaviour |
| --- | --- |
| `ryan.ong` | canonical — sitemap, Open Graph, JSON-LD, share links |
| `www.ryan.ong` | 308 → `https://ryan.ong` |
| `ryandev.lol` | 308 → `https://ryan.ong` |
| `ryanbuttlord.fun` | 308 → `https://ryan.ong` |
| `ryanbuttlord.lol` | not registered in DNS — no site |

The list lives in `lib/domains.ts` (`CANONICAL_HOST` + `ALIAS_HOSTS`), and
`middleware.ts` redirects any alias host before a page renders, keeping the
path and query string. Of the `www.` entries only `www.ryandev.lol` currently
resolves in DNS; the other two are there so the redirect is already in place if
the records are ever added. Adding a domain is: add it to `ALIAS_HOSTS`, point its
DNS at Vercel, then add it under **Vercel → Settings → Domains**. Nothing else
changes, and the canonical output stays on `ryan.ong`.

## Discovery (SEO)

- `app/layout.tsx` sets `metadataBase` from `lib/siteUrl.ts`, a default title
  (`name — role`), a description built from the tagline, keywords from the
  skills list, Open Graph (`website`, 1200×630 `og.png`) and a
  `summary_large_image` Twitter card.
- `lib/siteUrl.ts` returns `NEXT_PUBLIC_SITE_URL` when set, otherwise
  `https://ryan.ong` from `lib/domains.ts` — everything absolute (sitemap, OG
  URLs, JSON-LD) is built from it, and it deliberately ignores the per-deploy
  Vercel host so previews never leak into indexed metadata.
- `/` sets `alternates.canonical` to `/` — the section routes redirect into it,
  so every public URL points search engines at `ryan.ong` even before a host
  has been added to Vercel.
- `app/sitemap.ts` lists that one URL; `app/robots.ts` points at it and
  disallows `/admin` + `/api/`.
  `/admin` also sends `noindex, nofollow` in its own metadata.
- `app/page.tsx` emits JSON-LD `Person` (name, role, tagline, skills, socials)
  from the site config, so search results can carry the profile.
- `public/og.png` is a **static** 1200×630 card (`name · role`, tagline,
  greeting, section links). It is baked, not generated per request — `next/og`
  crashes on Windows in Next 14.2 (`@vercel/og` resolves its bundled font to a
  broken `file:` URL), so a prerendered PNG keeps the route working everywhere.
  If the name/tagline change, re-render the card.
- `app/icon.svg` is the favicon the metadata previously pointed at (`/favicon.svg`
  did not exist and 404'd).

## Deployment (Vercel)

`vercel.json` pins the framework to `nextjs` and the build/install commands. If
a project was first imported when this repo only contained `README.md`, Vercel
can keep the **Other** preset and serve a platform-level `404 NOT_FOUND` at `/`
even though the build is green. The file overrides that, and the same values can
be set manually under **Settings → Build & Deployment**:

| Setting | Value |
| --- | --- |
| Framework Preset | Next.js |
| Root Directory | `.` (repo root) |
| Build Command | `next build` |
| Output Directory | `.next` (default) |

Environment variables (`LASTFM_*`, `VIEWS_SECRET`, `ADMIN_PASSWORD`,
`ADMIN_SECRET`, …) must be added in the Vercel dashboard too — `.env.local` is
never committed.

**Project saves on Vercel:** the deployment filesystem is read-only, so
`lib/projectsStore.ts` picks its backend at runtime:

| Mode | When | Behaviour |
| --- | --- | --- |
| `blob` | `BLOB_READ_WRITE_TOKEN` is set | Durable: saves go to a Vercel Blob named `projects.json`, and every instance reads it back |
| `file` | no token, writable dir | Writes `projects.json` in the repo root (local dev, VPS) |
| `temporary` | no token, read-only dir | Writes to the OS temp dir, returns a warning — the save works but dies with the instance |

To make production saves permanent: **Vercel → Storage → Create → Blob**, pick
a **public** store, connect it to the project, and redeploy. Vercel injects
`BLOB_READ_WRITE_TOKEN` automatically; set it in `.env.local` too if you want
the same behaviour locally. The admin page shows a yellow banner whenever it is
running in `temporary` mode, and a failed blob write returns the real reason
(e.g. `This store does not exist.`) instead of a generic 500.

## Configuration

`.env.local` expects: `VIEWS_SECRET`, `LASTFM_API_KEY`, `LASTFM_API_SECRET`,
`LASTFM_USER`, `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`,
`SPOTIFY_REFRESH_TOKEN`, `SP_DC_COOKIE`, plus `ADMIN_PASSWORD` and
`ADMIN_SECRET` for `/admin`, and optionally
`BLOB_READ_WRITE_TOKEN` for durable site, guestbook and project saves and
`NEXT_PUBLIC_SITE_URL` for absolute links (sitemap, Open Graph, JSON-LD). Both admin values are required — without
`ADMIN_PASSWORD` the login page explains the missing config instead of accepting
a blank password, and `ADMIN_SECRET` (falls back to `VIEWS_SECRET`) is what
signs the session cookie.

`VIEWS_SECRET` is now set locally. The Spotify keys are still empty, which only
affects the Spotify-backed enrichments (`/api/play` still returns an iTunes
preview, so the favourite tab plays).

## Known gaps

- `site.age` is `0` (hidden by the `> 0` guard) and `site.timezone` is
  `America/New_York`; both were unspecified.
- Discord avatar/presence requires the account to be monitored by Lanyard; the
  static handle is the fallback.
- Lyrics are best-effort: `/api/lyrics` returns `{"lines":[],"synced":false}`
  for tracks the provider doesn't know, in which case the header omits the block.
- Lyric timing is exact only with Spotify owner credentials (`progress_ms`).
  Without them, `lib/playClock.ts` anchors on the first poll that saw the track
  playing and counts from there: a track that started before the server first
  saw it (or before a deploy) reads late, and seeks are invisible.
- Site, guestbook and project data are JSON files, so they need a writable
  filesystem that persists between requests (a normal VPS/container) or a Vercel
  Blob token. On a read-only host without a token the admin falls back to the OS
  temp dir and says so; set `BLOB_READ_WRITE_TOKEN` to make saves durable.
- Preview sync assumes the 30s clip starts at 0:30, which is the label default
  and what the three stores return in practice. The APIs do not publish the
  offset, so a track whose label picked another window will be off by exactly
  that difference. Without Spotify owner credentials the live position used for
  the first seek is the estimate from `lib/playClock.ts`.
- The guestbook item in the nav comes from the config. A `site.json` saved
  before it existed keeps its old nav; add the item in `/admin` → nav (the
  section is still reachable from the home link, the palette and `/#guestbook`).
