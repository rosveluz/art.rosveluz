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
    this.content = content ||
      `<p>“Oro, Plata, Mata” counts steps in threes. Ending on “Mata” (death) is avoided.</p>`;
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

    // Close button using provided SVG
    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-close';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.innerHTML = `<img src="img/close.svg" alt="Close">`;
    closeBtn.addEventListener('click', () => this.hide());

    // Body container
    const body = document.createElement('div');
    body.className = 'modal-body';
    body.innerHTML = this.content;

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