export default class HomeScreen {
  constructor(container, { onNext }) {
    this.container = container;
    this.onNext = onNext;
    this.currentSlide = 0;
    this.slides = [
      {
        header: 'Welcome to FUB Historical Timeline Audio Tour',
        text: 'Press “Start Session,” and the app will track your steps to select a themed audio tour based on your step count.',
        image: 'img/fub-1.png'
      },
      {
        header: 'Scan the QR code to Complete the session',
        text: 'At the end of this Historical Timeline display, scanning the QR code will enable the completion of the session.',
        image: 'img/fub-2.png'
      },
      {
        header: 'Listen and enjoy the audio tour',
        text: 'The audio narration will play automatically as you move through the timeline—just walk at your own pace and enjoy the tour.',
        image: 'img/fub-3.png'
      }
    ];
    this._render();
    this._showSlide(this.currentSlide);
  }

  _render() {
    this.container.innerHTML = `
      <div class="home">
        <div class="carousel">
          ${this.slides.map((slide, i) => `
            <div class="carousel-slide" data-index="${i}">
              <div class="slide-image">
                <img src="${slide.image}" alt="${slide.header}" class="slide-img" />
                <button id="startBtn-${i}" class="start-btn">START SESSION</button>
              </div>
              <h2>${slide.header}</h2>
              <p>${slide.text}</p>
            </div>
          `).join('')}  
          <button class="carousel-btn prev">&#9664;</button>
          <button class="carousel-btn next">&#9654;</button>
        </div>
        <div class="carousel-dots">
          ${this.slides.map((_, i) => `<div class="carousel-dot" data-index="${i}"></div>`).join('')}
        </div>
      </div>
    `;

    // Start Session listeners with motion permission
    this.slides.forEach((_, i) => {
      const btn = this.container.querySelector(`#startBtn-${i}`);
      btn.addEventListener('click', async () => {
        // Request motion permission on iOS Safari
        if (typeof DeviceMotionEvent !== 'undefined' && DeviceMotionEvent.requestPermission) {
          try {
            const state = await DeviceMotionEvent.requestPermission();
            if (state !== 'granted') {
              alert('Motion access is required for step counting. Please enable Motion & Orientation Access in your browser settings.');
              return;
            }
          } catch (err) {
            console.error('Motion permission error:', err);
            alert('Unable to obtain motion permission; step counting may not work.');
          }
        }
        this.onNext('session');
      });
    });

    // Carousel navigation
    this.container.querySelector('.prev')
      .addEventListener('click', () => this._prevSlide());
    this.container.querySelector('.next')
      .addEventListener('click', () => this._nextSlide());
    this.container.querySelectorAll('.carousel-dot').forEach(dot => {
      dot.addEventListener('click', e => {
        const idx = parseInt(e.target.getAttribute('data-index'), 10);
        this._showSlide(idx);
      });
    });
  }

  _showSlide(index) {
    const slides = this.container.querySelectorAll('.carousel-slide');
    const dots = this.container.querySelectorAll('.carousel-dot');
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    slides[index].classList.add('active');
    dots[index].classList.add('active');
    this.currentSlide = index;
  }

  _prevSlide() {
    const newIndex = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
    this._showSlide(newIndex);
  }

  _nextSlide() {
    const newIndex = (this.currentSlide + 1) % this.slides.length;
    this._showSlide(newIndex);
  }
}