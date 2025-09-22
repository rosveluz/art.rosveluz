// components/homeContent.js
export function loadHomeContent() {
  document.getElementById('homeContent').innerHTML = `
    <div class="carousel-wrapper">
      <button class="carousel-nav left">&#10094;</button>

      <div class="carousel-slide" id="carouselSlide">
        <h2 id="carouselTitle">Artworks</h2>
        <p id="carouselText">Veluz's creative expression is deeply informed by...</p>
        <a href="/art.html" id="carouselLink" class="link-button">Link Button</a>
      </div>

      <button class="carousel-nav right">&#10095;</button>
    </div>
  `;

  // Define slides
  const slides = [
    {
      title: "Non/Media",
      text: "…",
      link: "/directory.html?c=nonMedia",
      image: "img/delicate.jpg",
      buttonText: "Browse Non/Media"
    },
    {
      title: "Surfaces",
      text: "…",
      link: "/directory.html?c=surfaces",
      image: "img/bambooGuitar.png",
      buttonText: "Browse Surfaces"
    },
    {
      title: "Objects",
      text: "…",
      link: "/directory.html?c=objects",
      image: "img/moriPins.png",
      buttonText: "Browse Objects"
    }
  ];

  let current = 0;

  function updateSlide() {
    const slide = slides[current];

    document.getElementById('carouselTitle').textContent = slide.title;
    document.getElementById('carouselText').textContent = slide.text;
    document.getElementById('carouselLink').href = slide.link;
    document.getElementById('carouselLink').textContent = slide.buttonText;

    const container = document.getElementById('imageContainer');
    container.style.backgroundImage = `url('${slide.image}')`;
    container.style.backgroundSize = 'cover';
    container.style.backgroundPosition = 'center';
    container.style.transition = 'background-image 0.4s ease-in-out';
  }

  // Event Listeners for arrows
  document.querySelector('.carousel-nav.left').addEventListener('click', () => {
    current = (current - 1 + slides.length) % slides.length;
    updateSlide();
    resetAutoSlide();
  });

  document.querySelector('.carousel-nav.right').addEventListener('click', () => {
    current = (current + 1) % slides.length;
    updateSlide();
    resetAutoSlide();
  });

  // Swipe detection
  let touchStartX = 0;
  let touchEndX = 0;

  function handleGesture() {
    const swipeThreshold = 50;
    if (touchEndX < touchStartX - swipeThreshold) {
      current = (current + 1) % slides.length;
      updateSlide();
      resetAutoSlide();
    }
    if (touchEndX > touchStartX + swipeThreshold) {
      current = (current - 1 + slides.length) % slides.length;
      updateSlide();
      resetAutoSlide();
    }
  }

  const slideElement = document.getElementById('carouselSlide');

  // Mark touch events as passive so they don't block scrolling.
  slideElement.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  slideElement.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleGesture();
  }, { passive: true });

  // Auto slide every 5 seconds
  let autoSlideInterval = setInterval(() => {
    current = (current + 1) % slides.length;
    updateSlide();
  }, 5000);

  function resetAutoSlide() {
    clearInterval(autoSlideInterval);
    autoSlideInterval = setInterval(() => {
      current = (current + 1) % slides.length;
      updateSlide();
    }, 5000);
  }

  // Initialize first slide
  updateSlide();
}
