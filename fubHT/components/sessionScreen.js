export default class SessionScreen {
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

        <!-- Camera Controls -->
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
        this.walkAnimEl.play();
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
      this.walkAnimEl.pause();
      this._stopStepSensor();
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

    completeBtn.addEventListener('click', () => this.onNext('listening', { steps: this.steps }));
  }

  _startStepSensor() {
    if (!('Accelerometer' in window)) return;
    this.sensor = new Accelerometer({ frequency: 10 });
    this.sensor.addEventListener('reading', () => {
      const x = this.sensor.x, y = this.sensor.y, z = this.sensor.z;
      const mag = Math.sqrt(x * x + y * y + z * z);
      const now = Date.now();
      const diff = mag - this.lastMag;
      if (diff > 12 && (now - this.lastStepTime) > 500) {
        this.steps++;
        // Update the visible step count
        const stepEl = this.container.querySelector('#stepCount');
        if (stepEl) stepEl.textContent = `Steps: ${this.steps}`;
        this.lastStepTime = now;
        this.walkAnimEl.play();
        clearTimeout(this.walkTimeout);
        this.walkTimeout = setTimeout(() => this.walkAnimEl.pause(), 1000);
      }
      this.lastMag = mag;
    });
    this.sensor.start();
  }

  _stopStepSensor() {
    if (this.sensor) {
      this.sensor.stop();
      this.sensor = null;
    }
    clearTimeout(this.walkTimeout);
  }
}