// components/directory-page.js
import { getCategory, listItemsByCategory } from './md-api.js';
import { renderCards } from './directoryCard.js';

const params = new URLSearchParams(location.search);
const cat = params.get('c');

const app = document.getElementById('app');
app.innerHTML = `<p class="muted">Loading…</p>`;

function setCategoryBackground(category) {
  const bgUrl = category?.bg || category?.cover;
  const host  = document.getElementById('imageContainer') || document.body;
  if (!bgUrl) { host.style.backgroundImage = ''; return; }

  const img = new Image();
  img.onload = () => {
    host.style.backgroundImage =
      `linear-gradient(rgba(0,0,0,.45), rgba(0,0,0,.45)), url('${bgUrl}')`;
    host.style.backgroundSize = 'cover';
    host.style.backgroundPosition = 'center';
    host.style.backgroundRepeat = 'no-repeat';
    host.style.transition = 'background-image .35s ease';
  };
  img.onerror = () => { host.style.backgroundImage = ''; };
  img.src = bgUrl;
}

function injectJsonLd(obj) {
  const id = 'jsonld-itemlist';
  const existing = document.getElementById(id);
  if (existing) existing.remove();
  const s = document.createElement('script');
  s.type = 'application/ld+json';
  s.id = id;
  s.textContent = JSON.stringify(obj);
  document.head.appendChild(s);
}

function buildItemListJsonLd(category, items) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `${category.title} — Portfolio`,
    "itemListElement": items.map((i, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "url": `${location.origin}/item.html?c=${encodeURIComponent(i.category)}&s=${encodeURIComponent(i.slug)}`,
      "name": i.title,
      ...(i.thumb   ? { "image": new URL(i.thumb, location.origin).href } : {}),
      ...(i.summary ? { "description": i.summary } : {}),
      ...(i.date    ? { "datePublished": i.date } : {})
    }))
  };
}

// Optional: wire up analytics here (you can replace console.log with gtag/plausible)
function onCardClick(item, index /*, event */) {
  console.log('[analytics] card_click', { slug: item.slug, index, category: item.category });
  // Example GA4:
  // gtag('event', 'select_content', { content_type: 'portfolio_card', item_id: item.slug, index });
}
function onCardView(item, index /*, entry */) {
  console.log('[analytics] card_view', { slug: item.slug, index, category: item.category });
  // Example Plausible:
  // plausible('Card View', { props: { slug: item.slug, category: item.category }});
}

(async () => {
  try {
    const category = await getCategory(cat);
    if (!category) {
      app.innerHTML = `<p class="muted">Category not found.</p>`;
      return;
    }

    // Background + tab title (no H1 injected on page)
    setCategoryBackground(category);
    document.title = `${category.title} — Directory`;

    const items = await listItemsByCategory(cat);

    // Render via shared directoryCard with a11y + analytics hooks
    renderCards(app, items, {
      ariaLabel: category.title,
      clickWholeCard: true,
      onCardClick,
      onCardView
    });

    if (!items.length) {
      app.insertAdjacentHTML('beforeend',
        `<p class="muted">No items found in this category.</p>`);
    }

    injectJsonLd(buildItemListJsonLd(category, items));
  } catch (e) {
    console.error(e);
    app.innerHTML = `<p class="muted">Failed to load directory.</p>`;
  }
})();
