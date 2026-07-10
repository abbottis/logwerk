# Lightmode für LogWerk — Design

**Datum:** 2026-07-10
**Status:** Freigegeben

## Ziel

Ein Lightmode über Tailwind, dessen Schema sich aus dem heutigen (dunklen)
Schema ableitet. Das aktuelle Aussehen bleibt exakt als Darkmode erhalten.
Erst-Default folgt der OS-Einstellung; ein manueller Header-Toggle überschreibt
und persistiert die Wahl in `localStorage`.

## Grundansatz: Palette-Remap statt ~200 Einzeländerungen

Im Markup sind nur 9 Slate-Stufen im Einsatz (100, 200, 300, 400, 500, 700,
800, 900, 950). Statt jede der ~200 Utility-Klassen anzufassen, wird die
`slate`-Palette in `tailwind.config` auf CSS-Variablen umgestellt:

```js
slate: { 950: 'rgb(var(--c-slate-950) / <alpha-value>)', /* … */ }
```

Damit thematisieren sich alle bestehenden `bg-slate-*` / `text-slate-*` /
`border-slate-*`-Klassen automatisch, inklusive Opacity-Modifier wie
`bg-slate-900/40` (dank `<alpha-value>`). Kein HTML-Umbau der Utility-Klassen.

## Farbschema

Dark = heutige Slate-RGBs (keine optische Änderung). Light = handabgestimmte
Inversion der Helligkeitsrampe.

| Stufe | Rolle (Dark) | Dark | Light |
|---|---|---|---|
| slate-950 | Seiten-BG | `#020617` | `#f4f6f9` |
| slate-900 | Panel-/Card-BG | `#0f172a` | `#ffffff` |
| slate-800 | Border/Badge | `#1e293b` | `#e2e8f0` |
| slate-700 | Border | `#334155` | `#cbd5e1` |
| slate-500 | Muted Text | `#64748b` | `#64748b` |
| slate-400 | Muted Text | `#94a3b8` | `#475569` |
| slate-300 | Sekundärtext | `#cbd5e1` | `#334155` |
| slate-200 | Text | `#e2e8f0` | `#1e293b` |
| slate-100 | Haupttext | `#f1f5f9` | `#0f172a` |

Brand-Violett-Palette bleibt in beiden Themes gleich.

## Glassmorphism-CSS

`.glass-panel`, `.glass-card`, `.glass-input`, Scrollbar, Focus-Ring: fixe
`rgba`-Dunkelwerte werden in CSS-Variablen ausgelagert. `html.light`
überschreibt mit hellen Pendants (weiße, halbtransparente Panels, dezente
dunkle Borders, hellere Scrollbar-Spur). Background-Orbs bleiben, in Light
leicht abgeschwächt.

## Charts (Chart.js)

`Chart.defaults.color` (Ticks) und `Chart.defaults.borderColor` (Gridlines)
werden aus CSS-Variablen `--chart-tick` / `--chart-grid` gesetzt statt hart aus
Weiß. Bei Theme-Wechsel werden die gehaltenen Chart-Instanzen neu gerendert.
Semantische Datensatz-Akzentfarben und Status-Codierung (2xx/3xx/4xx/5xx)
bleiben unverändert (auf hell wie dunkel lesbar).

## Umschaltung & Persistenz

- Inline-Script im `<head>` (vor erstem Paint, kein FOUC): liest
  `localStorage['logwerk-theme']`; fehlt der Wert, greift
  `prefers-color-scheme`. Setzt `light`-Klasse auf `<html>`. Default = Dark.
- Sonne/Mond-Toggle im Header neben der Sprachauswahl. Klick flippt die
  `light`-Klasse, speichert die Wahl und triggert das Chart-Neurendern.
- Toggle-Label/Tooltip über `i18n.js` (neuer Key in allen 6 Locales).

## Betroffene Dateien

- `index.html` — tailwind.config, `<style>`, Inline-Head-Script, Toggle-Button
- `app.js` — Chart-Defaults aus Vars, Toggle-Handler, Neurendern
- `i18n.js` — Toggle-Key ×6 Locales
- `changelog.md` + README-Querverweis

## Bewusst weggelassen (YAGNI)

- Kein sichtbarer dritter „Auto/System"-Modus (OS nur als Erst-Default).
- Keine Umfärbung der semantischen Chart-Akzentfarben.
- Kein separates CSS-File.
