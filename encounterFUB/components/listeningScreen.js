export default class ListeningScreen {
  /**
   * @param {HTMLElement} container
   * @param {Object} options - contains onNext, onInfo, result, totalSteps, avgStepsPerDay
   */
  constructor(container, { onNext, onInfo, result, totalSteps, avgStepsPerDay }) {
    this.container = container;
    this.onNext = onNext;
    this.onInfo = onInfo;
    this.result = result;
    this.totalSteps = totalSteps;
    this.avgStepsPerDay = avgStepsPerDay;
    this.isPlaying = false;
    this.seeking = false;
    this._render();
  }

  _render() {
    this.container.innerHTML = `
      <div class="listening-screen">
        <div class="count-circle">
          <span>${this.totalSteps}</span>
        </div>
        <h3 class="listening-title">
          Audio Tour: ${
            this.result
              ? this.result.charAt(0).toUpperCase() + this.result.slice(1)
              : ''
          }
        </h3>
        <div class="transcript-box" id="transcriptBox"></div>

        <!-- Timeline / Scrubber -->
        <div class="progress-row">
          <span id="currentTime" class="time">0:00</span>
          <input
            type="range"
            id="seekSlider"
            class="seek-slider"
            min="0"
            max="0"
            step="0.01"
            value="0"
            aria-label="Seek"
          />
          <span id="duration" class="time">0:00</span>
        </div>

        <!-- Controls -->
        <div class="audio-controls">
          <input
          type="range"
          id="volumeSlider"
          class="volume-slider"
          min="0"
          max="1"
          step="0.01"
          value="1"
          aria-label="Volume"
          />
          <button id="back10Btn" class="control-btn" aria-label="Back 10 seconds">
            <svg class="icon" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M11 5v2.05A7 7 0 1 1 5.05 13H3a9 9 0 1 0 9-9z"/><path d="M5 11h6l-3-3v6z"/></svg>
          </button>
          <button id="back3Btn" class="control-btn" aria-label="Back 3 seconds">
            <svg class="icon" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 5v2a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7z"/><path d="M6 12h5l-2.5-2.5V14.5z"/></svg>
          </button>
          <button id="playBtn" class="control-btn" aria-label="Play">
            <svg class="icon" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M8 5l11 7-11 7V5z"/>
            </svg>
          </button>
          <button id="fwd3Btn" class="control-btn" aria-label="Forward 3 seconds">
            <svg class="icon" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 5v2a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7z" transform="scale(-1,1) translate(-24,0)"/><path d="M6 12h5l-2.5-2.5V14.5z" transform="scale(-1,1) translate(-24,0)"/></svg>
          </button>
          <button id="fwd10Btn" class="control-btn" aria-label="Forward 10 seconds">
            <svg class="icon" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M11 5v2.05A7 7 0 1 1 5.05 13H3a9 9 0 1 0 9-9z" transform="scale(-1,1) translate(-24,0)"/><path d="M5 11h6l-3-3v6z" transform="scale(-1,1) translate(-24,0)"/></svg>
          </button>
          <!-- Volume Slider -->

        </div>

        <audio id="resultAudio" src="assets/${this.result}.mp3" preload="auto"></audio>
      </div>
    `;

    // References
    this.audioEl = this.container.querySelector('#resultAudio');
    this.playBtn = this.container.querySelector('#playBtn');
    this.volumeSlider = this.container.querySelector('#volumeSlider');
    this.seekSlider = this.container.querySelector('#seekSlider');
    this.currTimeEl = this.container.querySelector('#currentTime');
    this.durTimeEl = this.container.querySelector('#duration');

    this.back10Btn = this.container.querySelector('#back10Btn');
    this.back3Btn = this.container.querySelector('#back3Btn');
    this.fwd3Btn = this.container.querySelector('#fwd3Btn');
    this.fwd10Btn = this.container.querySelector('#fwd10Btn');

    // Wire listeners
    this.playBtn.addEventListener('click', () => this._togglePlay());
    this.volumeSlider.addEventListener('input', () => {
      this.audioEl.volume = parseFloat(this.volumeSlider.value);
    });

    this.audioEl.addEventListener('loadedmetadata', () => {
      const dur = this.audioEl.duration || 0;
      this.seekSlider.max = dur;
      this.durTimeEl.textContent = this._formatTime(dur);
      this.currTimeEl.textContent = this._formatTime(0);
    });

    this.audioEl.addEventListener('timeupdate', () => {
      if (!this.seeking) {
        const t = this.audioEl.currentTime || 0;
        this.seekSlider.value = t;
        this.currTimeEl.textContent = this._formatTime(t);
      }
    });

    this.audioEl.addEventListener('ended', () => {
      this.isPlaying = false;
      this.playBtn.querySelector('svg').innerHTML = '<path d="M8 5l11 7-11 7V5z"/>';
      this.playBtn.setAttribute('aria-label', 'Play');
    });

    // Scrubbing
    this.seekSlider.addEventListener('input', () => {
      this.seeking = true;
      const t = parseFloat(this.seekSlider.value);
      this.currTimeEl.textContent = this._formatTime(t);
    });
    this.seekSlider.addEventListener('change', () => {
      const dur = this.audioEl.duration || 0;
      const t = Math.min(Math.max(parseFloat(this.seekSlider.value), 0), dur);
      this.audioEl.currentTime = t;
      this.seeking = false;
    });

    // Skip controls
    this.back10Btn.addEventListener('click', () => this._skip(-10));
    this.back3Btn.addEventListener('click', () => this._skip(-3));
    this.fwd3Btn.addEventListener('click', () => this._skip(3));
    this.fwd10Btn.addEventListener('click', () => this._skip(10));

    // Load transcript text
    this._loadTranscript();
  }

  _togglePlay() {
    if (!this.isPlaying) {
      this.audioEl.play().catch(console.error);
      this.playBtn.querySelector('svg').innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
      this.playBtn.setAttribute('aria-label', 'Pause');
    } else {
      this.audioEl.pause();
      this.playBtn.querySelector('svg').innerHTML = '<path d="M8 5l11 7-11 7V5z"/>';
      this.playBtn.setAttribute('aria-label', 'Play');
    }
    this.isPlaying = !this.isPlaying;
  }

  _skip(delta) {
    const dur = this.audioEl.duration || 0;
    const next = Math.min(Math.max((this.audioEl.currentTime || 0) + delta, 0), dur);
    this.audioEl.currentTime = next;
    // Update UI immediately
    this.seekSlider.value = next;
    this.currTimeEl.textContent = this._formatTime(next);
  }

  _formatTime(sec) {
    if (!isFinite(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  /**
   * Fetches the transcript file (.txt) for the current result and displays it
   */
  async _loadTranscript() {
    const transcriptUrl = `assets/${this.result}.txt`;
    try {
      const res = await fetch(transcriptUrl);
      if (!res.ok) throw new Error(`Failed to load transcript: ${res.status}`);
      const text = await res.text();

      // Use RegExp constructors to avoid formatter breaking regex literals
      const paragraphSplit = new RegExp("\r?\n\r?\n");
      const lineBreak = new RegExp("\r?\n", "g");

      const paragraphs = text.trim().split(paragraphSplit);
      const html = paragraphs
        .map(p => `<p>${p.replace(lineBreak, '<br>')}</p>`)
        .join('');

      this.container.querySelector('#transcriptBox').innerHTML = html;
    } catch (err) {
      console.error(err);
      this.container.querySelector('#transcriptBox').textContent = 'Transcript unavailable.';
    }
  }
}