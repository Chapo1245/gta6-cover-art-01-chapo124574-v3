// Fixed scenes for screenshots: ?shot=cover shows the cover alone, ?shot=editor
// shows the page with a sample photo loaded. Query parameters pick the variant,
// the size and the caption, so every screenshot is a scene the app itself draws.
// window.__shotReady is set once painted (and after an export, if asked for).
//   ?shot=cover&variant=neonTide&size=landscape
//   ?shot=cover&variant=palmHeist&size=portrait&export=1
//   ?shot=editor&variant=boulevardNights

/** Waits for the app's fonts, then flags the scene ready after two frames. */
export function markShotReady() {
  const done = () => requestAnimationFrame(() => requestAnimationFrame(() => {
    window.__shotReady = true;
  }));
  if (document.fonts?.ready) document.fonts.ready.then(done).catch(done);
  else done();
}

/** Runs one screenshot scene against the editor API main.js passes in. */
export async function runShot(shot, query, api) {
  const variant = query.get('variant') ?? 'neonTide';
  const size = query.get('size');
  if (size) api.state.size = size;
  const title = query.get('title');
  const subtitle = query.get('subtitle');
  const tagline = query.get('tagline');

  await api.applyVariant(variant);
  if (title !== null) api.state.title = title;
  if (subtitle !== null) api.state.subtitle = subtitle;
  if (tagline !== null) api.state.tagline = tagline;
  api.redrawCover();

  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
    api.redrawCover();
    if (query.get('export') === '1') {
      api.exportCoverPng();
      // Give the download a moment to start before flagging ready.
      await new Promise((resolve) => setTimeout(resolve, 700));
    }
  } else if (shot === 'editor') {
    // Scroll so the export controls are visible; the preview is sticky and
    // stays on screen, so the shot still shows the app with a photo loaded.
    window.scrollTo(0, document.body.scrollHeight);
  }
  markShotReady();
}
