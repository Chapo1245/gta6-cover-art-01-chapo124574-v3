// Fixed scenes for screenshots: ?shot=cover shows the exported cover alone,
// ?shot=editor shows the editor with photos loaded. `variant` picks the look,
// `size` the post size, `caption` the title words, and `export=1` triggers a
// PNG download as well. window.__shotReady is set once the scene is painted.

export async function runShot(shot, query, api) {
  const variant = query.get('variant') ?? 'palmHeist';
  const size = query.get('size') ?? 'landscape';
  const caption = query.get('caption');
  const { state } = api;

  if (shot === 'cover') document.body.classList.add('shot-cover');
  state.size = size;
  await api.applyVariant(variant);
  if (caption) {
    state.title = caption;
    const titleInput = document.getElementById('title');
    if (titleInput) titleInput.value = caption;
  }
  if (query.get('subtitle')) {
    state.subtitle = query.get('subtitle');
  }
  api.draw();

  if (shot === 'editor') {
    const exportButton = document.getElementById('export');
    if (exportButton) exportButton.scrollIntoView({ block: 'center' });
  }

  // Wait for the local Geist faces and two frames so the paint is settled.
  await document.fonts.ready;
  api.draw();
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

  if (query.get('export') === '1') {
    await api.exportPng();
    window.__exportDone = true;
  }
  window.__shotReady = true;
}
