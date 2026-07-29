// Hero slideshow: auto-advances, and the dots let you jump to any slide directly
document.addEventListener('DOMContentLoaded', function () {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');
  let current = 0;
  const AUTO_DELAY = 6000; // ms between automatic transitions

  let timer = null;

  function goToSlide(index) {
    slides[current].classList.remove('active');
    dots[current] && dots[current].classList.remove('active');

    current = (index + slides.length) % slides.length;

    slides[current].classList.add('active');
    dots[current] && dots[current].classList.add('active');
  }

  function nextSlide() {
    goToSlide(current + 1);
  }

  function startAutoplay() {
    timer = setInterval(nextSlide, AUTO_DELAY);
  }

  function resetAutoplay() {
    clearInterval(timer);
    startAutoplay();
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      goToSlide(index);
      resetAutoplay();
    });
  });

  if (slides.length > 1) {
    startAutoplay();
  }
});