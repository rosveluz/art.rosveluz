import { getItem, loadMarkdown } from './md-api.js';

// naive frontmatter stripper (keeps body for marked)
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
  if (Array.isArray(item.tags) && item.tags.length) {
    obj.keywords = item.tags.join(', ');
  }
  // Optional relationship to category page:
  obj.isPartOf = `${location.origin}/directory.html?c=${encodeURIComponent(item.category)}`;
  return obj;
}

const qs = new URLSearchParams(location.search);
const slug = qs.get('s');
const cat  = qs.get('c');

const titleEl = document.getElementById('itemTitle');
const metaEl  = document.getElementById('itemMeta');
const heroEl  = document.getElementById('hero');
const content = document.getElementById('content');

(async () => {
  try {
    const item = await getItem(slug);
    document.title = item.title;
    titleEl.textContent = item.title;

    // back link (fallback to item's category if ?c missing)
    const back = document.getElementById('backLink');
    if (back) back.href = `/directory.html?c=${encodeURIComponent(cat || item.category)}`;

    // meta line
    const bits = [];
    if (item.date) bits.push(item.date);
    if (Array.isArray(item.tags) && item.tags.length) bits.push(item.tags.join(' • '));
    metaEl.textContent = bits.join(' • ');

    // hero image
    if (item.hero) {
      heroEl.style.margin = '12px 0';
      heroEl.style.borderRadius = '12px';
      heroEl.style.overflow = 'hidden';
      heroEl.innerHTML = `<img src="${item.hero}" alt="${item.title}" style="width:100%;height:auto">`;
    }

    // markdown → HTML (requires marked in item.html)
    const raw = await loadMarkdown(item.md);
    content.innerHTML = window.marked.parse(stripFrontmatter(raw));

    // optional: standalone link at top of content
    if (item.standalone) {
      content.insertAdjacentHTML('afterbegin',
        `<p><a class="tag" href="${item.standalone}" style="border:1px solid #333;border-radius:999px;padding:4px 10px;text-decoration:none">Open Standalone →</a></p>`);
    }

    injectItemJsonLd(buildCreativeWorkJsonLd(item));
  } catch (e) {
    console.error(e);
    document.getElementById('homeWrapper').insertAdjacentHTML('beforeend',
      `<p class="muted">Project not found.</p>`);
  }
})();
