document.addEventListener("DOMContentLoaded", async function () {
  const checkoutLayout = document.getElementById("checkoutLayout");
  if (!checkoutLayout) return; // not on the checkout page

  const checkoutEmpty = document.getElementById("checkoutEmpty");
  const orderConfirmation = document.getElementById("orderConfirmation");
  const lineListEl = document.getElementById("checkoutLineList");
  const subtotalEl = document.getElementById("coSubtotal");
  const shippingEl = document.getElementById("coShipping");
  const totalEl = document.getElementById("coTotal");
  const form = document.getElementById("checkoutForm");
  const errorEl = document.getElementById("checkoutError");
  const placeOrderBtn = document.getElementById("placeOrderBtn");

  const FLAT_SHIPPING = 10; // in the site's base currency (see admin Currency Settings)
  let cachedLines = [];

  async function renderSummary() {
    const lines = await getCartLines();
    cachedLines = lines;

    if (lines.length === 0) {
      checkoutLayout.style.display = "none";
      checkoutEmpty.style.display = "block";
      return false;
    }

    checkoutLayout.style.display = "grid";
    checkoutEmpty.style.display = "none";

    const subtotal = await getCartTotal();
    const total = subtotal + FLAT_SHIPPING;

    lineListEl.innerHTML = (
      await Promise.all(
        lines.map(async function (line) {
          const lineTotal = await formatPrice(line.product.price * line.qty);
          return `
        <div class="checkout-line">
          <span class="checkout-line-name">${line.product.name} <span class="checkout-line-qty">&times;${line.qty}</span></span>
          <span class="checkout-line-price">${lineTotal}</span>
        </div>
      `;
        }),
      )
    ).join("");

    subtotalEl.textContent = await formatPrice(subtotal);
    shippingEl.textContent = await formatPrice(FLAT_SHIPPING);
    totalEl.textContent = await formatPrice(total);

    return true;
  }

  const hasItems = await renderSummary();
  if (!hasItems) return;

  function resetPlaceOrderBtn() {
    placeOrderBtn.textContent = "Place Order";
    placeOrderBtn.disabled = false;
  }

  // Actually creates the order in the database and shows the confirmation screen.
  // paymentReference is only set for card/Mobile Money payments (already verified by Paystack).
  async function finalizeOrder(paymentMethod, subtotal, paymentReference) {
    const session =
      typeof getCustomerSession === "function" ? getCustomerSession() : null;

    const order = await placeOrder({
      customerName: document.getElementById("coFullName").value.trim(),
      customerContact: session
        ? session.contact
        : document.getElementById("coEmail").value.trim(),
      address: `${document.getElementById("coAddress").value.trim()}, ${document.getElementById("coCity").value.trim()}, ${document.getElementById("coRegion").value.trim()}`,
      paymentMethod: paymentMethod,
      items: cachedLines.map(function (line) {
        return {
          product: line.product.id,
          name: line.product.name,
          image:
            line.product.images && line.product.images[0]
              ? line.product.images[0]
              : "",
          qty: line.qty,
          price: line.product.price,
        };
      }),
      subtotal: subtotal,
      shipping: FLAT_SHIPPING,
      total: subtotal + FLAT_SHIPPING,
    });

    saveCart({}); // clear the local cart now that the order is confirmed
    checkoutLayout.style.display = "none";
    document.getElementById("confirmationOrderId").textContent =
      `Order number: ${order.orderNumber}`;
    orderConfirmation.style.display = "block";
  }

  // Runs after Paystack's popup reports success — confirms it server-side
  // before we actually create the order, so a tampered frontend can't fake a payment.
  async function verifyPaystackPaymentAndFinalize(
    paymentMethod,
    subtotal,
    reference,
  ) {
    try {
      const res = await fetch(`${API_BASE_URL}/payments/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      });

      const data = await res.json();

      if (!res.ok || !data.verified) {
        errorEl.textContent =
          "We could not confirm your payment. Please contact us before trying again.";
        resetPlaceOrderBtn();
        return;
      }

      await finalizeOrder(paymentMethod, subtotal, reference);
    } catch (err) {
      errorEl.textContent =
        "Payment succeeded but we could not confirm it with our server. Please contact us with your payment reference: " +
        reference;
      resetPlaceOrderBtn();
    }
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    errorEl.textContent = "";
    errorEl.style.color = "#d64545";

    const requiredFields = [
      document.getElementById("coFullName"),
      document.getElementById("coEmail"),
      document.getElementById("coPhone"),
      document.getElementById("coAddress"),
      document.getElementById("coCity"),
      document.getElementById("coRegion"),
    ];

    const emptyField = requiredFields.find((f) => !f.value.trim());

    requiredFields.forEach((f) => f.classList.remove("invalid"));

    if (emptyField) {
      emptyField.classList.add("invalid");
      errorEl.textContent =
        "Please fill in all shipping details before placing your order.";
      return;
    }

    const paymentMethod = form.querySelector(
      'input[name="paymentMethod"]:checked',
    ).value;
    const subtotal = await getCartTotal();

    // Mobile Money or Card — open the Paystack popup and pay in GHS.
    if (typeof PaystackPop === "undefined") {
      errorEl.textContent =
        "Payment system failed to load. Please check your internet connection and try again.";
      return;
    }

    const email = document.getElementById("coEmail").value.trim();
    const totalInBaseCurrency = subtotal + FLAT_SHIPPING;
    const totalInGHS = await convertToGHS(totalInBaseCurrency);
    const amountInPesewas = Math.round(totalInGHS * 100);
    const reference =
      "BE-" + Date.now() + "-" + Math.floor(Math.random() * 10000);

    placeOrderBtn.textContent = "Waiting for payment...";
    placeOrderBtn.disabled = true;

    const handler = PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: email,
      amount: amountInPesewas,
      currency: "GHS",
      ref: reference,
      channels: paymentMethod === "momo" ? ["mobile_money"] : ["card"],
      callback: function (response) {
        placeOrderBtn.textContent = "Confirming payment...";
        verifyPaystackPaymentAndFinalize(
          paymentMethod,
          subtotal,
          response.reference,
        );
      },
      onClose: function () {
        errorEl.textContent =
          "Payment window closed. You can try again whenever you're ready.";
        resetPlaceOrderBtn();
      },
    });

    handler.openIframe();
  });
});
