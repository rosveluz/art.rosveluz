export default class SessionScreen {
  /**
   * @param {HTMLElement} container
   * @param {Object} options.onNext - callback to navigate to listening screen
   */
  constructor(container, { onNext }) {
    this.container = container;
    this.onNext = onNext;
    this.camOn = false;
    this.stream = null;
    this._render();
  }

  _render() {
    this.container.innerHTML = `
      <div class="session">
        <div class="camera-container">
          <video id="cameraStream" class="camera-stream" autoplay playsinline></video>
        </div>
        <div class="camera-toolbar">
          <button id="toggleCamBtn" class="toolbar-btn">
            <img src="img/cameraOFF.svg" alt="Toggle Camera" id="camIcon" />
          </button>
        </div>
        <button id="completeBtn" class="complete-btn" disabled>COMPLETE</button>
      </div>
    `;
    this._attachListeners();
  }

  async _attachListeners() {
    const toggleBtn = this.container.querySelector('#toggleCamBtn');
    const camIcon = this.container.querySelector('#camIcon');
    const videoEl = this.container.querySelector('#cameraStream');
    const completeBtn = this.container.querySelector('#completeBtn');

    toggleBtn.addEventListener('click', async () => {
      if (!this.camOn) {
        try {
          this.stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
          });
          videoEl.srcObject = this.stream;
          camIcon.src = 'img/cameraON.svg';
          completeBtn.disabled = false; // enable complete once camera is on
          this.camOn = true;
        } catch (err) {
          console.error('Camera permission error:', err);
        }
      } else {
        // Turn off camera
        this.stream.getTracks().forEach(track => track.stop());
        videoEl.srcObject = null;
        camIcon.src = 'img/cameraOFF.svg';
        completeBtn.disabled = true;
        this.camOn = false;
      }
    });

    completeBtn.addEventListener('click', () => this.onNext('listening'));
  }
}
