// Draws the cover: several photo panels in a comic-book grid, a sunset or neon
// colour grade, and big bold caption lettering. Every title is invented;
// nothing here copies Rockstar artwork, logos or fonts. Fonts are the local
// OFL Geist files under app/fonts/ (see OFL.txt).

import { GRADES, LAYOUTS, TITLE_STYLES } from './presets.js';

/** A tiny seeded random so the film grain is the same on every export. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Draws one photo into `rect`, cover-fit, honouring its crop and zoom. */
export function drawPanelPhoto(ctx, photo, rect, crop) {
  const { x, y, w, h } = rect;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  if (!photo) {
    drawPhotoPlaceholder(ctx, rect);
    ctx.restore();
    return;
  }
  const zoom = crop?.zoom ?? 1;
  const scale = Math.max(w / photo.naturalWidth, h / photo.naturalHeight) * zoom;
  const pw = photo.naturalWidth * scale;
  const ph = photo.naturalHeight * scale;
  const cx = crop?.cx ?? 0.5;
  const cy = crop?.cy ?? 0.5;
  const dx = x + w / 2 - pw * cx;
  const dy = y + h / 2 - ph * cy;
  ctx.drawImage(photo, dx, dy, pw, ph);
  ctx.restore();
}

/** A gradient placeholder panel for a photo slot with no photo yet. */
export function drawPhotoPlaceholder(ctx, rect) {
  const { x, y, w, h } = rect;
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, '#3a1c5c');
  g.addColorStop(0.55, '#c2337f');
  g.addColorStop(1, '#ff8a3d');
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = 'rgba(255, 236, 190, 0.9)';
  ctx.beginPath();
  ctx.arc(x + w * 0.72, y + h * 0.3, Math.min(w, h) * 0.16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
  ctx.font = `700 ${Math.max(14, h * 0.05)}px Geist, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('ADD A PHOTO', x + w / 2, y + h * 0.62);
}

/** Washes the whole cover in the grade's sunset or neon colours. */
export function applyColourGrade(ctx, w, h, grade) {
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, grade.skyTop);
  sky.addColorStop(1, grade.skyBottom);
  ctx.save();
  ctx.globalCompositeOperation = grade.washBlend;
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = grade.wash;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

/** A warm radial sun flare in the upper sky of the cover. */
export function drawSunFlare(ctx, w, h, grade) {
  const fx = w * 0.78;
  const fy = h * 0.2;
  const r = Math.min(w, h) * 0.55;
  const flare = ctx.createRadialGradient(fx, fy, 0, fx, fy, r);
  flare.addColorStop(0, 'rgba(255, 240, 200, 0.5)');
  flare.addColorStop(0.35, grade.glow + '55');
  flare.addColorStop(1, 'rgba(255, 240, 200, 0)');
  ctx.save();
  ctx.fillStyle = flare;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

/** Comic halftone dots along the bottom edge, like a printed poster. */
export function drawHalftone(ctx, w, h, strength) {
  const dot = Math.max(3, w * 0.004);
  const gap = dot * 2.6;
  ctx.save();
  ctx.fillStyle = `rgba(10, 4, 20, ${0.16 * strength})`;
  for (let yy = h * 0.86; yy < h; yy += gap) {
    const row = (yy - h * 0.86) / gap;
    for (let xx = gap / 2 + (row % 2) * gap / 2; xx < w; xx += gap) {
      ctx.beginPath();
      ctx.arc(xx, yy, dot * (0.5 + row * 0.12), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

/** Darkens the corners so the middle of the cover pops. */
export function drawVignette(ctx, w, h) {
  const v = ctx.createRadialGradient(
    w / 2, h / 2, Math.min(w, h) * 0.42,
    w / 2, h / 2, Math.max(w, h) * 0.75,
  );
  v.addColorStop(0, 'rgba(8, 2, 16, 0)');
  v.addColorStop(1, 'rgba(8, 2, 16, 0.42)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, w, h);
}

/** Sparse film grain over the whole cover. */
export function drawFilmGrain(ctx, w, h, seed) {
  const rand = mulberry32(seed);
  const count = Math.floor((w * h) / 900);
  ctx.save();
  for (let i = 0; i < count; i++) {
    const a = rand() * 0.09;
    ctx.fillStyle = rand() > 0.5 ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a})`;
    ctx.fillRect(rand() * w, rand() * h, 1.6, 1.6);
  }
  ctx.restore();
}

/** Shrinks `size` until `text` fits `maxWidth` at the condensed scale. */
export function fitCaption(ctx, text, size, maxWidth, family) {
  let s = size;
  ctx.save();
  ctx.scale(0.8, 1);
  while (s > 12) {
    ctx.font = `700 ${s}px ${family}`;
    if (ctx.measureText(text).width * 0.8 <= maxWidth) break;
    s -= 2;
  }
  ctx.restore();
  return s;
}

/** The full cover: panels, grade, effects, then the lettering on top. */
export function drawCover(canvas, photos, state) {
  const ctx = canvas.getContext('2d');
  const { width: w, height: h } = canvas;
  const layout = LAYOUTS[state.layout] ?? LAYOUTS.heroDuo;
  const grade = GRADES[state.grade] ?? GRADES.neon;
  const style = TITLE_STYLES[state.titleStyle] ?? TITLE_STYLES.outline;

  ctx.fillStyle = '#160a24';
  ctx.fillRect(0, 0, w, h);

  // Photo panels, with gutters between them like a comic page.
  const gutter = Math.max(4, w * 0.006);
  layout.panels.forEach((panel, i) => {
    const rect = {
      x: panel.x * w + (i === 0 ? 0 : gutter / 2),
      y: panel.y * h + (i === 0 ? 0 : gutter / 2),
      w: panel.w * w - gutter,
      h: panel.h * h - gutter,
    };
    if (layout.id === 'poster' && i > 0) {
      // Small strips float on the hero: white frame, slight shadow.
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.55)';
      ctx.shadowBlur = w * 0.02;
      ctx.shadowOffsetY = h * 0.008;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(rect.x - gutter, rect.y - gutter, rect.w + gutter * 2, rect.h + gutter * 2);
      ctx.restore();
    }
    drawPanelPhoto(ctx, photos[i] ?? null, rect, state.crops?.[i]);
    ctx.strokeStyle = 'rgba(12, 4, 22, 0.9)';
    ctx.lineWidth = gutter;
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
  });

  applyColourGrade(ctx, w, h, grade);
  if (state.grade === 'sunset' || state.grade === 'golden') drawSunFlare(ctx, w, h, grade);
  drawHalftone(ctx, w, h, state.halftone ?? 1);
  drawVignette(ctx, w, h);
  drawFilmGrain(ctx, w, h, state.seed ?? 7);

  drawCoverLettering(ctx, layout, state, grade, style, w, h);
}

/** Title block: ribbon or block behind it, subtitle, title, tagline. */
export function drawCoverLettering(ctx, layout, state, grade, style, w, h) {
  const zone = layout.titleZone;
  const family = 'Geist, "Arial Narrow", sans-serif';
  const title = (state.title || '').trim().toUpperCase();
  const subtitle = (state.subtitle || '').trim().toUpperCase();
  const tagline = (state.tagline || '').trim().toUpperCase();
  const maxWidth = zone.w * w;
  const baseY = zone.y * h;

  let size = h * 0.11;
  if (layout.id === 'triptych') size = Math.max(h * 0.085, w * 0.055);
  if (h > w) size = w * 0.16;
  ctx.save();
  ctx.font = `700 ${size}px ${family}`;
  size = fitCaption(ctx, title, size, maxWidth, family);

  const titleHeight = size * 0.95;
  const subSize = Math.max(16, size * 0.24);
  const tagSize = Math.max(13, size * 0.17);
  const blockH = titleHeight + subSize * 1.6 + tagSize * 2.1;

  // Ribbon or block behind the lettering.
  if (zone.ribbon) {
    ctx.save();
    ctx.translate(w / 2, baseY + blockH / 2);
    ctx.rotate(-0.045);
    ctx.fillStyle = 'rgba(10, 3, 18, 0.82)';
    ctx.fillRect(-maxWidth / 2 - w * 0.02, -blockH / 2, maxWidth + w * 0.04, blockH);
    ctx.fillStyle = grade.accent;
    ctx.fillRect(-maxWidth / 2 - w * 0.02, -blockH / 2, maxWidth + w * 0.04, Math.max(4, h * 0.006));
    ctx.fillRect(-maxWidth / 2 - w * 0.02, blockH / 2 - Math.max(4, h * 0.006), maxWidth + w * 0.04, Math.max(4, h * 0.006));
    ctx.restore();
  } else if (zone.block) {
    const grad = ctx.createLinearGradient(0, baseY, 0, baseY + blockH);
    grad.addColorStop(0, 'rgba(10, 3, 18, 0)');
    grad.addColorStop(0.25, 'rgba(10, 3, 18, 0.88)');
    grad.addColorStop(1, 'rgba(10, 3, 18, 0.92)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, baseY - subSize, w, blockH + subSize);
  } else {
    const grad = ctx.createLinearGradient(0, baseY - subSize * 1.4, 0, h);
    grad.addColorStop(0, 'rgba(10, 3, 18, 0)');
    grad.addColorStop(1, 'rgba(10, 3, 18, 0.85)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, baseY - subSize * 1.4, w, h - baseY + subSize * 1.4);
  }

  const alignX = zone.align === 'center' ? w / 2 : zone.x * w;
  const textAlign = zone.align === 'center' ? 'center' : 'left';
  let cursorY = baseY + subSize * 1.1;

  // Subtitle: small letterspaced caps in the grade's accent colour.
  if (subtitle) {
    ctx.font = `500 ${subSize}px ${family}`;
    try { ctx.letterSpacing = `${Math.max(3, subSize * 0.28)}px`; } catch { /* older canvas */ }
    ctx.textAlign = textAlign;
    ctx.fillStyle = grade.accent;
    ctx.fillText(subtitle, alignX, cursorY);
    try { ctx.letterSpacing = '0px'; } catch { /* older canvas */ }
    cursorY += subSize * 0.9;
  }

  // Title: condensed (horizontal squeeze), in the chosen treatment.
  if (title) {
    ctx.textAlign = textAlign;
    ctx.save();
    const originX = textAlign === 'center' ? w / 2 : zone.x * w;
    ctx.translate(originX, 0);
    ctx.scale(0.8, 1);
    const tx = textAlign === 'center' ? 0 : (zone.x * w) / 0.8;
    const ty = cursorY + titleHeight * 0.82;
    ctx.font = `700 ${size}px ${family}`;
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    if (style.id === 'gradient') {
      const tg = ctx.createLinearGradient(0, ty - titleHeight, 0, ty);
      tg.addColorStop(0, '#ffffff');
      tg.addColorStop(0.55, grade.titleFill);
      tg.addColorStop(1, grade.accent);
      ctx.lineWidth = size * 0.045;
      ctx.strokeStyle = grade.titleStroke;
      ctx.strokeText(title, tx, ty);
      ctx.fillStyle = tg;
      ctx.shadowColor = 'rgba(0,0,0,0.45)';
      ctx.shadowBlur = size * 0.12;
      ctx.shadowOffsetY = size * 0.03;
      ctx.fillText(title, tx, ty);
    } else if (style.id === 'stack') {
      ctx.lineWidth = size * 0.07;
      ctx.strokeStyle = grade.titleStroke;
      ctx.fillStyle = grade.accent;
      ctx.shadowColor = grade.glow;
      ctx.shadowBlur = size * 0.28;
      ctx.fillText(title, tx + size * 0.045, ty + size * 0.045);
      ctx.fillText(title, tx + size * 0.025, ty + size * 0.025);
      ctx.shadowBlur = 0;
      ctx.strokeText(title, tx, ty);
      ctx.fillStyle = grade.titleFill;
      ctx.fillText(title, tx, ty);
    } else {
      ctx.lineWidth = size * 0.085;
      ctx.strokeStyle = grade.titleStroke;
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = size * 0.14;
      ctx.shadowOffsetY = size * 0.035;
      ctx.strokeText(title, tx, ty);
      ctx.fillStyle = grade.titleFill;
      ctx.fillText(title, tx, ty);
    }
    ctx.restore();
    cursorY += titleHeight * 1.02;
  }

  // Tagline: small caps under the title.
  if (tagline) {
    ctx.font = `500 ${tagSize}px ${family}`;
    try { ctx.letterSpacing = `${Math.max(2, tagSize * 0.22)}px`; } catch { /* older canvas */ }
    ctx.textAlign = textAlign;
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.fillText(tagline, alignX, cursorY + tagSize * 0.5);
    try { ctx.letterSpacing = '0px'; } catch { /* older canvas */ }
  }
  ctx.restore();
}
