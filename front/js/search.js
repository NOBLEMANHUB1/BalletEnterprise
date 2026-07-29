// Wires up every navbar search box (desktop + mobile menu version).
// Pressing Enter jumps to the shop page with the query pre-filled and filtered.
// On the shop page itself, shop.js already filters live as you type, so Enter
// there doesn't need to do anything extra.
document.addEventListener('DOMContentLoaded', function () {
  const inputs = document.querySelectorAll('.search-wrap input, .mobile-search-wrap input');
  const onShopPage = !!document.getElementById('shopGrid');

  inputs.forEach(function (input) {
    input.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      e.preventDefault();

      if (onShopPage) return; // already filtering live on this page

      const term = input.value.trim();
      window.location.href = term
        ? `products.html?search=${encodeURIComponent(term)}`
        : 'products.html';
    });
  });
});