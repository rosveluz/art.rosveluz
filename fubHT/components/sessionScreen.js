export default class SessionScreen {
  /**
   * @param {HTMLElement} container
   * @param {Object} options.onNext - callback to navigate to listening screen
   */
  constructor(container, { onNext }) {
    this.container = container;
    this.onNext = onNext;
    this.camOn = false;
    this._render();
  }

  _render() {
    this.container.innerHTML = `
      <div class="session">
        <div class="camera-container"></div>
        <div class="camera-toolbar">
          <button id="toggleCamBtn" class="toolbar-btn">
            <img src="img/cameraOFF.svg" alt="Toggle Camera" id="camIcon" />
          </button>
        </div>
        <button id="completeBtn" class="complete-btn">COMPLETE</button>
      </div>
    `;
    this._attachListeners();
  }

  _attachListeners() {
    const toggleBtn = this.container.querySelector('#toggleCamBtn');
    const camIcon = this.container.querySelector('#camIcon');
    const completeBtn = this.container.querySelector('#completeBtn');

    toggleBtn.addEventListener('click', () => {
      this.camOn = !this.camOn;
      camIcon.src = this.camOn ? 'img/cameraON.svg' : 'img/cameraOFF.svg';
      // TODO: integrate live camera or QR scanning here
    });

    completeBtn.addEventListener('click', () => this.onNext('listening'));
  }
}