# LogWerk - Server Log Analytics

[![Version](https://img.shields.io/badge/version-1.0.1-6d28d9?style=flat-square)](https://github.com/abbottis/logwerk/releases)
[![License: MIT](https://img.shields.io/github/license/abbottis/logwerk?style=flat-square)](LICENSE)

[Changelog](changelog.md)

---

## What is LogWerk?

LogWerk is a lightweight, offline-first server log analyzer dashboard that runs entirely in your web browser. Drop in an Nginx, Apache, or custom-formatted access log and instantly get an interactive analytics dashboard — no backend, no database, no data ever leaves your machine.

It's built for developers, sysadmins, and site operators who want a quick, private way to understand their traffic: who's visiting, which bots are crawling, what's failing, and how real users are moving through the site — without setting up a full log-analytics stack.

## Features

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

## How to Start

Modern browsers restrict loading local JavaScript modules via the `file://` protocol due to CORS security rules. Choose one of the following methods to run the dashboard:

### Method A: Serve via a Local Server (Recommended)

Open your terminal in the project directory and run one of these commands:

* **Python**: `python3 -m http.server 8000`
* **Node.js**: `npx serve` or `npx http-server`
* **PHP**: `php -S localhost:8000`

Then open your browser and go to: **`http://localhost:8000`**

*To stop the server, press **`Ctrl + C`** in your terminal.*

### Method B: Run directly via Safari (No Server)

1. Open Safari.
2. Go to **Settings** -> **Advanced** and enable **"Show features for web developers"**.
3. In the Safari menu bar, select **Develop** -> check **"Disable Local File Restrictions"**.
4. Double-click `index.html` to open it.

---

## How to Use

1. **Load Log**: Drag and drop your server log file (e.g., `access.log`) into the top dropzone.
2. **Format Preset**: The app supports **Nginx/Apache Combined** (default), **Apache Common**, and **Custom RegEx**.
3. **Filter**: Search by IP, path, status, referer, or filter traffic by **Humans Only** / **Bots Only** (which opens a specific bot dropdown selector). Sort entries by log age, oldest or newest first.
4. **Inspect**: Click on any row in the table to slide open detailed client and request metadata.
5. **Reload Persistence**: The last loaded log file is cached inside the browser's IndexedDB. If you refresh the page, it is restored automatically!

## Libraries & Sources Used

This project runs entirely on the client side and fetches the following resources via CDNs:

* **Tailwind CSS (v3)**: Utility-first CSS framework for layout styling. (CDN: `https://cdn.tailwindcss.com` | License: [MIT](https://github.com/tailwindlabs/tailwindcss/blob/master/LICENSE))
* **Chart.js (v4)**: Canvas-based HTML5 rendering of analytics charts. (CDN: `https://cdn.jsdelivr.net/npm/chart.js` | License: [MIT](https://github.com/chartjs/Chart.js/blob/master/LICENSE.md))
* **Google Fonts (Inter / Outfit)**: Typography styling. (CDN: `https://fonts.googleapis.com` | License: [OFL - SIL Open Font License](https://scripts.sil.org/OFL))

## License

This project is licensed under the terms of the **MIT License**:

```text
MIT License

Copyright (c) 2026 Tobias Glawe

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
