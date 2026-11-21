// Vice Lights Cover Maker — editor wiring. Owns the state (variant, layout,
// grade, title, the three photos and each panel's crop), binds every control,
// paints the live preview through cover.js, and exports the PNG. Screenshot
// scenes (?shot=…) are delegated to shots.js.

import { drawCover, panelRects } from './cover.js';
import { GRADES, LAYOUTS, SAMPLES, SAMPLE_ORDER, SIZES, TITLE_STYLES, VARIANTS } from './presets.js';
import { runShot } from './shots.js';

const $ = (id) => document.getElementById(id);
const preview = $('preview');
const statusEl = $('status');

export const state = {
  variant: 'palmHeist',
  layout: 'triptych',
  grade: 'sunset',
  titleStyle: 'gradient',
  size: 'landscape',
  title: 'PALM HEIST',
  subtitle: 'VICE CITY • GOLDEN HOUR',
  photos: ['boulevard', 'rooftop', 'pier'],
  crops: [
    { zoom: 1, ox: 0, oy: 0 },
    { zoom: 1, ox: 0, oy: 0 },
    { zoom: 1, ox: 0, oy: 0 },
  ],
  images: [null, null, null],
  seed: 7,
};

function say(message) {
  statusEl.textContent = message;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load ${src}`));
    image.src = src;
  });
}

async function loadSample(slot, sampleId) {
  state.photos[slot] = sampleId;
  const sample = SAMPLES[sampleId];
  if (!sample) {
    state.images[slot] = null;
    draw();
    return;
  }
  try {
    state.images[slot] = await loadImage(sample.file);
  } catch {
    state.images[slot] = null;
    say(`Sample photo ${sample.label} failed to load.`);
  }
  draw();
}

function draw() {
  drawCover(preview, {
    images: state.images,
    title: state.title,
    subtitle: state.subtitle,
    layout: state.layout,
    grade: state.grade,
    titleStyle: state.titleStyle,
    size: SIZES[state.size],
    crops: state.crops,
    seed: state.seed,
  });
}

function syncControls() {
  $('title').value = state.title;
  $('subtitle').value = state.subtitle;
  document.querySelectorAll('input[name="layout"]').forEach((radio) => {
    radio.checked = radio.value === state.layout;
  });
  document.querySelectorAll('input[name="grade"]').forEach((radio) => {
    radio.checked = radio.value === state.grade;
  });
  document.querySelectorAll('input[name="titleStyle"]').forEach((radio) => {
    radio.checked = radio.value === state.titleStyle;
  });
  $('size').value = state.size;
  state.photos.forEach((photo, i) => {
    $(`sample${i}`).value = photo ?? '';
    $(`zoom${i}`).value = String(state.crops[i].zoom);
    $(`zoomValue${i}`).textContent = `${state.crops[i].zoom.toFixed(1)}x`;
  });
  document.querySelectorAll('#variants button').forEach((button) => {
    button.classList.toggle('active', button.dataset.variant === state.variant);
  });
}

async function applyVariant(variantId) {
  const variant = VARIANTS[variantId];
  if (!variant) return;
  state.variant = variantId;
  state.layout = variant.layout;
  state.grade = variant.grade;
  state.titleStyle = variant.titleStyle;
  state.title = variant.title;
  state.subtitle = variant.subtitle;
  state.photos = [...variant.photos];
  state.crops = state.crops.map(() => ({ zoom: 1, ox: 0, oy: 0 }));
  state.seed = 7 + Object.keys(VARIANTS).indexOf(variantId);
  syncControls();
  await Promise.all(variant.photos.map((photo, i) => loadSample(i, photo)));
  say(`${variant.label} loaded — drag a panel to reposition it, then export.`);
}

// One PNG, at the chosen post size, downloaded straight from the canvas.
export function exportPng() {
  return new Promise((resolve) => {
    preview.toBlob((blob) => {
      if (!blob) {
        say('Export failed — nothing to save yet.');
        resolve(null);
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const size = SIZES[state.size];
      link.href = url;
      link.download = `vice-lights-${state.size}-${size.width}x${size.height}.png`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      say(`Exported ${size.width} x ${size.height} PNG.`);
      resolve(blob);
    }, 'image/png');
  });
}

function shuffleLook() {
  const ids = Object.keys(VARIANTS);
  const next = ids[Math.floor(Math.random() * ids.length)];
  const photos = [...SAMPLE_ORDER].sort(() => Math.random() - 0.5).slice(0, 3);
  const variant = VARIANTS[next];
  state.variant = next;
  state.layout = variant.layout;
  state.grade = variant.grade;
  state.titleStyle = variant.titleStyle;
  state.title = variant.title;
  state.subtitle = variant.subtitle;
  state.photos = photos;
  state.crops = state.crops.map(() => ({ zoom: 1, ox: 0, oy: 0 }));
  state.seed = Math.floor(Math.random() * 1000);
  syncControls();
  Promise.all(photos.map((photo, i) => loadSample(i, photo))).then(() => {
    say(`Shuffled to ${variant.label} with a fresh photo set.`);
  });
}

function buildVariantButtons() {
  const holder = $('variants');
  for (const variant of Object.values(VARIANTS)) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.variant = variant.id;
    button.textContent = variant.label;
    button.addEventListener('click', () => applyVariant(variant.id));
    holder.appendChild(button);
  }
}

function buildRadioGroup(name, options, onChange) {
  const holder = $(`${name}Group`);
  for (const option of Object.values(options)) {
    const label = document.createElement('label');
    label.className = 'chip';
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = name;
    radio.value = option.id;
    radio.addEventListener('change', () => onChange(option.id));
    label.append(radio, document.createTextNode(option.label));
    holder.appendChild(label);
  }
}

function buildSizeOptions() {
  const select = $('size');
  for (const size of Object.values(SIZES)) {
    const option = document.createElement('option');
    option.value = size.id;
    option.textContent = size.label;
    select.appendChild(option);
  }
}

function bindPanelControls() {
  for (let i = 0; i < 3; i += 1) {
    const fileInput = $(`file${i}`);
    fileInput.addEventListener('change', async () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      const image = await loadImage(URL.createObjectURL(file));
      state.images[i] = image;
      state.photos[i] = null;
      $(`sample${i}`).value = '';
      draw();
      say(`Panel ${i + 1}: your photo loaded. Drag it to reposition.`);
    });

    const sampleSelect = $(`sample${i}`);
    for (const sampleId of SAMPLE_ORDER) {
      const option = document.createElement('option');
      option.value = sampleId;
      option.textContent = SAMPLES[sampleId].label;
      sampleSelect.appendChild(option);
    }
    sampleSelect.addEventListener('change', () => loadSample(i, sampleSelect.value));

    const zoom = $(`zoom${i}`);
    zoom.addEventListener('input', () => {
      state.crops[i].zoom = Number(zoom.value);
      $(`zoomValue${i}`).textContent = `${state.crops[i].zoom.toFixed(1)}x`;
      draw();
    });
  }
}

// Drag a panel to reposition its photo inside the frame. The pointer maps
// from the displayed preview back to canvas pixels, then to the panel.
function bindDrag() {
  let dragging = null;
  const toCanvas = (event) => {
    const rect = preview.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * preview.width,
      y: ((event.clientY - rect.top) / rect.height) * preview.height,
    };
  };
  preview.addEventListener('pointerdown', (event) => {
    const point = toCanvas(event);
    const rects = panelRects(state.layout, preview.width, preview.height);
    const index = rects.findIndex((r) => point.x >= r.x && point.x <= r.x + r.w && point.y >= r.y && point.y <= r.y + r.h);
    if (index === -1 || !state.images[index]) return;
    dragging = { index, startX: point.x, startY: point.y, ox: state.crops[index].ox, oy: state.crops[index].oy };
    preview.setPointerCapture(event.pointerId);
    preview.style.cursor = 'grabbing';
  });
  preview.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    const point = toCanvas(event);
    const rects = panelRects(state.layout, preview.width, preview.height);
    const rect = rects[dragging.index];
    const crop = state.crops[dragging.index];
    crop.ox = Math.max(-1, Math.min(1, dragging.ox - ((point.x - dragging.startX) / rect.w) * 2));
    crop.oy = Math.max(-1, Math.min(1, dragging.oy - ((point.y - dragging.startY) / rect.h) * 2));
    draw();
  });
  const endDrag = () => {
    dragging = null;
    preview.style.cursor = 'grab';
  };
  preview.addEventListener('pointerup', endDrag);
  preview.addEventListener('pointercancel', endDrag);
  preview.addEventListener('dblclick', () => {
    state.crops = state.crops.map(() => ({ zoom: 1, ox: 0, oy: 0 }));
    syncControls();
    draw();
    say('Crops reset.');
  });
}

function bindTextControls() {
  $('title').addEventListener('input', (event) => {
    state.title = event.target.value;
    draw();
  });
  $('subtitle').addEventListener('input', (event) => {
    state.subtitle = event.target.value;
    draw();
  });
  $('size').addEventListener('change', (event) => {
    state.size = event.target.value;
    draw();
  });
  $('export').addEventListener('click', exportPng);
  $('shuffle').addEventListener('click', shuffleLook);
}

// Handles the screenshot scenes (?shot=cover / ?shot=editor) and hands the
// ready flag to the shot runner. Exposed for the shot script's export step.
window.__viceLights = { state, draw, exportPng, applyVariant, loadSample };

buildVariantButtons();
buildRadioGroup('layout', LAYOUTS, (id) => { state.layout = id; draw(); });
buildRadioGroup('grade', GRADES, (id) => { state.grade = id; draw(); });
buildRadioGroup('titleStyle', TITLE_STYLES, (id) => { state.titleStyle = id; draw(); });
buildSizeOptions();
bindPanelControls();
bindDrag();
bindTextControls();

const params = new URLSearchParams(location.search);
if (params.has('shot')) {
  runShot(params.get('shot'), params, { state, draw, applyVariant, loadSample, exportPng });
} else {
  applyVariant('palmHeist');
}
