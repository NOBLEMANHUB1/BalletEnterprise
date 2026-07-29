document.addEventListener('DOMContentLoaded', async function () {
  const shopGrid = document.getElementById('shopGrid');
  if (!shopGrid) return; // not on the shop page

  const tabButtons = document.querySelectorAll('.shop-controls .tab-btn');
  const categorySelect = document.getElementById('categorySelect');
  const searchInput = document.getElementById('shopSearch');
  const resultCount = document.getElementById('resultCount');
  const emptyMsg = document.getElementById('shopEmpty');

  let allProducts;
  try {
    allProducts = await getProducts();
  } catch (err) {
    shopGrid.innerHTML = '';
    emptyMsg.textContent = 'Could not load products. Is the backend running?';
    emptyMsg.style.display = 'block';
    return;
  }

  let currentAvailability = 'all';
  let currentCategory = 'all';

  // populate category dropdown from whatever categories exist in the data
  const categories = [...new Set(allProducts.map(p => p.category))].sort();
  categories.forEach(function (cat) {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    categorySelect.appendChild(opt);
  });

  // pre-select category if we arrived here from a "Shop by Category" link
  const urlParams = new URLSearchParams(window.location.search);
  const initialCategory = urlParams.get('category');
  if (initialCategory && categories.includes(initialCategory)) {
    categorySelect.value = initialCategory;
    currentCategory = initialCategory;
  }

  // pre-fill the search box if we arrived here from a navbar search (?search=...)
  const initialSearch = urlParams.get('search');
  if (initialSearch) {
    searchInput.value = initialSearch;
    const heroTitle = document.querySelector('.shop-hero h1');
    const heroSub = document.querySelector('.shop-hero p');
    if (heroTitle) heroTitle.textContent = 'Search Results';
    if (heroSub) heroSub.textContent = `Showing results for "${initialSearch}"`;

    const clearLink = document.createElement('a');
    clearLink.href = 'products.html';
    clearLink.textContent = 'Clear search';
    clearLink.className = 'clear-search-link';
    resultCount.insertAdjacentElement('afterend', clearLink);
  }

  async function render() {
    const searchTerm = searchInput.value.trim().toLowerCase();

    const filtered = allProducts.filter(function (p) {
      const matchesAvailability = currentAvailability === 'all' || p.availability === currentAvailability;
      const matchesCategory = currentCategory === 'all' || p.category === currentCategory;
      const matchesSearch = !searchTerm ||
        p.name.toLowerCase().includes(searchTerm) ||
        p.category.toLowerCase().includes(searchTerm);
      return matchesAvailability && matchesCategory && matchesSearch;
    });

    shopGrid.innerHTML = (await Promise.all(filtered.map(buildProductCardHTML))).join('');
    emptyMsg.style.display = filtered.length ? 'none' : 'block';
    resultCount.textContent = filtered.length
      ? `${filtered.length} product${filtered.length === 1 ? '' : 's'}`
      : '';
  }

  tabButtons.forEach(function (btn) {
    btn.addEventListener('click', async function () {
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentAvailability = btn.dataset.filter;
      await render();
    });
  });

  categorySelect.addEventListener('change', async function () {
    currentCategory = categorySelect.value;
    await render();
  });

  searchInput.addEventListener('input', () => render());

  shopGrid.addEventListener('click', function (e) {
    if (!e.target.classList.contains('add-btn')) return;
    handleAddToCartClick(e.target);
  });

  await render();
});