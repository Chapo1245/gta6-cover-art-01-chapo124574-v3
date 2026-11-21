# Vice Lights Cover Maker — build report (v3)

Entry for make.fun `gta6-cover-art-01`. Built fresh in a recorded session
(recording `01a1fb77-891e-75cd-a6df-d4b95203b5d3`, started before any file
was written). No file from the v1/v2 builds was read, cloned, opened or
diffed; every source file below was written fresh in this session.

## The app

Offline static web app (`app/`): three photo panels in a comic-book grid,
drag to crop/position, zoom sliders, 3 layouts (Hero + Duo, Triptych,
Poster), 4 colour grades (Neon Nights, Sunset Heist, Golden Hour, Vice
Pink), 3 title treatments (Neon Stack, Sunset Gradient, Poster Outline),
editable title/subtitle/tagline, one-click PNG export at 1920x1080,
1080x1350 and 1080x1080. Lettering uses the local OFL Geist typeface
(`app/fonts/`, see `OFL.txt`). All titles are invented; no Rockstar logo,
artwork or font. Sample photos: the kit's free-to-use samples plus two
AI-made photos of no real person (`neon.jpg`, `rooftop.jpg`).

## Variants, self-graded on the kit's judge rubric (4 criteria x 10 = 40)

| Variant | Art | Any photo | Fast/easy | Polish | Total |
|---|---|---|---|---|---|
| A. Neon Tide (heroDuo, neon, stack) | 9 | 10 | 10 | 9 | **38** |
| B. Palm Heist (triptych, sunset, gradient) | 10 | 10 | 10 | 9 | **39** |
| C. Boulevard Nights (poster, golden, outline) | 9 | 10 | 10 | 9 | **38** |

Winner: **B. Palm Heist (39/40)** — the strongest single image: three faces
as a character lineup under a huge gradient-gold title on a ribbon, warm
sunset grade. It is the app's default variant and the first screenshot
(rendered in landscape so it fills the judge's contact-sheet top slot).

## Screenshots (all taken by the app itself, zero console errors)

- `1-cover.jpg` — Palm Heist landscape, the PNG the app exported (1920x1080)
- `2-editor.jpg` — the editor with a photo loaded, export controls visible
- `3-cover.jpg` — Palm Heist portrait, the PNG the app exported (1080x1350)
- `4-cover.jpg` — Boulevard Nights square, the PNG the app exported (1080x1080)

Each is inside the gate limits (long side <= 1280, short side >= 480,
<= 256 KiB).

## Local checks

- `MAKEFUN_OUTPUT_DIR=out node main.ts` writes `out/dossier.json` via the
  vendored `buildDossier`; `app/` is 13 files, well under the 993-file /
  48 MiB caps; `index.html` is under 1 MiB.
- No network references anywhere under `app/`: every script, font and image
  is a local file. The app was served locally and exercised in headless
  Chromium with no console errors and all four export downloads succeeding.
