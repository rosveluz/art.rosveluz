export default class SessionScreen {
  /**
   * @param {HTMLElement} container
   * @param {Object} options.onNext - callback to navigate to listening screen
   */
  constructor(container, { onNext }) {
    this.container = container;
    this.onNext = onNext;
    this.camOn = false;
    this.facingMode = 'environment';
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
          <button id="switchCamBtn" class="toolbar-btn">
            <img src="img/switch.svg" alt="Switch Camera" id="switchIcon" />
          </button>
        </div>
        <button id="completeBtn" class="complete-btn" disabled>COMPLETE</button>
      </div>
    `;
    this._attachListeners();
  }

  async _attachListeners() {
    const toggleBtn = this.container.querySelector('#toggleCamBtn');
    const switchBtn = this.container.querySelector('#switchCamBtn');
    const camIcon = this.container.querySelector('#camIcon');
    const switchIcon = this.container.querySelector('#switchIcon');
    const videoEl = this.container.querySelector('#cameraStream');
    const completeBtn = this.container.querySelector('#completeBtn');

    const startStream = async () => {
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: this.facingMode }
        });
        videoEl.srcObject = this.stream;
        this.camOn = true;
        camIcon.src = 'img/cameraON.svg';
        completeBtn.disabled = false;
      } catch (err) {
        console.error('Camera error:', err);
      }
    };

    const stopStream = () => {
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
        videoEl.srcObject = null;
      }
      this.camOn = false;
      camIcon.src = 'img/cameraOFF.svg';
      completeBtn.disabled = true;
    };

    toggleBtn.addEventListener('click', () => {
      this.camOn ? stopStream() : startStream();
    });

    switchBtn.addEventListener('click', async () => {
      // switch facingMode
      this.facingMode = this.facingMode === 'environment' ? 'user' : 'environment';
      // restart stream if on
      if (this.camOn) {
        stopStream();
        await startStream();
      }
      // Optionally change switch icon
      switchIcon.classList.toggle('flipped');
    });

    completeBtn.addEventListener('click', () => this.onNext('listening'));
  }
}