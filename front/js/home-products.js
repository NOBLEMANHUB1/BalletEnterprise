// Builds one product card's HTML. Shared shape used by the homepage teaser
// grid and the full shop page grid (js/shop.js).
async function buildProductCardHTML(product) {
  const isPreorder = product.availability === 'preorder';
  const tagHTML = product.tag
    ? `<span class="product-tag">${product.tag}</span>`
    : (isPreorder ? `<span class="product-tag preorder-tag">Pre-Order</span>` : '');

  const shipNoteHTML = isPreorder && product.shipTime
    ? `<p class="preorder-note">Ships in ${product.shipTime}</p>`
    : '';

  const buttonHTML = isPreorder
    ? `<button class="add-btn preorder-btn" data-id="${product.id}">Pre-Order Now</button>`
    : `<button class="add-btn" data-id="${product.id}">Add to Cart</button>`;

  let ratingHTML = '';
  if (typeof getAverageRating === 'function') {
    try {
      const { average, count } = await getAverageRating(product.id);
      ratingHTML = count > 0
        ? `<p class="card-rating"><span class="card-rating-stars">${buildStarString(average)}</span> <span class="card-rating-count">(${count})</span></p>`
        : '';
    } catch (err) {
      ratingHTML = '';
    }
  }

  const priceHTML = typeof formatPrice === 'function'
    ? await formatPrice(product.price)
    : `$${product.price.toFixed(2)}`;

  return `
    <div class="product-card" data-id="${product.id}">
      <a class="product-thumb-link" href="product-detail.html?id=${product.id}">
        <div class="product-image" style="background-image:url('${product.images[0]}')">
          ${tagHTML}
        </div>
        <p class="product-category">${product.category}</p>
        <h3 class="product-name">${product.name}</h3>
        ${ratingHTML}
      </a>
      ${shipNoteHTML}
      <div class="product-footer">
        <span class="product-price">${priceHTML}</span>
        ${buttonHTML}
      </div>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', async function () {
  const ghanaPanel = document.getElementById('ghana-panel');
  const preorderPanel = document.getElementById('preorder-panel');

  if (!ghanaPanel || !preorderPanel) return;

  let products;
  try {
    products = await getProducts();
  } catch (err) {
    ghanaPanel.innerHTML = '<p class="shop-empty">Could not load products. Is the backend running?</p>';
    return;
  }

  const ghanaProducts = products.filter(p => p.availability === 'ghana').slice(0, 6);
  const preorderProducts = products.filter(p => p.availability === 'preorder').slice(0, 3);

  ghanaPanel.innerHTML = (await Promise.all(ghanaProducts.map(buildProductCardHTML))).join('');
  preorderPanel.innerHTML = (await Promise.all(preorderProducts.map(buildProductCardHTML))).join('');

  [ghanaPanel, preorderPanel].forEach(function (panel) {
    panel.addEventListener('click', function (e) {
      if (!e.target.classList.contains('add-btn')) return;
      handleAddToCartClick(e.target);
    });
  });
});

// Shared handler: adds the item, then gives quick visual feedback on the button
function handleAddToCartClick(btn) {
  const id = btn.dataset.id;
  const card = btn.closest('.product-card');
  const nameEl = card ? card.querySelector('.product-name') : null;
  addToCart(id, 1, nameEl ? nameEl.textContent : '');

  const originalText = btn.textContent;
  btn.textContent = 'Added ✓';
  btn.disabled = true;

  setTimeout(function () {
    btn.textContent = originalText;
    btn.disabled = false;
  }, 1200);
}