document.addEventListener('DOMContentLoaded', function () {
  const toggleBtn = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  if (!toggleBtn || !mobileMenu) return;

  function closeMenu() {
    toggleBtn.classList.remove('open');
    mobileMenu.classList.remove('open');
    toggleBtn.setAttribute('aria-label', 'Open menu');
  }

  function openMenu() {
    toggleBtn.classList.add('open');
    mobileMenu.classList.add('open');
    toggleBtn.setAttribute('aria-label', 'Close menu');
  }

  toggleBtn.addEventListener('click', function () {
    const isOpen = mobileMenu.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  });

  // Close the menu once a link inside it is tapped
  mobileMenu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  // Close if the viewport is resized back up to desktop width
  window.addEventListener('resize', function () {
    if (window.innerWidth > 900) closeMenu();
  });
});