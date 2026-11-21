// Wires the page: pick photos, crop and position each panel, edit the caption,
// pick a layout, grade and title treatment, and export the cover as a PNG.
// A `?shot=` query sets up a fixed scene for a screenshot instead (./shots.js).
// Photos are read on the person's own machine and never uploaded.
import { drawCover } from './cover.js';
import { GRADES, LAYOUTS, SIZES, TITLE_STYLES, VARIANTS } from './presets.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const status = document.getElementById('status');

/** The editor state: everything drawCover needs, plus the loaded photos. */
export const coverState = {
  layout: 'triptych',
  grade: 'sunset',
  titleStyle: 'gradient',
  title: 'PALM HEIST',
  subtitle: 'BOULEVARD CREW',
  tagline: 'ONE LAST SCORE AT SUNSET',
  size: 'landscape',
  halftone: 1,
  seed: 7,
  crops: [
    { cx: 0.5, cy: 0.5, zoom: 1 },
    { cx: 0.5, cy: 0.5, zoom: 1 },
    { cx: 0.5, cy: 0.5, zoom: 1 },
  ],
};

/** The three loaded photos (HTMLImageElement or null), one per panel. */
export const coverPhotos = [null, null, null];

/** Loads an image from a URL, resolving to the image once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`cannot load ${url}`));
    img.src = url;
  });
}

/** Redraws the live preview at the chosen export size. */
export function redrawCover() {
  const size = SIZES[coverState.size] ?? SIZES.landscape;
  if (canvas.width !== size.w || canvas.height !== size.h) {
    canvas.width = size.w;
    canvas.height = size.h;
  }
  drawCover(canvas, coverPhotos, coverState);
}

/** Loads a sample photo into a panel and redraws. */
export async function setSamplePhoto(slot, name) {
  try {
    coverPhotos[slot] = await loadImage(`samples/${name}.jpg`);
  } catch {
    coverPhotos[slot] = null;
  }
  redrawCover();
}

/** Applies one of the shipped art directions (a VARIANTS entry) to the editor. */
export async function applyVariant(variantId) {
  const variant = VARIANTS[variantId];
  if (!variant) return;
  coverState.layout = variant.layout;
  coverState.grade = variant.grade;
  coverState.titleStyle = variant.titleStyle;
  coverState.title = variant.title;
  coverState.subtitle = variant.subtitle;
  coverState.tagline = variant.tagline;
  if (variant.crops) {
    coverState.crops = variant.crops.map((c) => ({ ...c }));
  }
  syncControlValues();
  await Promise.all(variant.photos.map((name, i) => setSamplePhoto(i, name)));
  redrawCover();
}

/** Writes the state back into the form controls. */
export function syncControlValues() {
  document.getElementById('title').value = coverState.title;
  document.getElementById('subtitle').value = coverState.subtitle;
  document.getElementById('tagline').value = coverState.tagline;
  document.getElementById('size').value = coverState.size;
  for (const [group, value] of [
    ['layout', coverState.layout],
    ['grade', coverState.grade],
    ['titleStyle', coverState.titleStyle],
  ]) {
    const radio = document.querySelector(`input[name="${group}"][value="${value}"]`);
    if (radio) radio.checked = true;
  }
}

/** Exports the current cover as a PNG file download. */
export function exportCoverPng() {
  redrawCover();
  const size = SIZES[coverState.size] ?? SIZES.landscape;
  canvas.toBlob((blob) => {
    if (!blob) {
      status.textContent = 'Export failed: the canvas could not make a PNG.';
      return;
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vice-lights-cover-${size.w}x${size.h}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    status.textContent = `Saved ${a.download} (${size.w} x ${size.h}).`;
    window.__exportDone = true;
  }, 'image/png');
}

/** Picks a random layout, grade and title treatment, then redraws. */
export function shuffleCover() {
  const pick = (obj) => {
    const keys = Object.keys(obj);
    return keys[Math.floor(Math.random() * keys.length)];
  };
  coverState.layout = pick(LAYOUTS);
  coverState.grade = pick(GRADES);
  coverState.titleStyle = pick(TITLE_STYLES);
  coverState.seed = Math.floor(Math.random() * 1000);
  syncControlValues();
  redrawCover();
  status.textContent = 'Shuffled the look — export it if you like it.';
}

/** Which panel (if any) a point on the preview canvas falls in. */
export function panelAtPoint(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const px = ((clientX - rect.left) / rect.width) * canvas.width;
  const py = ((clientY - rect.top) / rect.height) * canvas.height;
  const layout = LAYOUTS[coverState.layout] ?? LAYOUTS.heroDuo;
  const hit = layout.panels.findIndex((p) => (
    px >= p.x * canvas.width && px < (p.x + p.w) * canvas.width
    && py >= p.y * canvas.height && py < (p.y + p.h) * canvas.height
  ));
  return hit === -1 ? null : { slot: hit, px, py };
}

function wireControls() {
  document.querySelectorAll('.slot').forEach((slotEl) => {
    const slot = Number(slotEl.dataset.slot);
    slotEl.querySelector('.file').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        coverPhotos[slot] = await loadImage(URL.createObjectURL(file));
        redrawCover();
        status.textContent = `Panel ${slot + 1}: loaded ${file.name}.`;
      } catch {
        status.textContent = `Panel ${slot + 1}: that file could not be read as a photo.`;
      }
    });
    slotEl.querySelector('.sample').addEventListener('change', (e) => {
      setSamplePhoto(slot, e.target.value);
    });
    slotEl.querySelector('.zoom').addEventListener('input', (e) => {
      coverState.crops[slot].zoom = Number(e.target.value);
      redrawCover();
    });
  });

  for (const [group, key] of [
    ['layout', 'layout'],
    ['grade', 'grade'],
    ['titleStyle', 'titleStyle'],
  ]) {
    document.querySelectorAll(`input[name="${group}"]`).forEach((radio) => {
      radio.addEventListener('change', () => {
        coverState[key] = radio.value;
        redrawCover();
      });
    });
  }

  document.getElementById('title').addEventListener('input', (e) => {
    coverState.title = e.target.value;
    redrawCover();
  });
  document.getElementById('subtitle').addEventListener('input', (e) => {
    coverState.subtitle = e.target.value;
    redrawCover();
  });
  document.getElementById('tagline').addEventListener('input', (e) => {
    coverState.tagline = e.target.value;
    redrawCover();
  });
  document.getElementById('size').addEventListener('change', (e) => {
    coverState.size = e.target.value;
    redrawCover();
  });
  document.getElementById('export').addEventListener('click', exportCoverPng);
  document.getElementById('shuffle').addEventListener('click', shuffleCover);

  // Drag the preview to reposition the photo in the panel under the pointer.
  let drag = null;
  canvas.addEventListener('pointerdown', (e) => {
    const hit = panelAtPoint(e.clientX, e.clientY);
    if (!hit) return;
    canvas.setPointerCapture(e.pointerId);
    drag = { ...hit, startX: e.clientX, startY: e.clientY };
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const rect = canvas.getBoundingClientRect();
    const layout = LAYOUTS[coverState.layout] ?? LAYOUTS.heroDuo;
    const panel = layout.panels[drag.slot];
    const crop = coverState.crops[drag.slot];
    crop.cx -= ((e.clientX - drag.startX) / rect.width) / panel.w;
    crop.cy -= ((e.clientY - drag.startY) / rect.height) / panel.h;
    crop.cx = Math.min(1, Math.max(0, crop.cx));
    crop.cy = Math.min(1, Math.max(0, crop.cy));
    drag.startX = e.clientX;
    drag.startY = e.clientY;
    redrawCover();
  });
  canvas.addEventListener('pointerup', () => { drag = null; });
}

wireControls();

const shot = new URLSearchParams(location.search).get('shot');
if (shot) {
  runShot(shot, new URLSearchParams(location.search), {
    applyVariant,
    setSamplePhoto,
    exportCoverPng,
    redrawCover,
    state: coverState,
  });
} else {
  // First paint: the default variant's photos, then the live preview.
  applyVariant('palmHeist').then(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      window.__shotReady = true;
    }));
  });
}
