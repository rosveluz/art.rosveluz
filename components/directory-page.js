// directory-page.js
import { getCategory, listItemsByCategory } from './md-api.js';
import { renderCards } from './directoryCard.js';

const params = new URLSearchParams(location.search);
const cat = params.get('c');

// If this file accidentally runs on other pages, just do nothing.
const app = document.getElementById('app');
if (!app || !cat) {
  console.debug('[directory-page] Not on directory.html or missing ?c=; skipping.');
} else {
  // Minimal shell (keep your layout)
  app.innerHTML = `<section id="dirGrid"></section>`;
  const gridEl = document.getElementById('dirGrid');

  function applyCategoryBackground(category) {
    const host = document.getElementById('imageContainer') || document.body;
    const url = category?.bg || category?.cover;
    if (!url) return;
    host.style.backgroundImage = `url('${url}')`;
    host.style.backgroundSize = 'cover';
    host.style.backgroundPosition = 'center';
    host.style.backgroundRepeat = 'no-repeat';
    host.style.transition = 'background-image 0.4s ease-in-out';
  }

  // Check if a URL exists (GET used because some hosts don’t allow HEAD for static md)
  async function urlExists(url) {
    try {
      const r = await fetch(url, { cache: 'no-store' });
      return r.ok;
    } catch {
      return false;
    }
  }

  // Keep only items that are “ready”: md exists, not draft
  async function filterReady(items) {
    const checked = await Promise.all(items.map(async (i) => {
      if (i.draft === true || i.published === false) return null;
      if (!i.md) return null;
      const ok = await urlExists(i.md);
      return ok ? i : null;
    }));
    return checked.filter(Boolean);
  }

  (async () => {
    try {
      const category = await getCategory(cat);
      if (!category) {
        app.innerHTML = `<p class="muted">Category not found.</p>`;
        return;
      }

      // Category-specific background
      applyCategoryBackground(category);

      // List items for this category, but only those whose .md exists
      const rawItems = await listItemsByCategory(cat);
      const items = await filterReady(rawItems);

      if (!items.length) {
        app.innerHTML = `<p class="muted">No projects yet.</p>`;
        return;
      }

      renderCards(gridEl, items);
    } catch (e) {
      console.error(e);
      app.innerHTML = `<p class="muted">Failed to load directory.</p>`;
    }
  })();
}
