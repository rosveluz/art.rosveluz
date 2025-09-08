// components/header.js
export function loadHeader() {
    document.getElementById('header').innerHTML = `
      <header>
        <a href="/"><img src="/img/rvz-wht.svg" alt="Ros Veluz Logo" class="logo"></a>

        <!-- SVG Menu Icon -->
        <img src="/img/menu.svg" alt="Menu" id="menuToggle" class="menu-icon" />

        <!-- Navigation Menu -->
        <nav id="navMenu" class="hidden">
            <a href="">Non/Media</a>
            <a href="">Drawings</a>
            <a href="">Objects</a>
            <a href="">Instruments</a>
            <a href="#">Words</a>
            <a href="www.rosveluz.com">Contact</a>
        </nav>
      </header>
    `;

    // JS for toggling menu visibility
    document.getElementById('menuToggle').addEventListener('click', () => {
      document.getElementById('navMenu').classList.toggle('hidden');
      document.getElementById('navMenu').classList.toggle('visible');
    });
}

document.addEventListener('click', (event) => {
  const navMenu = document.getElementById('navMenu');
  const menuToggle = document.getElementById('menuToggle');

  const clickedInsideMenu = navMenu.contains(event.target);
  const clickedMenuIcon = menuToggle.contains(event.target);

  if (!clickedInsideMenu && !clickedMenuIcon) {
    navMenu.classList.add('hidden');
    navMenu.classList.remove('visible');
  }
});
