// components/header.js
export function loadHeader() {
  const container = document.getElementById('header');
  if (!container) return;

  // Keep your exact structure
  container.innerHTML = `
    <header>
      <a href="/"><img src="/img/rvz-wht.svg" alt="Ros Veluz Logo" class="logo"></a>
      <img src="/img/menu.svg" alt="Menu" id="menuToggle" class="menu-icon" />
      <nav id="navMenu" class="hidden" aria-label="Primary"></nav>
    </header>
  `;

  const nav = container.querySelector('#navMenu');
  const params = new URLSearchParams(location.search);
  const activeCat = params.get('c');

  // 1) Load categories from manifest.json
  fetch('/content/manifest.json', { cache: 'no-store' })
    .then(r => r.json())
    .then(manifest => {
      const cats = Array.isArray(manifest.categories) ? manifest.categories : [];

      // Dynamic category links from manifest
      const catLinks = cats.map(c => ({
        label: c.title || c.slug,
        href: `/directory.html?c=${encodeURIComponent(c.slug)}`,
        key: c.slug
      }));

      // Your extra links that you want visible now
      const extra = [
        { label: 'Shop',          href: 'https://shop.rosveluz.com', key: 'shop', external: true },
        { label: 'Contact',       href: '/contact.html',             key: 'contact' }
      ];

      const links = [...catLinks, ...extra];

      nav.innerHTML = links.map(l => {
        const ext = l.external ? ` target="_blank" rel="noopener noreferrer"` : '';
        return `<a href="${l.href}" data-key="${l.key}"${ext}>${l.label}</a>`;
      }).join('');

      // Active state by ?c=
      nav.querySelectorAll('a[data-key]').forEach(a => {
        const key = a.getAttribute('data-key');
        if (activeCat && key === activeCat) a.classList.add('active');
        if (!activeCat && key === 'contact' && location.pathname.endsWith('/contact.html')) {
          a.classList.add('active');
        }
      });
    })
    .catch(() => {
      // Fallback if manifest fails: your three current categories + extra
      const links = [
        { label: 'Non/Media', href: '/directory.html?c=nonMedia', key: 'nonMedia' },
        { label: 'Drawings',                href: '/directory.html?c=drawings', key: 'drawings' },
        { label: 'Surfaces',       href: '/directory.html?c=objects', key: 'objects' },
        { label: 'Words (blog)',  href: '/directory.html?c=words',   key: 'words'   },
        { label: 'Shop',          href: 'https://shop.rosveluz.com', key: 'shop', external: true },
        { label: 'Contact',       href: '/contact.html',             key: 'contact' }
      ];
      nav.innerHTML = links.map(l => {
        const ext = l.external ? ` target="_blank" rel="noopener noreferrer"` : '';
        return `<a href="${l.href}" data-key="${l.key}"${ext}>${l.label}</a>`;
      }).join('');
    });

  // Your existing toggle behavior
  const menuToggle = container.querySelector('#menuToggle');
  menuToggle?.addEventListener('click', () => {
    nav.classList.toggle('hidden');
    nav.classList.toggle('visible');
    const expanded = nav.classList.contains('visible');
    menuToggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  });

  // Close menu on outside click
  document.addEventListener('click', (event) => {
    const currentNav = document.getElementById('navMenu');
    const currentToggle = document.getElementById('menuToggle');
    if (!currentNav || !currentToggle) return;

    const clickedInsideMenu = currentNav.contains(event.target);
    const clickedMenuIcon = currentToggle.contains(event.target);

    if (!clickedInsideMenu && !clickedMenuIcon) {
      currentNav.classList.add('hidden');
      currentNav.classList.remove('visible');
      currentToggle.setAttribute('aria-expanded', 'false');
    }
  });
}
