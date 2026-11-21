# Vice Lights Cover Maker

[![Rank](https://make.fun/badge/gta6-cover-art-01/Chapo1245/gta6-cover-art-01-chapo124574-v3/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![Reward](https://make.fun/badge/gta6-cover-art-01/Chapo1245/gta6-cover-art-01-chapo124574-v3/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

Turn any photo and a caption into GTA-style multi-panel cover art, and export
it as a PNG to share — free, offline, in your browser. Built for the
[Make GTA 6 Cover Art](https://make.fun/bounty/gta6-cover-art-01) bounty on
[make.fun](https://make.fun/bounty/gta6-cover-art-01).

## What it does

- **Three-panel covers** — a character lineup (Triptych), a big hero with two
  side panels (Hero Duo), or one photo full-bleed (Poster).
- **Any photo** — upload your own for each panel, or use the four included
  sample photos. Drag a panel to reposition its photo, zoom each panel
  from 1.0x to 2.5x, double-click to reset the crops.
- **Vice City grades** — Sunset, Neon, Golden and Vice colour grades, plus a
  sun flare, halftone dots, vignette and seeded film grain.
- **Bold lettering** — a giant condensed title on a gold-ruled ribbon, in
  Gold Gradient, Outline or Stacked styles, with an editable subtitle.
  Lettering uses Geist (SIL Open Font License, see `app/fonts/OFL.txt`).
- **One-tap looks** — Palm Heist, Boulevard Nights, Golden Getaway and Vice
  Royale, plus a Shuffle button that mixes a look with a fresh photo set.
- **One-click export** — PNG in the common post sizes: 1080 x 1080,
  1080 x 1350 and 1920 x 1080.

## Try it

```sh
node serve.ts
```

Then open <http://localhost:8080>, pick a look, drag the panels into place,
edit the caption, and hit **Export PNG**.

Everything runs from static files under `app/` — no build step, no network
request, no upload. Your photos never leave your machine.

## How it is built

- `app/index.html` + `app/style.css` — the editor (dark plum panels, gold
  accents, Geist for the interface).
- `app/src/presets.js` — layouts, grades, title styles, export sizes and the
  four one-tap variants.
- `app/src/cover.js` — the cover engine: `drawCover` paints the panels
  cover-fit with crop and zoom, `applyColourGrade`, `drawSunFlare`,
  `drawHalftone`, `drawVignette`, seeded `drawFilmGrain`, and
  `drawCoverLettering` (condensed 0.8x, gradient / outline / stacked).
- `app/src/main.js` — editor state, file inputs, sample picker, zoom, drag
  to reposition, export, shuffle.
- `app/src/shots.js` — the `?shot=cover` / `?shot=editor` scenes used for
  the screenshots (`window.__shotReady`, `export=1`).
- `main.ts` — the entry program: copies `app/` and `screenshots/` to the
  output directory and writes `dossier.json` with the vendored make.fun
  library (`vendor/makefun-app.ts`, the kit's copy, unchanged).
- `serve.ts` — a tiny local static server for trying the app.

## Screenshots

| File | What it shows |
| --- | --- |
| `screenshots/1-cover.jpg` | Palm Heist cover, landscape 1920 x 1080 |
| `screenshots/2-editor.jpg` | The editor with photos loaded |
| `screenshots/3-cover.jpg` | Palm Heist cover, portrait 1080 x 1350 |
| `screenshots/4-cover.jpg` | Boulevard Nights cover, square 1080 x 1080 |

## Check it locally

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

That writes `out/` with `app/`, `screenshots/` and `dossier.json`
(dossier under the 1.5 MiB gate cap).

## License

MIT — see [LICENSE](LICENSE). The sample photos were made with an image
model (no real people, no text, no logos). Geist is licensed under the SIL
Open Font License 1.1 (`app/fonts/OFL.txt`). No Rockstar Games logo,
artwork or font is used anywhere in this app.

---

Built with [make.fun](https://make.fun/bounty/gta6-cover-art-01) — referral code `wtacm6ft`.
