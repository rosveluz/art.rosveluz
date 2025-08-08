export default class InfoModal {
  /**
   * @param {HTMLElement} parent - Element to append the modal into
   * @param {Object} options
   * @param {Function} options.onClose - Callback when modal is hidden
   * @param {string} [options.content] - HTML string for modal body
   */
  constructor(parent, { onClose, content }) {
    this.parent = parent;
    this.onClose = onClose;

    // Default content (HTML-safe, correct IDs, and closed tags)
    this.content = content || `
      <p>
        This non-commercial artwork lets you input any date to generate a step-based audio tour.
        We don't send your input to a server; it stays in your browser. By starting, you consent to this processing.
        Learn more in <a href="#privnotice">our Privacy Notice.</a>
      </p>

      <section id="credits" aria-labelledby="credits-heading">
        <h2 id="credits-heading">Credits and Sources</h2>
        <p><strong>First United Building Corporation</strong></p>
        <ul>
          <li>“History — First United Building.” firstunitedbuilding.com. (Accessed: August 6, 2025).</li>
          <li>“History — First United Building Historical Timeline” 413 Escolta St, Binondo, Manila, 1006 Metro Manila (Accessed: August 6, 2025).</li>
          <li>“First United Building.” Wikipedia. (Accessed: August 6, 2025). Licensed under CC BY-SA 4.0. Changes were made (paraphrase/curation).</li>
        </ul>
        <p>
          Historical Narration, Summary of Literature: ChatGPT-4o<br>
          Voice Narration: <a href="https://elevenlabs.io/" target="_blank" rel="noopener">elevenlabs.io</a>
        </p>
      </section>

      <article id="privnotice" lang="en" aria-labelledby="privacy-notice-title">
        <h1 id="privacy-notice-title">Privacy Notice</h1>

        <section id="who-we-are">
          <p><strong>Effective date:</strong> August 9, 2025</p>
          <p><strong>Who we are:</strong> Rosauro Veluz (Artist, Web Developer)</p>
          <p><strong>Contact / DPO:</strong> <a href="mailto:hello@rosveluz.com">hello@rosveluz.com</a></p>
        </section>

        <section id="what-we-collect">
          <h2>What we collect</h2>
          <ul>
            <li><strong>Date you enter (optional).</strong> You may enter your birthdate or any date. It is used only as a seed to algorithmically generate a step count that drives the audio tour.</li>
            <li><strong>Basic technical logs (hosting).</strong> Our hosting/CDN may receive routine server logs (e.g., IP address, user-agent, timestamps) for security and uptime.</li>
          </ul>
          <p>
            Unless stated otherwise, the entered date is processed locally in your browser and is not sent to our servers.
            Logs are handled by our host as part of normal web operations. See guidance from the
            <a href="https://privacy.gov.ph/day-to-day/" target="_blank" rel="noopener">National Privacy Commission</a>.
          </p>
        </section>

        <section id="lawful-basis">
          <h2>Lawful basis (RA 10173)</h2>
          <ul>
            <li>
              <strong>Consent (Sec. 12[a]).</strong> By clicking <em>Start</em> and entering a date, you consent to the specific processing needed for the artwork.
              You can opt not to enter a real birthdate. References:
              <a href="https://privacy.gov.ph/day-to-day/" target="_blank" rel="noopener">NPC</a>,
              <a href="https://lawphil.net/statutes/repacts/ra2012/ra_10173_2012.html" target="_blank" rel="noopener">Data Privacy Act of 2012</a>.
            </li>
            <li>
              <strong>Legitimate interests (security) (Sec. 12[f]).</strong> Hosts may process minimal log data to keep the service secure and available. References:
              <a href="https://privacy.gov.ph/day-to-day/" target="_blank" rel="noopener">NPC</a>,
              <a href="https://lawphil.net/statutes/repacts/ra2012/ra_10173_2012.html" target="_blank" rel="noopener">RA 10173</a>.
            </li>
          </ul>
        </section>

        <section id="how-we-use">
          <h2>How we use the data</h2>
          <ul>
            <li>To generate the themed audio tour experience based on the date-seeded step count.</li>
          </ul>
          <p>We do not use your data for advertising, profiling with legal or similarly significant effects, or resale.</p>
        </section>

        <section id="retention">
          <h2>Retention</h2>
          <ul>
            <li><strong>On-device inputs.</strong> The date seed is ephemeral (in-memory) unless you choose a “remember settings” toggle, in which case preferences may be stored locally on your device until you clear your browser storage.</li>
            <li><strong>Support emails.</strong> If you email us, we keep correspondence for up to 12 months, then delete it unless the law requires longer.</li>
          </ul>
          <p>
            The DPA requires keeping personal data only as long as necessary for stated purposes and disposing of it securely.
            See <a href="https://privacy.gov.ph/day-to-day/" target="_blank" rel="noopener">NPC guidance</a>.
          </p>
        </section>

        <section id="sharing">
          <h2>Sharing &amp; transfers</h2>
          <p>We don’t sell or share the date you enter. Standard hosting/CDN providers may process logs (which can involve overseas infrastructure) strictly for hosting and security.</p>
        </section>

        <section id="your-rights">
          <h2>Your rights (RA 10173)</h2>
          <p>
            You have the rights to be informed, access, object, erasure/blocking, rectification, data portability, and to damages/complaint.
            To exercise these rights, contact <a href="mailto:hello@rosveluz.com">hello@rosveluz.com</a> or the
            <a href="https://privacy.gov.ph/" target="_blank" rel="noopener">National Privacy Commission</a>. See also the
            <a href="https://lawphil.net/statutes/repacts/ra2012/ra_10173_2012.html" target="_blank" rel="noopener">Data Privacy Act</a>.
          </p>
        </section>

        <section id="security">
          <h2>Security</h2>
          <p>
            We use appropriate organizational and technical measures (e.g., HTTPS, data minimization, secure disposal) consistent with the DPA.
            See <a href="https://privacy.gov.ph/day-to-day/" target="_blank" rel="noopener">NPC guidance</a>.
          </p>
        </section>

        <section id="changes">
          <h2>Changes</h2>
          <p>
            We may update this notice for clarity or compliance and will post the new effective date. The NPC recommends concise, readable notices; we follow that layered approach.
            See <a href="https://privacy.gov.ph/day-to-day/" target="_blank" rel="noopener">National Privacy Commission</a>.
          </p>
        </section>
      </article>
    `;

    this._createElements();
  }

  _createElements() {
    // Overlay container
    this.modal = document.createElement('div');
    this.modal.className = 'modal';
    this.modal.setAttribute('role', 'dialog');
    this.modal.setAttribute('aria-modal', 'true');

    // Content wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'modal-content';

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-close';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.innerHTML = `<img src="img/close.svg" alt="Close">`;
    closeBtn.addEventListener('click', () => this.hide());

    // Body container
    const body = document.createElement('div');
    body.className = 'modal-body';
    body.innerHTML = this.content;

    // Smooth scroll inside modal (so we don't change page hash)
    body.style.scrollBehavior = 'smooth';
    body.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      const id = link.getAttribute('href').slice(1);
      const target = body.querySelector(`#${CSS && CSS.escape ? CSS.escape(id) : id}`);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });

    // Assemble
    wrapper.appendChild(closeBtn);
    wrapper.appendChild(body);
    this.modal.appendChild(wrapper);
    this.parent.appendChild(this.modal);

    // Close when clicking outside the modal content
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.hide();
      }
    });
  }

  show() {
    this.modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  hide() {
    this.modal.classList.remove('open');
    document.body.style.overflow = '';
    if (typeof this.onClose === 'function') this.onClose();
  }
}
