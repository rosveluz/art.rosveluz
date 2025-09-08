import { getCategory, listItemsByCategory } from './md-api.js';

const params = new URLSearchParams(location.search);
const cat = params.get('c');

const app = document.getElementById('app');
app.innerHTML = `<p class="muted">Loading…</p>`;

// Inject a11y CSS if not present (so we don't need to edit style.css)
function ensureA11yStyles() {
  if (document.getElementById('visually-hidden-style')) return;
  const css = `
  .visually-hidden {
    position: absolute !important;
    width: 1px; height: 1px;
    padding: 0; margin: -1px;
    overflow: hidden; clip: rect(0 0 0 0);
    white-space: nowrap; border: 0;
  }`;
  const style = document.createElement('style');
  style.id = 'visually-hidden-style';
  style.textContent = css;
  document.head.appendChild(style);
}

function setCategoryBackground(category) {
  const bgUrl = category?.bg || category?.cover;
  const host = document.getElementById('imageContainer') || document.body;
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
      ...(i.thumb ? { "image": new URL(i.thumb, location.origin).href } : {}),
      ...(i.summary ? { "description": i.summary } : {}),
      ...(i.date ? { "datePublished": i.date } : {})
    }))
  };
}

function renderCards(items) {
  app.innerHTML = `
    <h1 style="margin:16px 0 12px 0;"></h1>
    <section class="grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px"></section>
  `;
  const grid = app.querySelector('section.grid');

  grid.innerHTML = items.map(i => {
    const itemUrl = `/item.html?c=${encodeURIComponent(i.category)}&s=${encodeURIComponent(i.slug)}`;
    const tagsText = (i.tags || []).join(', ');
    const titleId = `t_${i.slug}`;

    return `
      <article class="card" style="background:#111;border:1px solid #222;border-radius:14px;overflow:hidden">
        ${i.thumb ? `<a href="${itemUrl}">
            <img src="${i.thumb}" alt="${i.title}" style="width:100%;height:160px;object-fit:cover" loading="lazy">
          </a>` : ``}

        <div style="padding:12px">
          <h3 id="${titleId}" style="margin:0 0 6px 0">
            <a href="${itemUrl}" style="text-decoration:none;color:inherit">${i.title}</a>
          </h3>

          <p class="visually-hidden">
            ${i.summary ? `Summary: ${i.summary}. ` : ``}
            ${i.date ? `<time datetime="${i.date}">Published ${i.date}</time>. ` : ``}
            ${tagsText ? `Tags: ${tagsText}.` : ``}
          </p>

          <div style="display:flex;justify-content:flex-end;margin-top:6px">
            <a class="tag" href="${itemUrl}" aria-labelledby="${titleId}"
               style="border:1px solid #333;border-radius:999px;padding:4px 10px;text-decoration:none">Open →</a>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

(async () => {
  try {
    ensureA11yStyles();

    const category = await getCategory(cat);
    if (!category) {
      app.innerHTML = `<p class="muted">Category not found.</p>`;
      return;
    }

    setCategoryBackground(category);
    document.title = `${category.title} – Directory`;

    const items = await listItemsByCategory(cat);
    renderCards(items);
    app.querySelector('h1').textContent = category.title;

    if (!items.length) {
      app.insertAdjacentHTML('beforeend', `<p class="muted">No items found in this category.</p>`);
    }

    injectJsonLd(buildItemListJsonLd(category, items));
  } catch (e) {
    console.error(e);
    app.innerHTML = `<p class="muted">Failed to load directory.</p>`;
  }
})();
