[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/Chapo1245/gta6-cover-art-01-chapo124574-v3/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/Chapo1245/gta6-cover-art-01-chapo124574-v3/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

# Vice Lights Cover Maker

An offline web app that turns any photo and caption into GTA&nbsp;6-style cover
art, exported as a PNG to share. Pick photos for three comic-book panels, drag
to crop and position each one, choose a layout, a sunset or neon colour grade
and a title treatment, then export in the common post sizes: 1080&nbsp;x&nbsp;1080,
1080&nbsp;x&nbsp;1350 and 1920&nbsp;x&nbsp;1080.

Everything runs in the browser from static files: no upload, no network
request, no build step. Photos are read on your own machine and never leave it.

## Try it

```sh
node serve.ts
# open http://localhost:8080
```

## How it works

- **Panels** — three photo panels in a comic-book grid (Hero + Duo, Triptych,
  Poster). Load your own photos or the included samples, drag the preview to
  reposition a photo, slide to zoom.
- **Grades** — Neon Nights, Sunset Heist, Golden Hour and Vice Pink colour
  grades, with a sun flare, halftone dots, vignette and film grain.
- **Lettering** — big condensed caption lettering in three treatments (Neon
  Stack, Sunset Gradient, Poster Outline), with a subtitle and tagline.
- **Export** — one click writes a PNG at 1920&nbsp;x&nbsp;1080, 1080&nbsp;x&nbsp;1350
  or 1080&nbsp;x&nbsp;1080.

The cover renderer is `app/src/cover.js`; the presets are `app/src/presets.js`;
the editor wiring is `app/src/main.js`. `main.ts` hands the app in for the
make.fun gate: it copies `app/` and `screenshots/` to `/output` and writes
`/output/dossier.json`.

## Originality

All titles are invented ("Neon Tide", "Palm Heist", "Boulevard Nights"). The
app shows no Rockstar Games logo, wordmark, official artwork, character or
font. Its lettering uses the Geist typeface (SIL Open Font License, see
`app/fonts/OFL.txt`). The sample photos under `app/samples/` are the kit's
free-to-use samples plus AI-made photos of no real person.

## Entry

Entered on [make.fun](https://make.fun/bounty/gta6-cover-art-01) for the
**gta6-cover-art-01** bounty.

<sub>Entered on [make.fun](https://make.fun/?ref=wtacm6ft&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
