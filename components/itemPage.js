// components/itemPage.js
import { getItem, loadMarkdown, getCategory } from './md-api.js';

/** If your directory page is named differently, change this: */
const DIRECTORY_PAGE = '/directory.html';

/* ---------- utils ---------- */
function stripFrontmatter(md) {
  if (md.startsWith('---')) {
    const end = md.indexOf('\n---', 3);
    if (end !== -1) return md.slice(end + 4).trim();
  }
  return md;
}

function injectItemJsonLd(obj) {
  const id = 'jsonld-item';
  const existing = document.getElementById(id);
  if (existing) existing.remove();
  const s = document.createElement('script');
  s.type = 'application/ld+json';
  s.id = id;
  s.textContent = JSON.stringify(obj);
  document.head.appendChild(s);
}

function buildCreativeWorkJsonLd(item) {
  const obj = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": item.title,
    "url": location.href
  };
  if (item.hero) obj.image = new URL(item.hero, location.origin).href;
  if (item.summary) obj.description = item.summary;
  if (item.date) obj.datePublished = item.date;
  if (Array.isArray(item.tags) && item.tags.length) obj.keywords = item.tags.join(', ');
  obj.isPartOf = `${location.origin}${DIRECTORY_PAGE}?c=${encodeURIComponent(item.category)}`;
  return obj;
}

/* ---------- query params ---------- */
const qs   = new URLSearchParams(location.search);
const slug = qs.get('s');
const cat  = qs.get('c');

/* ---------- elements ---------- */
const titleEl = document.getElementById('itemTitle');
const metaEl  = document.getElementById('itemMeta');
const heroEl  = document.getElementById('hero');
const content = document.getElementById('content');
const back    = document.getElementById('backLink');

/* ---------- main ---------- */
(async () => {
  try {
    // 1) Load item
    const item = await getItem(slug);
    document.title = item.title;
    if (titleEl) titleEl.textContent = item.title;

    // 2) Back link → robust behavior
    const categorySlug = cat || item.category;
    if (back) {
      const fallbackHref = `${DIRECTORY_PAGE}?c=${encodeURIComponent(categorySlug)}`;
      back.href = fallbackHref;

      // Label the link with the category name (e.g., "← Drawings")
      let backLabel = 'Back';
      try {
        const catObj = await getCategory(categorySlug);
        if (catObj?.title) backLabel = catObj.title;
      } catch {/* ignore label errors */}
      back.textContent = `← ${backLabel}`;

      // If user came from a directory page, return to exact state
      back.addEventListener('click', (e) => {
        const ref = document.referrer;
        if (!ref) return; // no referrer, use fallback href
        try {
          const u = new URL(ref, location.origin);
          const sameOrigin = u.origin === location.origin;
          const fromDir = sameOrigin && (
            u.pathname.endsWith('/directory.html') ||
            u.pathname.endsWith('/category.html')
          );
          if (fromDir) {
            e.preventDefault();
            history.back();
          }
        } catch {
          /* if URL parsing fails, silently use fallback */
        }
      });
    }

    // 3) Meta line
    const bits = [];
    if (item.date) bits.push(item.date);
    if (Array.isArray(item.tags) && item.tags.length) bits.push(item.tags.join(' • '));
    if (metaEl) metaEl.textContent = bits.join(' • ');

    // 4) Hero image
    if (item.hero && heroEl) {
      heroEl.style.margin = '12px 0';
      heroEl.style.borderRadius = '12px';
      heroEl.style.overflow = 'hidden';
      heroEl.innerHTML = `<img src="${item.hero}" alt="${item.title}" style="width:100%;height:auto">`;
    }

    // 5) Markdown → HTML (requires marked in item.html)
    const raw = await loadMarkdown(item.md);
    if (content) content.innerHTML = window.marked.parse(stripFrontmatter(raw));

    // 6) Optional: standalone link at top of content
    if (item.standalone && content) {
      content.insertAdjacentHTML(
        'afterbegin',
        `<p><a class="tag" href="${item.standalone}" style="border:1px solid #333;border-radius:999px;padding:4px 10px;text-decoration:none">Open Standalone →</a></p>`
      );
    }

    // 7) SEO
    injectItemJsonLd(buildCreativeWorkJsonLd(item));
  } catch (e) {
    console.error(e);
    document.getElementById('homeWrapper')?.insertAdjacentHTML(
      'beforeend',
      `<p class="muted">Project not found.</p>`
    );
  }
})();
