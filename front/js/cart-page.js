document.addEventListener('DOMContentLoaded', async function () {
  const cartItemsEl = document.getElementById('cartItems');
  if (!cartItemsEl) return; // not on the cart page

  const cartLayout = document.getElementById('cartLayout');
  const cartEmpty = document.getElementById('cartEmpty');
  const summarySubtotal = document.getElementById('summarySubtotal');
  const summaryTotal = document.getElementById('summaryTotal');
  const checkoutBtn = document.getElementById('checkoutBtn');

  async function buildLineHTML(line) {
    const product = line.product;
    const lineTotal = await formatPrice(product.price * line.qty);
    const availabilityLabel = product.availability === 'preorder' ? 'Pre-Order' : 'Available in Ghana';
    const availabilityClass = product.availability === 'preorder' ? 'preorder' : 'ghana';

    return `
      <div class="cart-line" data-id="${product.id}">
        <a href="product-detail.html?id=${product.id}" class="cart-line-image" style="background-image:url('${product.images[0]}')"></a>

        <div class="cart-line-info">
          <a href="product-detail.html?id=${product.id}" class="cart-line-name">${product.name}</a>
          <p class="cart-line-category">${product.category}</p>
          <span class="availability-badge ${availabilityClass}">${availabilityLabel}</span>
        </div>

        <div class="cart-line-qty">
          <button class="qty-btn qty-minus" aria-label="Decrease quantity">&minus;</button>
          <input type="number" class="qty-input" min="1" value="${line.qty}">
          <button class="qty-btn qty-plus" aria-label="Increase quantity">+</button>
        </div>

        <span class="cart-line-price">${lineTotal}</span>

        <button class="cart-remove-btn" aria-label="Remove item">&times;</button>
      </div>
    `;
  }

  async function render() {
    const lines = await getCartLines();

    if (lines.length === 0) {
      cartLayout.style.display = 'none';
      cartEmpty.style.display = 'block';
      return;
    }

    cartLayout.style.display = 'grid';
    cartEmpty.style.display = 'none';

    cartItemsEl.innerHTML = (await Promise.all(lines.map(buildLineHTML))).join('');

    const total = await getCartTotal();
    const formattedTotal = await formatPrice(total);
    summarySubtotal.textContent = formattedTotal;
    summaryTotal.textContent = formattedTotal;
  }

  cartItemsEl.addEventListener('click', async function (e) {
    const line = e.target.closest('.cart-line');
    if (!line) return;
    const id = line.dataset.id;

    if (e.target.classList.contains('qty-plus')) {
      const input = line.querySelector('.qty-input');
      const newQty = Number(input.value) + 1;
      setCartQty(id, newQty);
      await render();
    }

    if (e.target.classList.contains('qty-minus')) {
      const input = line.querySelector('.qty-input');
      const newQty = Number(input.value) - 1;
      setCartQty(id, newQty);
      await render();
    }

    if (e.target.classList.contains('cart-remove-btn')) {
      removeFromCart(id);
      await render();
    }
  });

  cartItemsEl.addEventListener('change', async function (e) {
    if (!e.target.classList.contains('qty-input')) return;
    const line = e.target.closest('.cart-line');
    const id = line.dataset.id;
    const newQty = Math.max(1, Number(e.target.value) || 1);
    setCartQty(id, newQty);
    await render();
  });

  checkoutBtn.addEventListener('click', function () {
    window.location.href = 'checkout.html';
  });

  await render();
});