# Changelog

All notable changes to the **LogWerk** project will be documented in this file.

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
