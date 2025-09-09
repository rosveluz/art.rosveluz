// components/directoryCard.js
// Minimal cards with a11y + analytics hooks.
// Uses CSS for grid; adds a tiny JS fallback if the .grid rule is missing/overridden.

export function renderCards(target, items, opts = {}) {
  const {
    ariaLabel = 'Projects',
    clickWholeCard = true,
    onCardClick = () => {},
    onCardView  = () => {},
    observeOnce = true
  } = opts;

  // Rely on CSS .grid for layout
  target.innerHTML = `<section class="grid" aria-label="${ariaLabel}"></section>`;
  const grid = target.querySelector('section.grid');

  grid.innerHTML = items.map((i) => {
    const itemUrl  = `/item.html?c=${encodeURIComponent(i.category)}&s=${encodeURIComponent(i.slug)}`;
    const tagsText = (i.tags || []).join(', ');
    const titleId  = `t_${i.slug}`;

    return `
      <article class="card ${clickWholeCard ? 'card--clickable' : ''}"
               ${clickWholeCard ? `role="link" tabindex="0" data-href="${itemUrl}" aria-labelledby="${titleId}"` : ''}
               style="background:#111; border-radius:14px;overflow:hidden;display:flex;flex-direction:column;height:100%;">
        ${i.thumb ? `
          <a class="card__imageLink" href="${itemUrl}"
             aria-hidden="${clickWholeCard ? 'true' : 'false'}"
             tabindex="${clickWholeCard ? '-1' : '0'}">
            <img class="card__image" src="${i.thumb}" alt="${i.title}"
                 loading="lazy">
          </a>` : ``}

        <div class="pad" style="padding:12px;display:flex;flex-direction:column;gap:8px;">
          <h3 id="${titleId}" class="card__title">
            ${clickWholeCard
              ? `<span>${i.title}</span>`
              : `<a class="card__titleLink" href="${itemUrl}">${i.title}</a>`}
          </h3>

          <!-- hidden meta for a11y/SEO -->
          <p class="visually-hidden">
            ${i.summary ? `Summary: ${i.summary}. ` : ``}
            ${i.date ? `<time datetime="${i.date}">Published ${i.date}</time>. ` : ``}
            ${tagsText ? `Tags: ${tagsText}.` : ``}
          </p>

          <div class="card__actions">
            <a class="tag card__button" href="${itemUrl}" aria-labelledby="${titleId}">Open →</a>
          </div>
        </div>
      </article>
    `;
  }).join('');

  // --- JS fallback if .grid CSS isn't applied (rare, but safe) ---
  try {
    const cs = getComputedStyle(grid);
    if (cs.display !== 'grid') {
      grid.style.display = 'grid';
      grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(260px, 1fr))';
      grid.style.gap = '16px';
      grid.style.alignItems = 'start';
    }
  } catch {}

  // Whole-card click + keyboard support
  if (clickWholeCard) {
    grid.querySelectorAll('.card--clickable').forEach((card, idx) => {
      const href = card.getAttribute('data-href');
      card.addEventListener('click', (e) => {
        if (e.target.closest('a')) return;
        onCardClick(items[idx], idx, e);
        location.href = href;
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onCardClick(items[idx], idx, e);
          location.href = href;
        }
      });
      card.style.cursor = 'pointer';
      card.style.transition = 'transform .15s ease, box-shadow .15s ease, border-color .15s ease';
    });
  } else {
    grid.querySelectorAll('.card .card__button').forEach((btn, idx) => {
      btn.addEventListener('click', (e) => onCardClick(items[idx], idx, e));
    });
  }

  // View tracking
  try {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el  = entry.target;
          const idx = Number(el.getAttribute('data-index'));
          onCardView(items[idx], idx, entry);
          if (observeOnce) obs.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    grid.querySelectorAll('.card').forEach((el, idx) => {
      el.setAttribute('data-index', String(idx));
      io.observe(el);
    });
  } catch {
    items.forEach((item, idx) => onCardView(item, idx, null));
  }
}
