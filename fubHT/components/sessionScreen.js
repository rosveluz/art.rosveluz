export default class SessionScreen {
  /** Define expected QR token for session completion */
  static EXPECTED_QR = 'f4635424-0be9-4656-be82-0d3320bd57b9';
  /**
   * @param {HTMLElement} container
   * @param {Object} options.onNext - callback to navigate to ListeningScreen
   */
  constructor(container, { onNext }) {
    this.container = container;
    this.onNext = onNext;
    this.camOn = false;
    this.facingMode = 'environment';
    this.stream = null;
    this.steps = 0;
    this.sensor = null;
    this._motionHandler = null;
    this.lastMag = 0;
    this.lastStepTime = 0;
    this.walkTimeout = null;
    this._render();
  }

  _render() {
    this.container.innerHTML = `
      <div class="session">
        <!-- Walking Animation -->
        <dotlottie-wc id="walkAnim" class="walk-animation"
          src="https://lottie.host/0e8da522-2562-43b6-8659-43deb7777812/B7Vx5Dz8SI.lottie"
          speed="1" autoplay loop></dotlottie-wc>

        <!-- Camera Viewfinder -->
        <div class="camera-container">
          <video id="cameraStream" class="camera-stream" autoplay playsinline muted></video>
        </div>

        <!-- Camera Controls + Step Count -->
        <div class="camera-toolbar">
          <div id="stepCount" class="step-count">Steps: 0</div>
          <div class="toolbar-buttons">
            <button id="toggleCamBtn" class="toolbar-btn">
              <img src="img/cameraOFF.svg" alt="Toggle Camera" id="camIcon" />
            </button>
            <button id="switchCamBtn" class="toolbar-btn">
              <img src="img/switch.svg" alt="Switch Camera" id="switchIcon" />
            </button>
          </div>
        </div>

        <!-- Complete Session -->
        <button id="completeBtn" class="complete-btn" disabled>COMPLETE</button>
      </div>
    `;
    this.walkAnimEl = this.container.querySelector('#walkAnim');
    this.stepEl = this.container.querySelector('#stepCount');
    // Setup offscreen canvas for QR scanning
    this.qrCanvas = document.createElement('canvas');
    this.qrCtx = this.qrCanvas.getContext('2d');
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
        this.walkAnimEl.playAnimation();
        this._startQRScanner(videoEl);
        this._startStepSensor();
      } catch (err) {
        console.error('Camera error:', err);
      }
    };

    const stopStream = () => {
      if (this.stream) {
        this.stream.getTracks().forEach(t => t.stop());
        videoEl.srcObject = null;
      }
      this.camOn = false;
      camIcon.src = 'img/cameraOFF.svg';
      completeBtn.disabled = true;
      this.walkAnimEl.pauseAnimation();
      this._stopStepSensor();
        this._stopQRScanner();
    };

    toggleBtn.addEventListener('click', () => {
      this.camOn ? stopStream() : startStream();
    });

    switchBtn.addEventListener('click', async () => {
      this.facingMode = this.facingMode === 'environment' ? 'user' : 'environment';
      if (this.camOn) {
        stopStream();
        await startStream();
      }
      switchIcon.classList.toggle('flipped');
    });

    // Manual completion removed; completion via scanning correct QR code
  }

  _startStepSensor() {
    if (typeof DeviceMotionEvent !== 'undefined' && DeviceMotionEvent.requestPermission) {
      DeviceMotionEvent.requestPermission()
        .then(state => {
          if (state === 'granted') this._initStepSensor();
        })
        .catch(console.error);
    } else {
      this._initStepSensor();
    }
  }

  _initStepSensor() {
    if ('Accelerometer' in window) {
      this.sensor = new Accelerometer({ frequency: 10 });
      this.sensor.addEventListener('reading', () =>
        this._processMotion(this.sensor.x, this.sensor.y, this.sensor.z)
      );
      this.sensor.start();
    } else if ('DeviceMotionEvent' in window) {
      this._motionHandler = event => {
        const a = event.acceleration;
        if (a) this._processMotion(a.x, a.y, a.z);
      };
      window.addEventListener('devicemotion', this._motionHandler);
    } else {
      console.warn('No motion sensor available');
    }
  }

  _stopStepSensor() {
    if (this.sensor) {
      this.sensor.stop();
      this.sensor = null;
    }
    if (this._motionHandler) {
      window.removeEventListener('devicemotion', this._motionHandler);
      this._motionHandler = null;
    }
    clearTimeout(this.walkTimeout);
  }

  _processMotion(x, y, z) {
    const mag = Math.sqrt((x||0)**2 + (y||0)**2 + (z||0)**2);
    const now = Date.now();
    const diff = mag - this.lastMag;
    if (diff > 1.2 && (now - this.lastStepTime) > 400) {
      this.steps++;
      this.lastStepTime = now;
      if (this.stepEl) this.stepEl.textContent = `Steps: ${this.steps}`;
      this.walkAnimEl.playAnimation();
      clearTimeout(this.walkTimeout);
      this.walkTimeout = setTimeout(() => this.walkAnimEl.pauseAnimation(), 800);
    }
    this.lastMag = mag;
  }
}