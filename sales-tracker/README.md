# Sales Tracker

A single-page sales tracker (Hua Tang / Luo Luo / Hua Luo) packaged as an
installable, offline-first web app. After one online visit it opens with no
network at all — on a tab left open, on a reload, or from a home-screen icon.

Sales are stored in the browser's `localStorage` on the device that recorded
them. Nothing is sent anywhere, and nothing syncs between devices.

## Deploy to Cloudflare

Any of these work; all three serve this folder as-is.

**1. Wrangler CLI (what `wrangler.toml` is for)**

```sh
cd sales-tracker
npx wrangler login     # one time
npx wrangler deploy
```

Published at `https://sales-tracker.<your-subdomain>.workers.dev`.

**2. Cloudflare Pages, connected to this repo** — auto-deploys on every push.

In the Cloudflare dashboard: *Workers & Pages → Create → Pages → Connect to Git*,
pick `joimik/joimik.github.io`, then set

| Setting                 | Value           |
| ----------------------- | --------------- |
| Framework preset        | None            |
| Build command           | *(leave empty)* |
| Build output directory  | `sales-tracker` |

**3. Cloudflare Pages, drag and drop** — no CLI, no git.

*Workers & Pages → Create → Pages → Upload assets*, then drop this
`sales-tracker` folder in.

HTTPS is required for offline mode to work (service workers refuse to run on
plain HTTP). Every Cloudflare URL above is HTTPS, so this is already handled —
it only matters if you try to self-host.

### Also works on GitHub Pages

The paths are all relative, so this same folder works unchanged at
`https://joimik.github.io/sales-tracker/` — useful as a backup URL.

## Using it offline

Open the page once while online. That visit caches everything (HTML, font,
icons), so the app keeps working offline from then on.

For the most reliable result, install it instead of leaving a tab open:

- **Android / Chrome** — menu → *Add to Home screen* / *Install app*
- **iPhone / iPad Safari** — Share → *Add to Home Screen*
- **Desktop Chrome or Edge** — install icon at the right of the address bar

Installed, it launches in its own window with no browser chrome and is not at
risk of the tab being discarded to free memory.

**Keep your data:** sales live in this site's `localStorage`. Clearing browsing
data / site data for the site deletes them, and so does "Reset all data" in the
app. The page asks the browser for persistent storage on load, which stops
routine automatic eviction, but it is not a backup.

## Updating the app

The service worker serves from cache first, so a changed file is not picked up
until the worker itself changes. After editing `index.html` (or any file in
`ASSETS`), **bump `VERSION` in `sw.js`** and redeploy:

```js
const VERSION = "2026-10-01.1";   // -> "2026-10-02.1", etc.
```

On the next visit the new worker installs in the background and the page shows
a small *New version ready — Reload* bar. Tapping Reload swaps it in and drops
the old cache. Without a version bump, people keep the old build indefinitely.

## Files

| File                     | Purpose                                                       |
| ------------------------ | ------------------------------------------------------------- |
| `index.html`             | The whole app — markup, styles, logic                         |
| `sw.js`                  | Service worker: precaches the app, serves it offline          |
| `manifest.webmanifest`   | Name, icons, colors, standalone display for installing        |
| `fonts/`                 | Self-hosted Bricolage Grotesque (one variable file, all weights) |
| `icons/`                 | App and home-screen icons, including a maskable one           |
| `_headers`               | Cache rules — versioned files long-lived, `sw.js` revalidated |
| `wrangler.toml`          | Cloudflare deploy config                                      |
| `.assetsignore`          | Keeps this README and the config out of the deployed site     |
