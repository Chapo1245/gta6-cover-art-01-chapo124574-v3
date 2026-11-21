// Vice Lights Cover Maker — the cover engine. Everything here paints on a
// plain 2D canvas: panel photos cover-fit with crop and zoom, a warm or neon
// colour grade, sun flare, halftone, vignette and seeded film grain, then the
// big condensed title lettering on its ribbon. No network, no libraries.

import { LAYOUTS } from './presets.js';

// A tiny seeded generator so the film grain is identical on every repaint
// of the same cover (same seed, same specks) but differs between covers.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Panel rectangles for a layout at a given canvas size. main.js reuses this
// to map a pointer drag onto the panel under the cursor.
export function panelRects(layoutId, width, height) {
  const gap = Math.round(width * 0.012);
  const margin = Math.round(width * 0.02);
  if (layoutId === 'poster') {
    return [{ x: 0, y: 0, w: width, h: height }];
  }
  const top = Math.round(height * 0.305);
  const bottom = Math.round(height * 0.965);
  const panelHeight = bottom - top;
  if (layoutId === 'heroDuo') {
    const heroWidth = Math.round(width * 0.6);
    const sideX = margin + heroWidth + gap;
    const sideWidth = width - margin - sideX;
    const half = Math.floor((panelHeight - gap) / 2);
    return [
      { x: margin, y: top, w: heroWidth, h: panelHeight },
      { x: sideX, y: top, w: sideWidth, h: half },
      { x: sideX, y: top + half + gap, w: sideWidth, h: panelHeight - half - gap },
    ];
  }
  // triptych: three equal panels in a row.
  const total = width - margin * 2 - gap * 2;
  const panelWidth = Math.floor(total / 3);
  return [0, 1, 2].map((i) => ({
    x: margin + i * (panelWidth + gap),
    y: top,
    w: panelWidth,
    h: panelHeight,
  }));
}

// The ribbon band the title sits on. Kept high on the cover, well clear of
// the panels, so it never touches a chin in the lineup below.
export function ribbonRect(layoutId, width, height) {
  if (layoutId === 'poster') {
    const h = Math.round(height * 0.15);
    return { x: Math.round(width * 0.04), y: height - h - Math.round(height * 0.045), w: Math.round(width * 0.92), h };
  }
  const h = Math.round(height * 0.19);
  return { x: Math.round(width * 0.03), y: Math.round(height * 0.05), w: Math.round(width * 0.94), h };
}

// One photo, cover-fit into its rectangle, with zoom and a drag offset.
// crop = { zoom, ox, oy }; ox/oy run -1..1 across the spare overflow.
export function drawPanel(ctx, image, rect, crop) {
  const { x, y, w, h } = rect;
  const zoom = crop?.zoom ?? 1;
  const base = Math.max(w / image.naturalWidth, h / image.naturalHeight) * zoom;
  const dw = image.naturalWidth * base;
  const dh = image.naturalHeight * base;
  const spareX = Math.max(0, (dw - w) / 2);
  const spareY = Math.max(0, (dh - h) / 2);
  const dx = x + (w - dw) / 2 - (crop?.ox ?? 0) * spareX;
  const dy = y + (h - dh) / 2 - (crop?.oy ?? 0) * spareY;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.drawImage(image, dx, dy, dw, dh);
  // A hairline inner edge so panels read as separate plates.
  ctx.strokeStyle = 'rgba(255, 214, 130, 0.55)';
  ctx.lineWidth = Math.max(2, Math.round(w * 0.002));
  ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
  ctx.restore();
}

// Warm / neon colour grades, painted as translucent overlays so the photos
// keep their detail. Each grade is a pair of gradients: a light wash from
// the top and a shadow tint from the bottom.
export function applyColourGrade(ctx, rects, width, height, gradeId) {
  const washes = {
    sunset: ['rgba(255, 122, 26, 0.34)', 'rgba(214, 48, 120, 0.30)'],
    neon: ['rgba(255, 45, 149, 0.30)', 'rgba(0, 229, 255, 0.28)'],
    golden: ['rgba(255, 176, 32, 0.36)', 'rgba(146, 64, 14, 0.30)'],
    vice: ['rgba(168, 85, 247, 0.32)', 'rgba(255, 45, 149, 0.30)'],
  };
  const [top, bottom] = washes[gradeId] ?? washes.sunset;
  ctx.save();
  for (const r of rects) {
    ctx.beginPath();
    ctx.rect(r.x, r.y, r.w, r.h);
    ctx.clip();
    const g = ctx.createLinearGradient(0, r.y, 0, r.y + r.h);
    g.addColorStop(0, top);
    g.addColorStop(0.55, 'rgba(255, 255, 255, 0)');
    g.addColorStop(1, bottom);
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = g;
    ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillStyle = top;
    ctx.fillRect(r.x, r.y, r.w, r.h * 0.4);
  }
  ctx.restore();
}

// A low sun glow in the top corner of the panel area, plus a thin horizon
// streak. Only the warm grades call for it.
export function drawSunFlare(ctx, rects, width, height, gradeId) {
  if (gradeId !== 'sunset' && gradeId !== 'golden') return;
  // The glow sits in the top corner of the last panel, where the sky is,
// so the sun disc never lands on a face in the lineup.
  const area = rects[rects.length - 1];
  const cx = area.x + area.w * 0.82;
  const cy = area.y + area.h * 0.16;
  const radius = Math.max(area.w, area.h) * 0.55;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  glow.addColorStop(0, 'rgba(255, 214, 130, 0.85)');
  glow.addColorStop(0.35, 'rgba(255, 140, 66, 0.35)');
  glow.addColorStop(1, 'rgba(255, 140, 66, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(area.x, area.y, width, area.h);
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = 'rgba(255, 240, 200, 0.9)';
  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(10, width * 0.018), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// Halftone dots: a comic-print accent along the bottom strip and the top
// corners of the panel area. Density grows toward the edges.
export function drawHalftone(ctx, rects, width, height) {
  const strip = Math.round(height * 0.05);
  const step = Math.max(10, Math.round(width * 0.012));
  ctx.save();
  ctx.fillStyle = 'rgba(20, 8, 32, 0.28)';
  for (let yy = height - strip; yy < height; yy += step) {
    const depth = (yy - (height - strip)) / strip;
    for (let xx = step / 2; xx < width; xx += step) {
      const r = Math.max(0.6, step * 0.16 * (0.4 + depth));
      ctx.beginPath();
      ctx.arc(xx, yy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

// Darkened corners and edges so the title and the faces pop.
export function drawVignette(ctx, width, height) {
  const g = ctx.createRadialGradient(
    width / 2, height / 2, Math.min(width, height) * 0.42,
    width / 2, height / 2, Math.max(width, height) * 0.75,
  );
  g.addColorStop(0, 'rgba(10, 4, 20, 0)');
  g.addColorStop(1, 'rgba(10, 4, 20, 0.42)');
  ctx.save();
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

// Seeded monochrome speckle over the whole cover, kept faint.
export function drawFilmGrain(ctx, width, height, seed) {
  const rand = mulberry32(seed);
  const count = Math.floor((width * height) / 1400);
  ctx.save();
  for (let i = 0; i < count; i += 1) {
    const x = rand() * width;
    const y = rand() * height;
    const light = rand() > 0.5;
    ctx.fillStyle = light ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
    ctx.fillRect(x, y, 1.6, 1.6);
  }
  ctx.restore();
}

// The ribbon: a dark plum band with notched ends and thin gold rules above
// and below it. The title sits inside it.
export function drawRibbon(ctx, rect) {
  const { x, y, w, h } = rect;
  const notch = Math.round(h * 0.28);
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + notch, y);
  ctx.lineTo(x + w - notch, y);
  ctx.lineTo(x + w, y + h / 2);
  ctx.lineTo(x + w - notch, y + h);
  ctx.lineTo(x + notch, y + h);
  ctx.lineTo(x, y + h / 2);
  ctx.closePath();
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, '#2a1145');
  g.addColorStop(0.5, '#1a0b2e');
  g.addColorStop(1, '#12061f');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 201, 92, 0.9)';
  ctx.lineWidth = Math.max(2, Math.round(h * 0.02));
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255, 201, 92, 0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + notch + 6, y + 5);
  ctx.lineTo(x + w - notch - 6, y + 5);
  ctx.moveTo(x + notch + 6, y + h - 5);
  ctx.lineTo(x + w - notch - 6, y + h - 5);
  ctx.stroke();
  ctx.restore();
}

// Big condensed title lettering. The 0.8 horizontal squeeze is the poster's
// tall condensed look; the text is measured after the squeeze so it always
// fits the ribbon. Styles: gradient (gold fill), outline (gold stroke over
// dark fill), stack (two lines, one above the other).
export function drawCoverLettering(ctx, title, subtitle, rect, styleId, gradeId) {
  const words = title.trim().toUpperCase().split(/\s+/);
  const lines = styleId === 'stack' && words.length > 1
    ? [words.slice(0, Math.ceil(words.length / 2)).join(' '), words.slice(Math.ceil(words.length / 2)).join(' ')]
    : [title.trim().toUpperCase()];
  const twoLines = lines.length === 2;
  const ribbonH = rect.h;
  const lineH = twoLines ? ribbonH * 0.4 : ribbonH * 0.62;
  const subH = Math.max(12, ribbonH * 0.11);
  const totalH = lineH * lines.length + (twoLines ? ribbonH * 0.06 : subH + ribbonH * 0.05);
  let top = rect.y + (ribbonH - totalH) / 2 + lineH * 0.82;

  const gold = ctx.createLinearGradient(0, rect.y, 0, rect.y + rect.h);
  if (gradeId === 'neon') {
    gold.addColorStop(0, '#ffe9f6');
    gold.addColorStop(0.5, '#ff5db1');
    gold.addColorStop(1, '#ff9de2');
  } else if (gradeId === 'vice') {
    gold.addColorStop(0, '#fdf0ff');
    gold.addColorStop(0.5, '#c084fc');
    gold.addColorStop(1, '#f0abfc');
  } else {
    gold.addColorStop(0, '#fff3c4');
    gold.addColorStop(0.45, '#ffd34d');
    gold.addColorStop(0.75, '#f5a623');
    gold.addColorStop(1, '#ff7a18');
  }

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  for (let li = 0; li < lines.length; li += 1) {
    const text = lines[li];
    let px = Math.round(lineH);
    // Shrink until the squeezed text fits the ribbon with a margin.
    for (;;) {
      ctx.font = `700 ${px}px Geist, "Arial Narrow", sans-serif`;
      const wide = ctx.measureText(text).width * 0.8;
      if (wide <= rect.w * 0.9 || px <= 10) break;
      px = Math.floor(px * 0.94);
    }
    const cy = top + li * lineH;
    ctx.save();
    ctx.translate(rect.x + rect.w / 2, 0);
    ctx.scale(0.8, 1);
    ctx.font = `700 ${px}px Geist, "Arial Narrow", sans-serif`;
    ctx.lineJoin = 'round';
    if (styleId === 'outline') {
      ctx.fillStyle = '#160a26';
      ctx.fillText(text, 0, cy);
      ctx.lineWidth = Math.max(2, px * 0.045);
      ctx.strokeStyle = '#ffd34d';
      ctx.strokeText(text, 0, cy);
    } else {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
      ctx.shadowBlur = Math.round(px * 0.08);
      ctx.shadowOffsetY = Math.round(px * 0.03);
      ctx.fillStyle = gold;
      ctx.fillText(text, 0, cy);
      ctx.shadowColor = 'transparent';
      ctx.lineWidth = Math.max(2, px * 0.03);
      ctx.strokeStyle = 'rgba(60, 16, 0, 0.85)';
      ctx.strokeText(text, 0, cy);
    }
    ctx.restore();
  }
  if (subtitle) {
    const subY = rect.y + ribbonH - Math.max(10, ribbonH * 0.09);
    ctx.font = `500 ${Math.round(subH)}px Geist, "Arial Narrow", sans-serif`;
    ctx.fillStyle = 'rgba(255, 226, 160, 0.92)';
    const spaced = subtitle.toUpperCase().split('').join(' ');
    ctx.fillText(spaced, rect.x + rect.w / 2, subY);
  }
  ctx.restore();
}

// Paint a whole cover onto a canvas. opts: { images, title, subtitle,
// layout, grade, titleStyle, size, crops, seed }. images[i] may be null —
// an empty panel is filled with a warm gradient instead of staying blank.
export function drawCover(canvas, opts) {
  const { width, height } = opts.size;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const layout = LAYOUTS[opts.layout] ? opts.layout : 'triptych';
  const rects = panelRects(layout, width, height);
  const ribbon = ribbonRect(layout, width, height);

  ctx.fillStyle = '#14081f';
  ctx.fillRect(0, 0, width, height);

  rects.forEach((rect, i) => {
    const image = opts.images[i];
    if (image) {
      drawPanel(ctx, image, rect, opts.crops?.[i]);
    } else {
      const g = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
      g.addColorStop(0, '#3b1d5e');
      g.addColorStop(1, '#12061f');
      ctx.fillStyle = g;
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
      ctx.strokeStyle = 'rgba(255, 214, 130, 0.5)';
      ctx.lineWidth = 2;
      ctx.strokeRect(rect.x + 1, rect.y + 1, rect.w - 2, rect.h - 2);
    }
  });

  applyColourGrade(ctx, rects, width, height, opts.grade);
  drawSunFlare(ctx, rects, width, height, opts.grade);
  drawHalftone(ctx, rects, width, height);
  drawVignette(ctx, width, height);
  drawFilmGrain(ctx, width, height, opts.seed ?? 7);

  drawRibbon(ctx, ribbon);
  drawCoverLettering(ctx, opts.title, opts.subtitle, ribbon, opts.titleStyle, opts.grade);
  return canvas;
}

// A fresh canvas painted with the same options (used for the PNG export,
// so the preview on screen is never resized for the download).
export function makeCoverCanvas(opts) {
  return drawCover(document.createElement('canvas'), opts);
}
