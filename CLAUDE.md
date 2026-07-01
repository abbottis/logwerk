# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LogWerk is a 100% client-side, offline-first server log analytics dashboard. There is no build step, no bundler, no package.json, and no test suite — it's plain HTML5/ES6 modules loaded directly by the browser, styled with the Tailwind CSS CDN build and charted with Chart.js (also via CDN).

## Running the App

Browsers block ES module loading over `file://`, so a local server is required:

```bash
python3 -m http.server 8000    # or: npx serve / npx http-server / php -S localhost:8000
```

Then open `http://localhost:8000`. There is no lint or test command — verify changes manually in the browser (see README.md for a "How to Use" walkthrough: drag a log file onto the dropzone, switch presets, filter, inspect rows, check the Session Journeys tab).

## Architecture

The app is three flat ES6 modules plus `index.html`, wired together with no framework:

- **`parser.js`** — pure functions, no DOM access. Exports `PRESETS` (regex-based format definitions for `nginx_combined` and `apache_common`), `parseLine()` (single-line regex match), `parseLogFileAsync()` (chunked/async parsing with a progress callback so large files don't block the UI thread), `parseUserAgent()` (UA string → browser/OS/bot classification), and `getIpCountry()` (offline geo-IP lookup). Custom Regex mode is handled by building a preset-shaped object at the call site in `app.js` rather than here.

- **`i18n.js`** — a `TRANSLATIONS` dictionary keyed by locale (`en`, `de`, `fr`, `es`, `it`, `uk`) with `initI18n()`, `setLanguage()`, `getLanguage()`, and `t(key, replacements)`. `translatePage()` walks the DOM and applies translations to elements declaratively (via data attributes in `index.html`), then fires a `languagechanged` window event that `app.js` listens for to re-render dynamic content (charts, tables) in the new language. **Never hardcode user-facing strings in `index.html` or `app.js`** — add a key to `TRANSLATIONS` in every locale and reference it via `t()` / the translation data attributes instead.

- **`app.js`** — the entire application: DOM element lookups, all event wiring, state (`logEntries`, `filteredEntries`, pagination, `activeTab`), Chart.js instance management, filtering (`applyFilters`), table rendering/pagination, the detail modal, CSV export, and two IndexedDB helpers (`getDB`/`saveLogToCache`/`loadLogFromCache`) that persist the last-loaded log file so it survives a page reload. It also contains the **User Session Reconstruction Engine** (`groupEntriesIntoSessions`, `renderSessions`), which groups parsed entries by IP + User-Agent fingerprint using a 30-minute inactivity threshold and renders them as collapsible chronological timelines (`<details>`-based) in the "Session Journeys" tab.

- **`index.html`** — single-page markup for both the "Log Analysis" (charts + filterable table grid) and "Session Journeys" tabs, plus the detail modal. Tailwind is used utility-first with a dark-mode, glassmorphic aesthetic; there is no separate CSS file. All static copy is expected to be translation-driven, not hardcoded.

### Data flow

1. A log file is dropped/selected → `handleLogFile()` in `app.js` reads it and calls `parseLogFileAsync()` from `parser.js` with the selected preset (or a custom regex built from the "Custom RegEx" input).
2. Parsed entries populate `logEntries`; the file content + chosen preset are cached to IndexedDB via `saveLogToCache()` so a reload can restore state via `loadLogFromCache()` / `parseAndRenderCachedLog()`.
3. `applyFilters()` derives `filteredEntries` from `logEntries` based on the search box and the traffic/bot/status/method filter selects; `renderTable()`, `updateStatistics()`, and `renderCharts()` all consume `filteredEntries`.
4. Switching to the Session Journeys tab (`switchTab('sessions')`) runs `groupEntriesIntoSessions()` over the current entries and renders timeline cards via `renderSessions()`, independently filtered by its own toolbar (min clicks, session type, sort order).

## Conventions

- Stay vanilla — no React/Vue/Next/build tooling unless explicitly approved; the app must remain openable straight from a local static server without a build step.
- Log parsing must stay async/chunked so large files don't freeze the UI (see `parseLogFileAsync`'s `onProgress` callback and the parser progress bar in `app.js`).
- Support English and German at minimum (French, Spanish, Italian, and Ukrainian have since been added); all user-facing text goes through `i18n.js`, never hardcoded in HTML.
- `*.log` files and `.DS_Store` are gitignored — real log data must never be committed.
- After completing a major feature, refactor, translation expansion, or version milestone, update `changelog.md` (semver-sectioned) and cross-reference it from `README.md`.
