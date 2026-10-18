# ryan

Personal site — Next.js 14 (App Router), React 18, Tailwind. Six pages: home,
music, projects, skills, biolinks and contact, with live Discord presence
(Lanyard) and Last.fm listening data. Projects are edited from a private admin
page at `/admin/projects`.

```bash
bun install        # or npm install
bun dev            # http://localhost:3000
bunx tsc --noEmit  # typecheck
bun run build      # production build
```

Everything personal lives in **`lib/site.ts`**. Change the identity there and
every page follows.

---

## Pages

| Route | Renders | Data |
| --- | --- | --- |
| `/` | name, Discord handle/avatar, short bio, listening line, social pills | `site.name`, `site.socials`, Lanyard, `/api/nowplaying` |
| `/music` | albums, tracks, favourite (with preview playback), stats | Last.fm via `/api/top`, `/api/stats`, `/api/play` |
| `/projects` | featured project card(s) with screenshots, then any extra projects | `projects.json` via `lib/projectsStore.ts` |
| `/skills` | grouped skill pills with brand icons | `site.skills` |
| `/biolinks` | two external profile links (`wsp.baby/yo`, `injuri.ng/no`) | `site.biolinks` |
| `/contact` | Discord hero card + one card per contact | `site.socials`, `site.contacts` |
| `/admin/projects` | password-gated project manager (add / edit / reorder / feature / delete) | `projects.json` via `/api/admin/projects` |

Each page still has its own `<title>` (`music — ryan`, `projects — ryan`, …) from
`site.name`; the root layout only supplies the bare name.

## Where identity lives

`lib/site.ts` is the single source of truth: `name`, `age`, `greeting`,
`timezone`, `socials` (IDs **and** display handles), `contacts`, `biolinks`,
`skills`, `commission`, `nav`. Projects moved out of this file — see below.

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
truth and `/projects` reads it on every request (`export const dynamic =
"force-dynamic"`), so an admin save shows up without a rebuild.

One project is listed right now:

- **grief** — the public site for the Discord bot, live at
  **https://grief.pics**. The screenshot is a real capture saved to
  `public/media/projects/grief-website.png`.

### Managing projects — `/admin/projects`

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
| `lib/site.ts` | `name: "ryan"` |
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
  `lib/lastfm.ts` reads the user from env, not from `site.ts`.

## Changing something later

- **Name, handles, bio, links, skills** → `lib/site.ts` only.
- **Adding a project** → `/admin/projects` (or edit `projects.json` by hand).
  Omit `icon`/`shot` and the page falls back to letter tiles; mark it
  `featured` for the big card, otherwise it lands under "more projects".
- **Adding a contact card** → append to `site.contacts`; the grid renders it and
  picks an icon from `BRAND_ICON` by `platform`. Add the icon there if the
  platform is new.
- **Adding a biolink** → append to `site.biolinks`; omit `img` and the pill falls back to a letter tile. `/biolinks` renders as one embed-style card (`app/biolinks/page.tsx` + the `.embed-*` rules in `app/globals.css`): a hero banner with `site.tagline`, then every biolink plus the socials from `site.socials` as pills, so adding a link needs no markup change. The page currently points at two external profiles (`https://wsp.baby/yo`, `https://injuri.ng/no`).
- **Last.fm account** → `.env.local` (`LASTFM_USER`) plus `socials.lastfm`.
- **Timezone** → `site.timezone` (used by `LocalTime`).

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
  album-reactive backdrop still tints the scene via `mix-blend-mode: soft-light`

To use a photograph instead, drop it in `public/media/` and swap the `<svg>` for
an `<img>` — the petals, sway and parallax layers wrap it unchanged.

## Lyrics

`/api/lyrics` returns `{ lines, synced }`, where `synced` is true only when the
provider gave real LRC timestamps (`spotify-lyrics-ts` or lrclib). The flag is
cached alongside the lines so a second visit doesn't re-fetch.

`components/Header.tsx` turns that into playback-following lyrics:

- the position comes from `progressMs` + `fetchedAt` in `/api/nowplaying`, and is
  re-anchored on every 5s poll, so it cannot drift
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

Animations use `animation-fill-mode: backwards` so no transform lingers to
become a containing block for `position: fixed` children, and everything is
disabled under `prefers-reduced-motion: reduce` (verified in Chrome: reported
`animationName` is `pageRise` normally and `none` with reduced motion). The
background scene is included: sway/breathe/glow stop and the petals are
`display: none` under reduced motion, verified across all six routes.

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
`ADMIN_SECRET` for `/admin/projects`, and optionally
`BLOB_READ_WRITE_TOKEN` for durable project saves. Both admin values are required — without
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
- Project data is a JSON file, so it needs a writable filesystem that persists
  between requests (a normal VPS/container). On a read-only or ephemeral host the
  admin save returns `500`; commit `projects.json` and redeploy instead, since
  the build reads it from disk.
