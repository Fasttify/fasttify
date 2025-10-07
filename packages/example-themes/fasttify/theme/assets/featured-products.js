document.addEventListener('DOMContentLoaded', function () {
  const carousel = document.querySelector('.products-carousel');
  const track = document.querySelector('.products-carousel-track');
  const slides = document.querySelectorAll('.carousel-slide');
  const prevBtn = document.querySelector('.carousel-nav-prev');
  const nextBtn = document.querySelector('.carousel-nav-next');

  if (!carousel || !track || slides.length === 0) return;

  let currentSlide = 0;
  let slidesPerView = 4;
  let totalSlides = slides.length;

  // Detectar número de slides visibles según el ancho de pantalla
  function updateSlidesPerView() {
    const width = window.innerWidth;
    if (width <= 480) {
      slidesPerView = 2;
    } else if (width <= 1024) {
      slidesPerView = 3;
    } else {
      slidesPerView = 4;
    }

    // Actualizar dinámicamente el ancho del track y slides
    updateTrackDimensions();
  }

  // Función para actualizar dimensiones del track y slides dinámicamente
  function updateTrackDimensions() {
    // Calcular ancho total del track
    const trackWidthPercent = (totalSlides / slidesPerView) * 100;
    track.style.width = `${trackWidthPercent}%`;

    // Obtener gap del CSS computado
    const computedStyle = getComputedStyle(track);
    const gap = parseFloat(computedStyle.gap) || 20;

    // Calcular ancho de cada slide
    const slideWidthCalc = `calc((100% - ${totalSlides - 1} * ${gap}px) / ${totalSlides})`;

    // Aplicar a todos los slides
    slides.forEach((slide) => {
      slide.style.flex = `0 0 ${slideWidthCalc}`;
    });
  }

  // Calcular la posición máxima de navegación (slide por slide)
  function getMaxSlidePosition() {
    return Math.max(0, totalSlides - slidesPerView);
  }

  // Actualizar posición del carrusel
  function updateCarousel() {
    // Navegar slide por slide, no por grupos
    const slideWidthPercent = 100 / totalSlides;
    const translateX = -(currentSlide * slideWidthPercent);
    track.style.transform = `translateX(${translateX}%)`;

    // Actualizar botones
    prevBtn.disabled = currentSlide === 0;
    nextBtn.disabled = currentSlide >= getMaxSlidePosition();
  }

  // Ir al slide anterior
  function goToPrev() {
    if (currentSlide > 0) {
      currentSlide--;
      updateCarousel();
    }
  }

  // Ir al slide siguiente
  function goToNext() {
    if (currentSlide < getMaxSlidePosition()) {
      currentSlide++;
      updateCarousel();
    }
  }

  // Ir a un slide específico
  function goToSlide(slideIndex) {
    currentSlide = Math.max(0, Math.min(slideIndex, getMaxSlidePosition()));
    updateCarousel();
  }

  // Event listeners
  prevBtn.addEventListener('click', goToPrev);
  nextBtn.addEventListener('click', goToNext);

  // Touch/swipe support para móvil
  let startX = 0;
  let endX = 0;
  let isDragging = false;

  track.addEventListener(
    'touchstart',
    (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
    },
    { passive: true }
  );

  track.addEventListener(
    'touchmove',
    (e) => {
      if (!isDragging) return;
      endX = e.touches[0].clientX;
    },
    { passive: true }
  );

  track.addEventListener(
    'touchend',
    () => {
      if (!isDragging) return;
      isDragging = false;

      const threshold = 50;
      const diff = startX - endX;

      if (Math.abs(diff) > threshold) {
        if (diff > 0) {
          goToNext();
        } else {
          goToPrev();
        }
      }
    },
    { passive: true }
  );

  // Navegación por teclado
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      goToPrev();
    } else if (e.key === 'ArrowRight') {
      goToNext();
    }
  });

  // Resize handler
  function handleResize() {
    const oldSlidesPerView = slidesPerView;
    updateSlidesPerView();

    // Ajustar currentSlide si cambió el número de slides visibles
    if (oldSlidesPerView !== slidesPerView) {
      currentSlide = Math.min(currentSlide, getMaxSlidePosition());
    }
    updateCarousel();
  }

  window.addEventListener('resize', handleResize);

  // Inicializar
  updateSlidesPerView();
  updateCarousel();

  // Auto-play opcional (descomentado si se desea)
  /*
  setInterval(() => {
    if (currentSlide >= getMaxSlideGroups()) {
      currentSlide = 0;
    } else {
      currentSlide++;
    }
    updateCarousel();
  }, 5000);
  */
});
