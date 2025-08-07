export default class HomeScreen {
  /**
   * @param {HTMLElement} container
   * @param {Object} options.onNext - callback to navigate to the listening screen
   */
  constructor(container, { onNext }) {
    this.container = container;
    this.onNext = onNext;
    this._render();
  }

  _render() {
    this.container.innerHTML = `
      <div class="home">
        <h1>_enCounter: FUB Historical Timeline Audio Tour</h1>
        <p>
          Inspired by the Filipino-Spanish superstition “<i>Oro, Plata, Mata</i>” (Gold, Silver, Death), the history of First United Building is narrated by a themed audio tour based on the user's algorhitmically derived number of steps.
          <br><br>
          Enter your birthdate, or any date of your choice, and the webapp will come-up with the number of steps you must have taken from input date until August 9, 2025.
          <br><br>
          Listen to the audio composition. Using an Earphones/Headphones is recommended.
        </p>
        <div class="dob-form">
          <label for="dob">Select a start date:</label>
          <input type="date" id="dob" max="2025-08-09" />
        </div>
        <button id="startBtn" class="start-btn">START</button>
      </div>
    `;

    const startBtn = this.container.querySelector('#startBtn');
    // Initialize a date picker with manual input support (requires flatpickr)
    if (window.flatpickr) {
      flatpickr(this.container.querySelector('#dob'), {
        dateFormat: 'Y-m-d',
        maxDate: '2025-08-09',
        allowInput: true
      });
    }

    startBtn.addEventListener('click', () => {
      const dobValue = this.container.querySelector('#dob').value;
      if (!dobValue) {
        alert('Please select a valid date to continue.');
        return;
      }

      // Calculate days between DOB and target date
      const dob = new Date(dobValue);
      const target = new Date('2025-08-09');
      const msPerDay = 24 * 60 * 60 * 1000;
      const days = Math.floor((target - dob) / msPerDay);

      // Randomize average steps per day for uniqueness
      const minDaily = 3000;
      const maxDaily = 7000;
      const avgStepsPerDay = Math.floor(
        Math.random() * (maxDaily - minDaily + 1)
      ) + minDaily;
      const totalSteps = days * avgStepsPerDay;

      // Determine oro/plata/mata based on step count sequence
      const mod = totalSteps % 3;
      const result = mod === 1 ? 'oro' : mod === 2 ? 'plata' : 'mata';

      this.onNext('listening', {
        result,
        totalSteps,
        avgStepsPerDay
      });
    });
  }
}