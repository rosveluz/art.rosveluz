export default class HomeScreen {
  constructor(container, { onNext, onInfo }) {
    this.container = container;
    this.onNext = onNext;
    this.onInfo = onInfo;
    this._render();
  }

  _render() {
    this.container.innerHTML = `
      <div class="home">
        <h1>Oro-Plata-Mata Step Art</h1>
        <button id="startBtn">START SESSION</button>
        <button id="infoBtn" class="info">?</button>
      </div>
    `;
    document.getElementById('startBtn').addEventListener('click', () => this.onNext('session'));
    document.getElementById('infoBtn').addEventListener('click', () => this.onInfo());
  }
}