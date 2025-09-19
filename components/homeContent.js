export async function loadHomeContent() {
  // Render the shell immediately
  document.getElementById('homeContent').innerHTML = `
    <div class="carousel-wrapper">
      <button class="carousel-nav left" aria-label="Previous slide">&#10094;</button>

      <div class="carousel-slide" id="carouselSlide">
        <h2 id="carouselTitle">Loading…</h2>
        <p id="carouselText"></p>
        <a href="#" id="carouselLink" class="link-button" aria-label="Open category">Open</a>
      </div>

      <button class="carousel-nav right" aria-label="Next slide">&#10095;</button>
    </div>
  `;

  // 1) Fetch categories from manifest.json
  let slides = [];
  try {
    const res = await fetch('/content/manifest.json', { cache: 'no-store' });
    const manifest = await res.json();
    const categories = Array.isArray(manifest.categories) ? manifest.categories : [];

    // build slides from categories (any number supported)
    slides = categories.map(c => ({
      title: c.title || c.slug,
      text:  c.description || '…',
      link:  `/directory.html?c=${encodeURIComponent(c.slug)}`,
      image: c.bg || c.cover || 'img/delicate.jpg',
      buttonText: `Browse ${c.title || c.slug}`
    }));
  } catch (e) {
    console.error('Failed to load manifest for slides, falling back.', e);
  }

  // 2) Fallback if fetch fails or empty
  if (!slides.length) {
    slides = [
      {
        title: "Non/Media and Experiences",
        text: "…",
        link: "/directory.html?c=nonMedia",
        image: "img/delicate.jpg",
        buttonText: "Browse Non/Media & Experiences"
      },
      {
        title: "Drawings",
        text: "…",
        link: "/directory.html?c=drawings",
        image: "img/bambooGuitar.png",
        buttonText: "Browse Drawings"
      },
      {
        title: "Instruments and Crafts",
        text: "…",
        link: "/directory.html?c=crafts",
        image: "img/moriPins.png",
        buttonText: "Browse Instruments/Crafts"
      }
    ];
  }

  // 3) Carousel behavior (unchanged from your version)
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
