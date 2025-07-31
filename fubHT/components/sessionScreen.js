export default class SessionScreen {
  constructor(container, { onNext, onInfo }) {
    this.container = container;
    this.onNext = onNext;
    this.onInfo = onInfo;
    this.steps = 0;
    this._renderInit();
  }

  _renderInit() {
    this.container.innerHTML = `
      <div class="session">
        <h2>Initialize Counter</h2>
        <button id="initBtn">INITIALIZE COUNTER</button>
        <button id="infoBtn" class="info">?</button>
      </div>
    `;
    document.getElementById('initBtn').addEventListener('click', () => this._startCounting());
    document.getElementById('infoBtn').addEventListener('click', () => this.onInfo());
  }

  _startCounting() {
    // TODO: pedometer logic + QR scanning enablement
    this._renderProgress();
  }

  _renderProgress() {
    this.container.innerHTML = `
      <div class="session">
        <h2>Counting Steps...</h2>
        <p id="stepCount">Steps: 0</p>
        <button id="scanBtn">Scan QR</button>
        <button id="completeBtn" disabled>COMPLETE</button>
        <button id="infoBtn" class="info">?</button>
      </div>
    `;
    document.getElementById('scanBtn').addEventListener('click', () => this._scanQR());
    document.getElementById('completeBtn').addEventListener('click', () => this.onNext('listening'));
    document.getElementById('infoBtn').addEventListener('click', () => this.onInfo());
  }

  _scanQR() {
    // TODO: integrate QR scanner; on success enable complete button
    document.getElementById('completeBtn').disabled = false;
  }
}