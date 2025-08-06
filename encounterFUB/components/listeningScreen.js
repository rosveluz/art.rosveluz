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
        <div class="transcript-box" id="transcriptBox">
          <!-- Transcript text will go here -->
        </div>
        <div class="audio-controls">
          <!-- Volume Slider -->
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
          <!-- Play/Pause Button -->
          <button id="playBtn" class="control-btn" aria-label="Play">
            <svg class="icon" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M8 5l11 7-11 7V5z"/>
            </svg>
          </button>
        </div>
        <audio id="resultAudio" src="assets/${this.result}.mp3" preload="auto"></audio>
      </div>
    `;

    // References
    this.audioEl = this.container.querySelector('#resultAudio');
    this.playBtn = this.container.querySelector('#playBtn');
    this.volumeSlider = this.container.querySelector('#volumeSlider');

    // Event listeners
    this.playBtn.addEventListener('click', () => this._togglePlay());
    this.volumeSlider.addEventListener('input', () => {
      this.audioEl.volume = parseFloat(this.volumeSlider.value);
    });
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
}