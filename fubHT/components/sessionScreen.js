export default class SessionScreen {
  /** Expected QR token for session completion */
  static EXPECTED_QR = 'f4635424-0be9-4656-be82-0d3320bd57b9';

  /**
   * @param {HTMLElement} container
   * @param {Object} options.onNext - callback to navigate to ListeningScreen
   */
  constructor(container, { onNext }) {
    this.container = container;
    this.onNext = onNext;
    this.stream = null;
    this.steps = 0;
    this.pedometer = null;
    this.qrInterval = null;
    this._render();
  }

  _render() {
    this.container.innerHTML = `
      <div class="session">
        <!-- Walking Animation -->
        <dotlottie-wc id="walkAnim" class="walk-animation"
          src="https://lottie.host/0e8da522-2562-43b6-8659-43deb7777812/B7Vx5Dz8SI.lottie"
          speed="1"></dotlottie-wc>

        <!-- Camera Viewfinder -->
        <div class="camera-container">
          <video id="cameraStream" class="camera-stream" autoplay playsinline muted></video>
        </div>

        <!-- Controls and Step Count -->
        <div class="camera-toolbar">
          <div id="stepCount" class="step-count">Steps: 0</div>
          <div class="toolbar-buttons">
            <button id="toggleCamBtn" class="toolbar-btn">
              <img src="img/cameraOFF.svg" alt="Camera Off" id="camIcon" />
            </button>
            <button id="switchCamBtn" class="toolbar-btn">
              <img src="img/switch.svg" alt="Switch Camera" id="switchIcon" />
            </button>
          </div>
        </div>
      </div>
    `;
    this.walkAnimEl = this.container.querySelector('#walkAnim');
    this.videoEl = this.container.querySelector('#cameraStream');
    this.stepEl = this.container.querySelector('#stepCount');
    // prepare QR scan canvas
    this.qrCanvas = document.createElement('canvas');
    this.qrCtx = this.qrCanvas.getContext('2d');
    this._attachListeners();
  }

  _attachListeners() {
    const toggleBtn = this.container.querySelector('#toggleCamBtn');
    const switchBtn = this.container.querySelector('#switchCamBtn');
    const camIcon = this.container.querySelector('#camIcon');
    const switchIcon = this.container.querySelector('#switchIcon');

    toggleBtn.addEventListener('click', () => {
      if (this.stream) this._stopStream(); else this._startStream();
    });

    switchBtn.addEventListener('click', async () => {
      // flip facingMode
      this.facingMode = this.facingMode === 'environment' ? 'user' : 'environment';
      if (this.stream) {
        this._stopStream();
        await this._startStream();
      }
      switchIcon.classList.toggle('flipped');
    });
  }

  async _startStream() {
    // request motion permission on iOS
    if (typeof DeviceMotionEvent !== 'undefined' && DeviceMotionEvent.requestPermission) {
      try {
        const state = await DeviceMotionEvent.requestPermission();
        if (state !== 'granted') {
          alert('Enable Motion & Orientation in settings for step counting.');
        }
      } catch(e) {
        console.error(e);
      }
    }

    // start camera
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: this.facingMode } });
      this.videoEl.srcObject = this.stream;
      this.container.querySelector('#camIcon').src = 'img/cameraON.svg';
      // start pedometer
      this._startPedometer();
      // start QR scanning
      this._startQRScanner();
      // start animation
      this.walkAnimEl.playAnimation();
    } catch (err) {
      console.error('Camera error:', err);
    }
  }

  _stopStream() {
    // stop camera
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.videoEl.srcObject = null;
    }
    this.stream = null;
    this.container.querySelector('#camIcon').src = 'img/cameraOFF.svg';
    // stop pedometer
    this._stopPedometer();
    // stop QR scanning
    this._stopQRScanner();
    // pause animation
    this.walkAnimEl.pauseAnimation();
  }

  _startPedometer() {
    if (window.Pedometer) {
      this.pedometer = new Pedometer({ frequency: 20, threshold: 2.5, debounce: 600 });
      this.pedometer.addEventListener('step', () => {
        this.steps++;
        if (this.stepEl) this.stepEl.textContent = `Steps: ${this.steps}`;
      });
      this.pedometer.start();
    } else {
      console.warn('Pedometer.js not loaded');
    }
  }

  _stopPedometer() {
    if (this.pedometer) {
      this.pedometer.stop();
      this.pedometer = null;
    }
  }

  _startQRScanner() {
    this.qrInterval = setInterval(() => {
      if (!this.videoEl.videoWidth) return;
      this.qrCanvas.width = this.videoEl.videoWidth;
      this.qrCanvas.height = this.videoEl.videoHeight;
      this.qrCtx.drawImage(this.videoEl, 0, 0);
      const imgData = this.qrCtx.getImageData(0, 0, this.qrCanvas.width, this.qrCanvas.height);
      const code = jsQR(imgData.data, this.qrCanvas.width, this.qrCanvas.height);
      if (code && code.data === SessionScreen.EXPECTED_QR) {
        clearInterval(this.qrInterval);
        this._stopStream();
        this.onNext('listening', { steps: this.steps });
      }
    }, 500);
  }

  _stopQRScanner() {
    if (this.qrInterval) {
      clearInterval(this.qrInterval);
      this.qrInterval = null;
    }
  }
}