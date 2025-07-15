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
      title: "Non/Media and Experiences",
      text: "Ros Veluz is an experienced web designer, artist, and musician. His creative expression is deeply informed by cultural iconography, psychology, and  music.",
      link: "https://www.art.rosveluz.com",
      image: "img/delicate.jpg",
      buttonText: "Artist's Portfolio"
    },
    {
      title: "Drawings",
      text: "The design portfolio blends form, function, and cultural resonance.",
      link: "https://rosveluz-webdesign.myportfolio.com/",
      image: "img/bambooGuitar.png",
      buttonText: "Design Portfolio"
    },
    {
      title: "Instruments",
      text: "Limited-edition merchandise that reflects Veluz's personal aesthetic.",
      link: "https://facebook.com/modern.junk.and.artifacts",
      image: "img/moriPins.png",
      buttonText: "Modern Junk & Artifacts Shop"
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

  slideElement.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  });

  slideElement.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleGesture();
  });

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
