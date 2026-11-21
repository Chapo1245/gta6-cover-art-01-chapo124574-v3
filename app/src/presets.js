// Cover presets: the layouts, colour grades and title treatments the editor
// offers. A preset is data only; app/src/cover.js turns it into pixels.
// Every preset is an original design: invented titles, no Rockstar artwork,
// no Rockstar logo, no Rockstar font.

/** The three panel layouts: how the photos share the cover. */
export const LAYOUTS = {
  heroDuo: {
    id: 'heroDuo',
    name: 'Hero + Duo',
    blurb: 'One big hero photo, two stacked side panels',
    panels: [
      { x: 0.0, y: 0.0, w: 0.62, h: 1.0 },
      { x: 0.62, y: 0.0, w: 0.38, h: 0.5 },
      { x: 0.62, y: 0.5, w: 0.38, h: 0.5 },
    ],
    titleZone: { x: 0.03, y: 0.78, w: 0.94, align: 'left' },
  },
  triptych: {
    id: 'triptych',
    name: 'Triptych',
    blurb: 'Three tall panels under one sweeping title ribbon',
    panels: [
      { x: 0.0, y: 0.0, w: 0.34, h: 1.0 },
      { x: 0.34, y: 0.0, w: 0.32, h: 1.0 },
      { x: 0.66, y: 0.0, w: 0.34, h: 1.0 },
    ],
    titleZone: { x: 0.03, y: 0.46, w: 0.94, align: 'center', ribbon: true },
  },
  poster: {
    id: 'poster',
    name: 'Poster',
    blurb: 'Full-bleed hero, two small strips on top, title block below',
    panels: [
      { x: 0.0, y: 0.0, w: 1.0, h: 1.0 },
      { x: 0.03, y: 0.04, w: 0.3, h: 0.2 },
      { x: 0.67, y: 0.04, w: 0.3, h: 0.2 },
    ],
    titleZone: { x: 0.03, y: 0.74, w: 0.94, align: 'left', block: true },
  },
};

/** The four colour grades: sunset and neon colour work, applied as overlays. */
export const GRADES = {
  neon: {
    id: 'neon',
    name: 'Neon Nights',
    blurb: 'Pink and teal neon after dark',
    skyTop: '#0b1035',
    skyBottom: '#ff2e88',
    wash: 'rgba(255, 46, 136, 0.28)',
    washBlend: 'overlay',
    glow: '#37f4ff',
    titleFill: '#ffffff',
    titleStroke: '#12041f',
    accent: '#37f4ff',
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset Heist',
    blurb: 'Golden hour over the boulevard',
    skyTop: '#2b1055',
    skyBottom: '#ff7a18',
    wash: 'rgba(255, 122, 24, 0.30)',
    washBlend: 'soft-light',
    glow: '#ffb347',
    titleFill: '#fff3d6',
    titleStroke: '#2a0a2e',
    accent: '#ffb347',
  },
  golden: {
    id: 'golden',
    name: 'Golden Hour',
    blurb: 'Warm gold, soft and bright',
    skyTop: '#3a1c10',
    skyBottom: '#ffc46b',
    wash: 'rgba(255, 196, 107, 0.26)',
    washBlend: 'soft-light',
    glow: '#ffe9a8',
    titleFill: '#ffffff',
    titleStroke: '#241207',
    accent: '#ffe9a8',
  },
  vice: {
    id: 'vice',
    name: 'Vice Pink',
    blurb: 'Pink and purple duotone',
    skyTop: '#1d0533',
    skyBottom: '#ff5da2',
    wash: 'rgba(255, 93, 162, 0.30)',
    washBlend: 'overlay',
    glow: '#c86bff',
    titleFill: '#ffffff',
    titleStroke: '#160223',
    accent: '#c86bff',
  },
};

/** Title treatments: how the big caption lettering is drawn. */
export const TITLE_STYLES = {
  outline: {
    id: 'outline',
    name: 'Poster Outline',
    blurb: 'White capitals, thick dark outline, hard shadow',
  },
  gradient: {
    id: 'gradient',
    name: 'Sunset Gradient',
    blurb: 'Title filled with a sunset gradient, thin outline',
  },
  stack: {
    id: 'stack',
    name: 'Neon Stack',
    blurb: 'Layered offset shadows that glow like neon',
  },
};

/** The export sizes: the common post sizes the judge asks for. */
export const SIZES = {
  landscape: { id: 'landscape', name: 'Story 1920 x 1080', w: 1920, h: 1080 },
  portrait: { id: 'portrait', name: 'Post 1080 x 1350', w: 1080, h: 1350 },
  square: { id: 'square', name: 'Square 1080 x 1080', w: 1080, h: 1080 },
};

/** The three art directions this entry ships as its default covers. */
export const VARIANTS = {
  neonTide: {
    id: 'neonTide',
    title: 'NEON TIDE',
    subtitle: 'VICE LIGHTS',
    tagline: 'THE CITY NEVER SLEEPS',
    layout: 'heroDuo',
    grade: 'neon',
    titleStyle: 'stack',
    photos: ['pier', 'boulevard', 'neon'],
  },
  palmHeist: {
    id: 'palmHeist',
    title: 'PALM HEIST',
    subtitle: 'BOULEVARD CREW',
    tagline: 'ONE LAST SCORE AT SUNSET',
    layout: 'triptych',
    grade: 'sunset',
    titleStyle: 'gradient',
    photos: ['boulevard', 'rooftop', 'pier'],
  },
  boulevardNights: {
    id: 'boulevardNights',
    title: 'BOULEVARD NIGHTS',
    subtitle: 'GOLDEN HOUR',
    tagline: 'EVERY LIGHT TELLS A STORY',
    layout: 'poster',
    grade: 'golden',
    titleStyle: 'outline',
    photos: ['neon', 'boulevard', 'pier'],
    // The two top strips are short and wide: aim their crops at the faces.
    crops: [
      { cx: 0.5, cy: 0.5, zoom: 1 },
      { cx: 0.5, cy: 0.3, zoom: 1 },
      { cx: 0.5, cy: 0.3, zoom: 1 },
    ],
  },
};
