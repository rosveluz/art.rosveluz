export default class InfoModal {
  constructor(parent, { onClose }) {
    this.parent = parent;
    this.onClose = onClose;
    this._create();
  }

  _create() {
    this.modal = document.createElement('div');
    this.modal.className = 'modal';
    this.modal.innerHTML = `
      <div class="modal-content">
        <span class="modal-close">×</span>
        <p>“Oro, Plata, Mata” counts steps in threes. Ending on “Mata” (death) is avoided.</p>
      </div>
    `;
    this.parent.appendChild(this.modal);
    this.modal.querySelector('.modal-close').addEventListener('click', () => this.hide());
  }

  show() {
    this.modal.style.display = 'block';
  }

  hide() {
    this.modal.style.display = 'none';
    if (this.onClose) this.onClose();
  }
}