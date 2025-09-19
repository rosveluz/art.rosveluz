// components/itemPage.js
import { getItem, loadMarkdown, getCategory } from './md-api.js';
import { marked } from 'https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js';

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
  document.getElementById(id)?.remove();
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

/* ---------- tiny path helpers (for co-located images) ---------- */
function dirname(url){ return url.replace(/[^/]+$/, ''); }
function join(base, rel){
  if (/^https?:\/\//.test(rel) || rel.startsWith('/')) return rel;
  return base.replace(/\/+$/,'') + '/' + rel.replace(/^\/+/, '');
}

/* ---------- safety helpers ---------- */
function escapeHTML(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
function parseAttrs(s) {
  const out = {};
  const re = /([a-zA-Z][\w-]*)\s*=\s*"([^"]*)"|([a-zA-Z][\w-]*)/g;
  let m;
  while ((m = re.exec(s))) {
    if (m[1]) out[m[1]] = m[2];
    else if (m[3]) out[m[3]] = true;
  }
  return out;
}

/* ---------- Markdown shortcodes (masonry, row, figure, video, quote, caption, credits) ---------- */
/** We transform our shortcodes into HTML before marked parses the rest.
 *  Paths are resolved relative to the .md file folder.
 */
function applyShortcodes(md, mdDir){
  let out = md;

  // --- Paired blocks first ---
  // [quote cite="..."]...[/quote] OR just [quote]...[/quote]
  out = out.replace(/\[quote(?:\s+([^\]]+))?\]([\s\S]*?)\[\/quote\]/gi, (_, attrStr, inner) => {
    const a = parseAttrs(attrStr || '');
    const text = escapeHTML((inner || '').trim());
    const cite = a.cite ? `<figcaption>— ${escapeHTML(a.cite)}</figcaption>` : '';
    return `<figure class="md-quote"><blockquote>${text}</blockquote>${cite}</figure>`;
  });

  // [caption]...[/caption]
  out = out.replace(/\[caption\]([\s\S]*?)\[\/caption\]/gi, (_, inner) => {
    return `<p class="md-caption">${escapeHTML((inner || '').trim())}</p>`;
  });

  // [credits]...[/credits]
  out = out.replace(/\[credits\]([\s\S]*?)\[\/credits\]/gi, (_, inner) => {
    const html = escapeHTML((inner || '').trim()).replace(/\n/g, '<br>');
    return `<aside class="md-credits">${html}</aside>`;
  });

  // --- Single/self-closing tags ---
  out = out.replace(/\[(masonry|row|figure|video)\s+([^\]]*)\]/gi, (_, tag, attrStr) => {
    const a = parseAttrs(attrStr || '');
    const list = (a.imgs || a.images || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    // Masonry
    if (tag.toLowerCase() === 'masonry') {
      const cols = parseInt(a.cols || a.columns || 0, 10) || 0;
      const gap  = parseInt(a.gap || 0, 10) || 0;
      const imgs = list.map(src =>
        `<img loading="lazy" src="${join(mdDir, src)}" alt="">`
      ).join('');
      const style = gap ? ` style="--m-gap:${gap}px"` : '';
      return `<div class="masonry"${cols?` data-cols="${cols}"`:''}${style}>${imgs}</div>`;
    }

    // Row
    if (tag.toLowerCase() === 'row') {
      const count = list.length || 1;
      const gap  = parseInt(a.gap || 0, 10) || 0;
      const imgs = list.map(src =>
        `<img loading="lazy" src="${join(mdDir, src)}" alt="">`
      ).join('');
      const style = gap ? ` style="--r-gap:${gap}px"` : '';
      return `<div class="row" data-count="${count}"${style}>${imgs}</div>`;
    }

    // Figure
    if (tag.toLowerCase() === 'figure') {
      const src = a.src ? join(mdDir, a.src) : '';
      const cap = a.caption ? `<figcaption>${escapeHTML(a.caption)}</figcaption>` : '';
      if (!src) return '';
      return `<figure class="md-figure"><img loading="lazy" src="${src}" alt="${escapeHTML(a.alt||'')}">${cap}</figure>`;
    }

    // Video
    if (tag.toLowerCase() === 'video') {
      const src    = a.src ? join(mdDir, a.src) : '';
      const poster = a.poster ? ` poster="${join(mdDir, a.poster)}"` : '';
      if (!src) return '';
      const flags = [
        a.controls ? 'controls' : '',
        a.autoplay ? 'autoplay' : '',
        a.loop ? 'loop' : '',
        a.muted ? 'muted' : ''
      ].filter(Boolean).join(' ');
      return `
        <div class="video">
          <video ${flags} playsinline${poster}>
            <source src="${src}" type="video/mp4">
          </video>
        </div>
      `.trim();
    }

    return '';
  });

  // Single-line quote form: [quote text="..." cite="..."]
  out = out.replace(/\[quote\s+([^\]]*?)\]/gi, (_, attrStr) => {
    const a = parseAttrs(attrStr || '');
    if (!a.text) return '';
    const cite = a.cite ? `<figcaption>— ${escapeHTML(a.cite)}</figcaption>` : '';
    return `<figure class="md-quote"><blockquote>${escapeHTML(a.text)}</blockquote>${cite}</figure>`;
  });

  return out;
}

/* ---------- image probe + simple scan (01.jpg, GP-1.png, etc.) ---------- */
function imageExists(url){
  return new Promise((res)=>{
    const img = new Image();
    img.onload = ()=>res(true);
    img.onerror = ()=>res(false);
    img.src = url + (url.includes('?')?'&':'?') + 'v=' + Date.now();
  });
}

async function scanGallery(mdDir, opts = {}){
  const {
    max = 40,
    exts = ['png','jpg','jpeg','webp'],
    prefixes = ['', 'GP-', 'gp-', 'IMG_', 'img_', 'P', 'p']
  } = opts;

  const found = [];
  let misses = 0;
  const pad2 = (n)=>String(n).padStart(2,'0');

  for (let i=1; i<=max; i++){
    let hit = false;

    const stems = new Set();
    stems.add(String(i));
    stems.add(pad2(i));
    for (const p of prefixes){
      stems.add(`${p}${i}`);
      stems.add(`${p}${pad2(i)}`);
    }

    for (const stem of stems){
      for (const ext of exts){
        const url = join(mdDir, `${stem}.${ext}`);
        // eslint-disable-next-line no-await-in-loop
        if (await imageExists(url)) { found.push({ src:url }); hit = true; break; }
      }
      if (hit) break;
    }

    misses = hit ? 0 : (misses + 1);
    if (!hit && i > 3 && misses >= 3) break;
  }

  return found;
}

/* ---------- tiny DOM helper ---------- */
function el(html){
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

/* ---------- lightbox (zoom) ---------- */
function createLightbox(){
  const root = el(`
    <div class="lightbox" role="dialog" aria-label="Image viewer" style="position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.9);display:none;">
      <div class="lightbox__stage" style="position:absolute;inset:0;overflow:hidden;touch-action:none;display:grid;place-items:center;">
        <img class="lightbox__img" alt="" style="max-width:90vw;max-height:90vh;will-change:transform;transform:translate3d(0,0,0) scale(1);">
      </div>
      <div class="lightbox__ui" style="position:absolute;left:0;right:0;bottom:12px;display:flex;gap:8px;justify-content:center;">
        <button class="lightbox__btn" data-zoom="out">−</button>
        <button class="lightbox__btn" data-zoom="in">+</button>
        <button class="lightbox__btn" data-zoom="reset">Reset</button>
        <button class="lightbox__btn" data-close>Close</button>
      </div>
    </div>
  `);
  const stage = root.querySelector('.lightbox__stage');
  const img   = root.querySelector('.lightbox__img');

  let scale=1, minScale=1, maxScale=6;
  let tx=0, ty=0, pointers=new Map(), startDist=0, startScale=1, lastX=0, lastY=0;

  const apply = ()=> img.style.transform = `translate3d(${tx}px,${ty}px,0) scale(${scale})`;
  function clamp(){
    const r = img.getBoundingClientRect(), vw=innerWidth, vh=innerHeight;
    const maxX = Math.max(0,(r.width - vw)/2), maxY = Math.max(0,(r.height - vh)/2);
    tx = Math.min(maxX, Math.max(-maxX, tx));
    ty = Math.min(maxY, Math.max(-maxY, ty));
  }

  stage.addEventListener('pointerdown',(e)=>{
    stage.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    lastX=e.clientX; lastY=e.clientY;
    if(pointers.size===2){
      const[a,b]=[...pointers.values()];
      startDist=Math.hypot(a.x-b.x,a.y-b.y); startScale=scale;
    }
  });
  stage.addEventListener('pointermove',(e)=>{
    if(!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if(pointers.size===2){
      const[a,b]=[...pointers.values()];
      const dist=Math.hypot(a.x-b.x,a.y-b.y);
      const f=dist/(startDist||dist);
      scale=Math.max(minScale,Math.min(maxScale,startScale*f));
      clamp(); apply(); return;
    }
    if(scale>1){
      const dx=e.clientX-lastX, dy=e.clientY-lastY;
      lastX=e.clientX; lastY=e.clientY;
      tx+=dx; ty+=dy; clamp(); apply();
    }
  });
  stage.addEventListener('pointerup',   e=>pointers.delete(e.pointerId));
  stage.addEventListener('pointercancel',e=>pointers.delete(e.pointerId));

  stage.addEventListener('wheel',(e)=>{
    e.preventDefault();
    const d=-Math.sign(e.deltaY)*0.25;
    const prev=scale;
    scale=Math.max(minScale,Math.min(maxScale,scale+d));
    if(scale!==prev){ clamp(); apply(); }
  },{passive:false});

  root.querySelector('[data-zoom="in"]').addEventListener('click', ()=>{ scale=Math.min(maxScale,scale+0.5); clamp(); apply(); });
  root.querySelector('[data-zoom="out"]').addEventListener('click',()=>{ scale=Math.max(minScale,scale-0.5); clamp(); apply(); });
  root.querySelector('[data-zoom="reset"]').addEventListener('click',()=>{ scale=1; tx=0; ty=0; apply(); });
  root.querySelector('[data-close]').addEventListener('click', ()=> root.style.display='none');
  addEventListener('keydown', (e)=>{ if(e.key==='Escape') root.style.display='none'; });

  return {
    root,
    open(src, alt=''){ img.src=src; img.alt=alt; scale=1; tx=0; ty=0; apply(); root.style.display='block'; }
  };
}

/* ---------- simple slider on #hero ---------- */
function renderGallery(host, gallery, heroSrc){
  host.className = 'gallery';
  host.innerHTML = `
    <div class="gal-track" style="display:flex;height:100%;transition:transform .3s ease;will-change:transform;"></div>
    <button class="gal-nav prev" aria-label="Previous" style="position:absolute;top:50%;transform:translateY(-50%);left:8px">‹</button>
    <button class="gal-nav next" aria-label="Next" style="position:absolute;top:50%;transform:translateY(-50%);right:8px">›</button>
    <div class="gal-dots" style="position:absolute;left:0;right:0;bottom:8px;display:flex;gap:8px;justify-content:center;"></div>
    <button class="gal-zoom" aria-label="Open zoom" style="position:absolute;top:8px;right:8px">🔍</button>
  `;
  host.style.position = 'relative';
  host.style.width = '100%';
  host.style.borderRadius = '14px';
  host.style.overflow = 'hidden';
  host.style.background = '#111';
  host.style.minHeight = '320px';

  const track  = host.querySelector('.gal-track');
  const dots   = host.querySelector('.gal-dots');
  const prev   = host.querySelector('.gal-nav.prev');
  const next   = host.querySelector('.gal-nav.next');
  const zoom   = host.querySelector('.gal-zoom');

  const imgs = (gallery && gallery.length) ? gallery : (heroSrc ? [{src:heroSrc}] : []);
  track.innerHTML = imgs.map(g=>`
    <div class="gal-slide" style="min-width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#000">
      <img src="${g.src}" alt="${g.alt||''}" style="width:100%;height:100%;object-fit:cover;display:block">
    </div>
  `).join('');
  dots.innerHTML  = imgs.map((_,i)=>`<button class="gal-dot" aria-label="Go to ${i+1}" style="width:8px;height:8px;border-radius:50%;border:1px solid rgba(255,255,255,.5);background:rgba(255,255,255,.35)"></button>`).join('');

  const slides = Array.from(track.children);
  const dotEls = Array.from(dots.children);
  let idx = 0;

  const first = slides[0]?.querySelector('img');
  first?.addEventListener('load', ()=>{
    if(first.naturalWidth && first.naturalHeight){
      host.style.aspectRatio = (first.naturalWidth/first.naturalHeight).toFixed(4);
      host.style.minHeight = '0';
    }
  }, { once:true });

  const go = (n) => {
    idx = (n + slides.length) % slides.length;
    track.style.transform = `translateX(${-idx * 100}%)`;
    dotEls.forEach((d, i) => {
      d.style.background = (i === idx) ? '#fff' : 'rgba(255,255,255,.35)';
    });
  };

  go(0);

  prev.addEventListener('click', ()=>go(idx-1));
  next.addEventListener('click', ()=>go(idx+1));
  dotEls.forEach((d,i)=>d.addEventListener('click', ()=>go(i)));

  // swipe
  let sx=0, cx=0, dragging=false;
  host.addEventListener('touchstart', e=>{ dragging=true; sx=e.touches[0].clientX; }, {passive:true});
  host.addEventListener('touchmove',  e=>{ if(dragging) cx=e.touches[0].clientX; }, {passive:true});
  host.addEventListener('touchend',   ()=>{ if(!dragging) return; const dx=cx-sx; if(dx<-50) go(idx+1); if(dx>50) go(idx-1); dragging=false; });

  // lightbox
  const lb = createLightbox();
  document.body.appendChild(lb.root);
  const openZoom = ()=> imgs[idx] && lb.open(imgs[idx].src, imgs[idx].alt||'');
  zoom.addEventListener('click', openZoom);
  slides.forEach(s=>s.addEventListener('click', openZoom));
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
      } catch {}
      back.textContent = `← ${backLabel}`;

      back.addEventListener('click', (e) => {
        const ref = document.referrer;
        if (!ref) return;
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
        } catch {}
      });
    }

    // 3) Hero/Gallery first
    const mdDir = dirname(item.md);
    let heroSrc = item.hero || join(mdDir, 'hero.jpg');
    if (!(await imageExists(heroSrc))) heroSrc = '';
    const gallery = await scanGallery(mdDir);

    if ((heroSrc || gallery.length) && heroEl) {
      renderGallery(heroEl, gallery, heroSrc);
    } else if (item.hero && heroEl) {
      heroEl.style.margin = '12px 0';
      heroEl.style.borderRadius = '12px';
      heroEl.style.overflow = 'hidden';
      heroEl.innerHTML = `<img src="${item.hero}" alt="${item.title}" style="width:100%;height:auto">`;
    }

    // 4) Markdown → HTML with shortcode pass
    const raw = await loadMarkdown(item.md);
    const bodyOnly = stripFrontmatter(raw);
    const withShortcodes = applyShortcodes(bodyOnly, mdDir);
    const html = (marked && typeof marked.parse === 'function') ? marked.parse(withShortcodes) : withShortcodes;
    if (content) content.innerHTML = html;

    // 5) Meta line
    const bits = [];
    if (item.date) bits.push(item.date);
    if (Array.isArray(item.tags) && item.tags.length) bits.push(item.tags.join(' • '));
    if (metaEl) metaEl.textContent = bits.join(' • ');

    // 6) SEO JSON-LD
    injectItemJsonLd(buildCreativeWorkJsonLd(item));
  } catch (e) {
    console.error(e);
    document.getElementById('homeWrapper')?.insertAdjacentHTML(
      'beforeend',
      `<p class="muted">Project not found.</p>`
    );
  }
})();
