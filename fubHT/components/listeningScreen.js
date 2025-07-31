export default class ListeningScreen {
  constructor(container, { onNext, onInfo }) {
    this.container = container;
    this.onNext = onNext;
    this.onInfo = onInfo;
    this._render();
  }

  _render() {
    this.container.innerHTML = `
      <div class="listening">
        <h2>Session Complete!</h2>
        <p>Your step count: <span id="finalCount">NNN</span></p>
        <audio id="resultAudio" controls></audio>
        <button id="infoBtn" class="info">?</button>
      </div>
    `;
    document.getElementById('resultAudio').addEventListener('play', () => this._playAudio());
    document.getElementById('infoBtn').addEventListener('click', () => this.onInfo());
    this._playAudio();
  }

  _playAudio() {
    const steps = parseInt(document.getElementById('finalCount').textContent, 10);
    const choice = steps % 3 === 1 ? 'oro' : steps % 3 === 2 ? 'plata' : 'mata';
    const audioEl = document.getElementById('resultAudio');
    audioEl.src = `/assets/${choice}.mp3`;
    document.getElementById('finalCount').textContent = steps;
    audioEl.play();
  }
}