# Changelog

All notable changes to the **LogWerk** project will be documented in this file.

## [1.0.1] - 2026-07-01
### Fixed
- **Custom RegEx safety**: Custom log patterns are now validated to define all 9 required capture groups before use, replacing silent all-zero status/size data with a clear error message.
- **Parser stability**: A pathological or exception-throwing custom regex no longer hangs the parser indefinitely — parse failures now surface as a visible error instead of an unresponsive progress bar.
- **Date parsing robustness**: Timestamps that fail to parse now fall back to `null` instead of an invalid-but-truthy Date object, preventing corrupted values in charts, sorting, and session grouping.
- **Session fingerprinting**: Client session grouping now uses a collision-safe key instead of a delimiter-joined string.
- **Translation gaps**: The singular "1 Click" session label and the footer brand text are now fully localized instead of hardcoded English.

## [1.0] - 2026-07-01
### Added
- **Zero backend, 100% client-side**: Pure HTML5, ES6 modules, and Tailwind CSS. Your log files never leave the browser.
- **Multiple log format presets**: Nginx/Apache Combined (default), Apache Common, or bring your own Custom RegEx pattern.
- **Async, chunked parsing**: Large log files are parsed in the background without freezing the UI.
- **Interactive analytics dashboard**: Traffic over time, HTTP status distribution, top paths, top client IPs, browsers, and operating systems — all rendered with Chart.js.
- **Bot traffic intelligence**: Detects and classifies 40+ known bots and crawlers (search engines, AI crawlers, SEO tools, social media previews, Fediverse/ActivityPub crawlers, security scanners) with provider and purpose breakdowns.
- **Offline Geo-IP badges**: Visual country indicators per request, resolved entirely offline.
- **User Session Reconstruction**: Groups requests by client fingerprint (IP + User-Agent) into chronological session timelines, with filters for minimum clicks, session type, and sorting.
- **Powerful filtering & search**: Search by IP, path, status, referer, or user agent; filter by traffic type, specific bot, status code, HTTP method, and sort entries by log age (oldest/newest first).
- **Detail inspector**: Click any row to open a full breakdown of client, request, and user-agent metadata.
- **CSV export**: Export the currently filtered result set.
- **Reload persistence**: The last loaded log is cached in IndexedDB and automatically restored on refresh.
- **Multilingual UI**: English, German, French, Spanish, Italian, and Ukrainian, fully translated and switchable at runtime.
