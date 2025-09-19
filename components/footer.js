// components/footer.js
export function loadFooter() {
  const el = document.getElementById('footer');
  if (!el) return;
  const year = new Date().getFullYear();
  el.classList.add('site-footer');
  el.innerHTML = `
    <div class="footer__inner">
      <div class="footer__brand">
        <div class="small muted">© ${year} Ros Veluz</div>
      </div>
      <div class="footer__actions">
        <a class="footerText" href="/catalog.pdf" download>Download catalog</a>
      </div>
    </div>
  `;
}
