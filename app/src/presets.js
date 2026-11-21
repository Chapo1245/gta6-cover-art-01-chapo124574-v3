// Vice Lights Cover Maker — presets: every layout, colour grade, title style,
// export size and one-tap variant the editor offers. Pure data, no DOM here,
// so cover.js can paint any combination and main.js can bind it to controls.

export const LAYOUTS = {
  triptych: {
    id: 'triptych',
    label: 'Triptych',
    blurb: 'Three faces in a row, a character lineup under the title.',
  },
  heroDuo: {
    id: 'heroDuo',
    label: 'Hero Duo',
    blurb: 'One big hero panel, two smaller panels stacked beside it.',
  },
  poster: {
    id: 'poster',
    label: 'Poster',
    blurb: 'One photo full-bleed, title ribbon across the bottom.',
  },
};

export const GRADES = {
  sunset: {
    id: 'sunset',
    label: 'Sunset',
    blurb: 'Warm golden-hour wash, orange highlights, pink shadows.',
  },
  neon: {
    id: 'neon',
    label: 'Neon',
    blurb: 'Hot pink and teal night-street glow.',
  },
  golden: {
    id: 'golden',
    label: 'Golden',
    blurb: 'Rich amber light, deep honey shadows.',
  },
  vice: {
    id: 'vice',
    label: 'Vice',
    blurb: 'Purple dusk with electric magenta rims.',
  },
};

export const TITLE_STYLES = {
  gradient: {
    id: 'gradient',
    label: 'Gold Gradient',
    blurb: 'Giant condensed letters filled with a gold gradient.',
  },
  outline: {
    id: 'outline',
    label: 'Outline',
    blurb: 'Hollow letters, gold stroke over a dark fill.',
  },
  stack: {
    id: 'stack',
    label: 'Stacked',
    blurb: 'Title split across two stacked lines.',
  },
};

export const SIZES = {
  landscape: { id: 'landscape', label: 'Landscape 1920 x 1080', width: 1920, height: 1080 },
  portrait: { id: 'portrait', label: 'Portrait 1080 x 1350', width: 1080, height: 1350 },
  square: { id: 'square', label: 'Square 1080 x 1080', width: 1080, height: 1080 },
};

// One-tap looks. Each variant is a full combination of layout + grade +
// title style + the sample photos that suit it, so a single click (or the
// Shuffle button) rebuilds the whole cover.
export const VARIANTS = {
  palmHeist: {
    id: 'palmHeist',
    label: 'Palm Heist',
    layout: 'triptych',
    grade: 'sunset',
    titleStyle: 'gradient',
    title: 'PALM HEIST',
    subtitle: 'VICE CITY • GOLDEN HOUR',
    photos: ['boulevard', 'rooftop', 'pier'],
  },
  boulevardNights: {
    id: 'boulevardNights',
    label: 'Boulevard Nights',
    layout: 'poster',
    grade: 'neon',
    titleStyle: 'outline',
    title: 'BOULEVARD NIGHTS',
    subtitle: 'NEON • AFTER DARK',
    photos: ['neon', 'boulevard', 'rooftop'],
  },
  goldenGetaway: {
    id: 'goldenGetaway',
    label: 'Golden Getaway',
    layout: 'heroDuo',
    grade: 'golden',
    titleStyle: 'stack',
    title: 'GOLDEN GETAWAY',
    subtitle: 'ONE LAST JOB',
    photos: ['rooftop', 'pier', 'neon'],
  },
  viceRoyale: {
    id: 'viceRoyale',
    label: 'Vice Royale',
    layout: 'triptych',
    grade: 'vice',
    titleStyle: 'gradient',
    title: 'VICE ROYALE',
    subtitle: 'KINGS OF THE COAST',
    photos: ['neon', 'rooftop', 'boulevard'],
  },
};

// The sample photos shipped under app/samples/. All four were made with an
// image model for this kind of cover (no real person, no text, no logos).
export const SAMPLES = {
  boulevard: { id: 'boulevard', label: 'Boulevard', file: 'samples/boulevard.jpg' },
  pier: { id: 'pier', label: 'Pier', file: 'samples/pier.jpg' },
  neon: { id: 'neon', label: 'Neon Street', file: 'samples/neon.jpg' },
  rooftop: { id: 'rooftop', label: 'Rooftop', file: 'samples/rooftop.jpg' },
};

export const SAMPLE_ORDER = ['boulevard', 'pier', 'neon', 'rooftop'];
