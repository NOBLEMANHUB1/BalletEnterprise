const MAX_VIDEO_SECONDS = 180; // 3 minutes

// Uploads a single image file to the backend, returns its public URL.
async function uploadImageFile(file) {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${API_BASE_URL}/upload/image`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getAdminToken()}` },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to upload image.");
  }

  const data = await res.json();
  return data.url;
}

// Uploads a single video file to the backend, returns its public URL.
async function uploadVideoFile(file) {
  const formData = new FormData();
  formData.append("video", file);

  const res = await fetch(`${API_BASE_URL}/upload/video`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getAdminToken()}` },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to upload video.");
  }

  const data = await res.json();
  return data.url;
}

document.addEventListener("DOMContentLoaded", function () {
  // ===== ADMIN LOGIN PAGE =====
  const loginForm = document.getElementById("adminLoginForm");

  if (loginForm) {
    const adminUser = document.getElementById("adminUser");
    const adminPassword = document.getElementById("adminPassword");
    const errorEl = document.getElementById("formError");

    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const submitBtn = loginForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;

      try {
        const res = await fetch(`${API_BASE_URL}/admin/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: adminUser.value.trim(),
            password: adminPassword.value,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          submitBtn.disabled = false;
          errorEl.style.color = "#d64545";
          errorEl.textContent =
            data.message || "Incorrect admin email or password.";
          adminUser.classList.add("invalid");
          adminPassword.classList.add("invalid");
          return;
        }

        setAdminToken(data.token);
        errorEl.style.color = "#2e7d32";
        errorEl.textContent = "Login successful! Redirecting...";
        setTimeout(() => {
          window.location.href = "admin-dashboard.html";
        }, 700);
      } catch (err) {
        submitBtn.disabled = false;
        errorEl.style.color = "#d64545";
        errorEl.textContent =
          "Could not reach the server. Is the backend running?";
      }
    });
  }

  // ===== ADMIN DASHBOARD PAGE =====
  const tableBody = document.getElementById("productTableBody");

  if (tableBody) {
    // Guard: bounce back to login if not authenticated
    if (!getAdminToken()) {
      window.location.href = "admin-login.html";
      return;
    }

    const logoutBtn = document.getElementById("logoutBtn");
    const addProductForm = document.getElementById("addProductForm");
    const addProductError = document.getElementById("addProductError");
    const addProductSubmitBtn = document.getElementById("addProductSubmitBtn");
    const availabilitySelect = document.getElementById("prodAvailability");
    const shipTimeGroup = document.getElementById("shipTimeGroup");
    const priceLabel = document.getElementById("prodPriceLabel");
    const priceColumnHeader = document.getElementById("priceColumnHeader");

    logoutBtn.addEventListener("click", function () {
      clearAdminToken();
      window.location.href = "admin-login.html";
    });

    availabilitySelect.addEventListener("change", function () {
      shipTimeGroup.style.display =
        availabilitySelect.value === "preorder" ? "flex" : "none";
    });

    // ===== Image slot previews (file OR pasted URL) =====
    document.querySelectorAll(".prod-image-file").forEach(function (fileInput) {
      const slot = fileInput.dataset.slot;
      const preview = document.getElementById(`preview${slot}`);

      fileInput.addEventListener("change", function () {
        const file = fileInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
          preview.style.backgroundImage = `url('${e.target.result}')`;
          preview.style.display = "block";
        };
        reader.readAsDataURL(file);

        const urlInput = document.querySelector(
          `.prod-image-url[data-slot="${slot}"]`,
        );
        if (urlInput) urlInput.value = "";
      });
    });

    document.querySelectorAll(".prod-image-url").forEach(function (urlInput) {
      const slot = urlInput.dataset.slot;
      const preview = document.getElementById(`preview${slot}`);

      urlInput.addEventListener("input", function () {
        const url = urlInput.value.trim();
        if (url) {
          preview.style.backgroundImage = `url('${url}')`;
          preview.style.display = "block";
          const fileInput = document.querySelector(
            `.prod-image-file[data-slot="${slot}"]`,
          );
          if (fileInput) fileInput.value = "";
        } else {
          preview.style.display = "none";
        }
      });
    });

    // ===== Video: upload OR pasted URL, with a duration check either way =====
    const videoFileInput = document.getElementById("prodVideoFile");
    const videoUrlInput = document.getElementById("prodVideoUrl");
    const videoPreview = document.getElementById("videoPreview");
    const videoWarningEl = document.getElementById("videoDurationWarning");

    function checkVideoDuration(src, isObjectUrl) {
      videoWarningEl.textContent = "";
      const probe = document.createElement("video");
      probe.preload = "metadata";
      probe.src = src;

      probe.onloadedmetadata = function () {
        if (probe.duration > MAX_VIDEO_SECONDS) {
          videoWarningEl.textContent = `This video is about ${Math.round(probe.duration / 60)} min long — please keep product videos under 3 minutes.`;
        }
        if (isObjectUrl) URL.revokeObjectURL(src);
      };

      probe.onerror = function () {
        videoWarningEl.textContent =
          "Couldn't load that video to check its length — double check the file or link.";
        if (isObjectUrl) URL.revokeObjectURL(src);
      };
    }

    videoFileInput.addEventListener("change", function () {
      const file = videoFileInput.files[0];
      if (!file) return;

      const objectUrl = URL.createObjectURL(file);
      videoPreview.src = objectUrl;
      videoPreview.style.display = "block";
      checkVideoDuration(objectUrl, true);

      videoUrlInput.value = "";
    });

    videoUrlInput.addEventListener("input", function () {
      const url = videoUrlInput.value.trim();
      if (url) {
        videoPreview.src = url;
        videoPreview.style.display = "block";
        checkVideoDuration(url, false);
        videoFileInput.value = "";
      } else {
        videoPreview.style.display = "none";
        videoWarningEl.textContent = "";
      }
    });

    // ===== Currency Settings (base currency + exchange rate) =====
    const baseCurrencySelect = document.getElementById("baseCurrencySelect");
    const rateInput = document.getElementById("exchangeRateInput");
    const rateError = document.getElementById("exchangeRateError");
    const saveRateBtn = document.getElementById("saveExchangeRateBtn");

    function updateCurrencyLabels(baseCurrency) {
      if (priceLabel) priceLabel.textContent = `Price (${baseCurrency})`;
      if (priceColumnHeader)
        priceColumnHeader.textContent = `Price (${baseCurrency})`;
    }

    if (baseCurrencySelect && rateInput && saveRateBtn) {
      getSiteSettings().then(function (settings) {
        baseCurrencySelect.value = settings.baseCurrency;
        rateInput.value = settings.usdToGhsRate;
        updateCurrencyLabels(settings.baseCurrency);
      });

      saveRateBtn.addEventListener("click", async function () {
        rateError.textContent = "";
        const newRate = parseFloat(rateInput.value);
        const newBaseCurrency = baseCurrencySelect.value;

        if (isNaN(newRate) || newRate <= 0) {
          rateError.style.color = "#d64545";
          rateError.textContent =
            "Please enter a valid positive exchange rate.";
          return;
        }

        saveRateBtn.disabled = true;
        try {
          const updated = await updateSiteSettings({
            baseCurrency: newBaseCurrency,
            usdToGhsRate: newRate,
          });
          updateCurrencyLabels(updated.baseCurrency);
          rateError.style.color = "#2e7d32";
          rateError.textContent = "Currency settings updated!";
          await renderTable();
        } catch (err) {
          rateError.style.color = "#d64545";
          rateError.textContent =
            err.message || "Failed to update currency settings.";
        } finally {
          saveRateBtn.disabled = false;
        }
      });
    }

    async function renderTable() {
      let products;
      try {
        products = await getProducts();
      } catch (err) {
        tableBody.innerHTML =
          '<tr class="empty-row"><td colspan="5">Could not load products. Is the backend running?</td></tr>';
        return;
      }

      const settings = await getSiteSettings();
      const currencySymbol = settings.baseCurrency === "GHS" ? "GH₵" : "$";

      tableBody.innerHTML = "";

      if (products.length === 0) {
        tableBody.innerHTML =
          '<tr class="empty-row"><td colspan="5">No products yet. Add your first one above.</td></tr>';
        return;
      }

      products.forEach(function (product) {
        const tr = document.createElement("tr");
        tr.dataset.id = product.id;

        const availabilityLabel =
          product.availability === "preorder"
            ? "Pre-Order"
            : "Available in Ghana";
        const availabilityClass =
          product.availability === "preorder" ? "preorder" : "ghana";

        tr.innerHTML = `
          <td>${product.name}</td>
          <td>${product.category}</td>
          <td><span class="availability-badge ${availabilityClass}">${availabilityLabel}</span></td>
          <td>${currencySymbol}<input type="number" class="price-input" min="0" step="0.01" value="${product.price.toFixed(2)}"></td>
          <td>
            <div class="row-actions">
              <button class="save-btn">Save</button>
              <button class="delete-btn">Delete</button>
            </div>
          </td>
        `;

        tableBody.appendChild(tr);
      });
    }

    tableBody.addEventListener("click", async function (e) {
      const row = e.target.closest("tr");
      if (!row) return;
      const id = row.dataset.id;

      if (e.target.classList.contains("save-btn")) {
        const newPrice = parseFloat(row.querySelector(".price-input").value);
        if (isNaN(newPrice) || newPrice < 0) return;

        e.target.disabled = true;
        try {
          await updateProduct(id, { price: newPrice });
          await renderTable();
        } catch (err) {
          alert(err.message || "Failed to update price.");
          e.target.disabled = false;
        }
      }

      if (e.target.classList.contains("delete-btn")) {
        if (!confirm("Delete this product? This cannot be undone.")) return;
        e.target.disabled = true;
        try {
          await deleteProduct(id);
          await renderTable();
        } catch (err) {
          alert(err.message || "Failed to delete product.");
          e.target.disabled = false;
        }
      }
    });

    addProductForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      addProductError.textContent = "";

      const name = document.getElementById("prodName").value.trim();
      const category = document.getElementById("prodCategory").value;
      const price = parseFloat(document.getElementById("prodPrice").value);
      const availability = availabilitySelect.value;
      const shipTime = document.getElementById("prodShipTime").value.trim();
      const description = document
        .getElementById("prodDescription")
        .value.trim();
      const tag = document.getElementById("prodTag").value;

      if (!name || !category || isNaN(price) || price < 0) {
        addProductError.textContent =
          "Please fill in product name, category, and a valid price.";
        return;
      }

      // Slot 1 must have either a file or a URL
      const slot1File = document.querySelector(
        '.prod-image-file[data-slot="1"]',
      ).files[0];
      const slot1Url = document
        .querySelector('.prod-image-url[data-slot="1"]')
        .value.trim();
      if (!slot1File && !slot1Url) {
        addProductError.textContent =
          "Please provide an image for Image 1 (upload a file or paste a URL).";
        return;
      }

      addProductSubmitBtn.disabled = true;
      addProductSubmitBtn.textContent = "Adding product...";

      try {
        // Resolve each of the 4 image slots to a final URL — uploading files as needed
        const images = [];
        for (let slot = 1; slot <= 4; slot++) {
          const fileInput = document.querySelector(
            `.prod-image-file[data-slot="${slot}"]`,
          );
          const urlInput = document.querySelector(
            `.prod-image-url[data-slot="${slot}"]`,
          );
          const file = fileInput.files[0];
          const url = urlInput.value.trim();

          if (file) {
            addProductSubmitBtn.textContent = `Uploading image ${slot}...`;
            const uploadedUrl = await uploadImageFile(file);
            images.push(uploadedUrl);
          } else if (url) {
            images.push(url);
          }
        }

        if (images.length === 0) {
          throw new Error("Please provide at least one product image.");
        }

        const fallbackImage = images[0];
        while (images.length < 4) {
          images.push(fallbackImage);
        }

        // Resolve the optional video — upload if a file was chosen, else use the pasted URL
        let video = "";
        const videoFile = videoFileInput.files[0];
        const videoUrl = videoUrlInput.value.trim();

        if (videoFile) {
          addProductSubmitBtn.textContent = "Uploading video...";
          video = await uploadVideoFile(videoFile);
        } else if (videoUrl) {
          video = videoUrl;
        }

        addProductSubmitBtn.textContent = "Saving product...";

        await createProduct({
          name,
          category,
          price,
          availability,
          tag,
          shipTime: availability === "preorder" ? shipTime : "",
          description,
          images,
          video,
        });

        await renderTable();
        addProductForm.reset();
        shipTimeGroup.style.display = "none";
        videoWarningEl.textContent = "";
        videoPreview.style.display = "none";
        videoPreview.src = "";
        document.querySelectorAll(".image-slot-preview").forEach(function (p) {
          p.style.display = "none";
          p.style.backgroundImage = "";
        });
      } catch (err) {
        addProductError.textContent = err.message || "Failed to add product.";
      } finally {
        addProductSubmitBtn.disabled = false;
        addProductSubmitBtn.textContent = "Add product";
      }
    });

    renderTable();

    // ===== Activity Log =====
    const activityLogList = document.getElementById("activityLogList");
    const activitySearch = document.getElementById("activitySearch");
    const activityFilterBtns = document.querySelectorAll(
      ".activity-filter-btn",
    );
    let activityCategory = "all";
    let activityPollTimer = null;

    const categoryColors = {
      Auth: "purple",
      Cart: "blue",
      Orders: "green",
      System: "amber",
    };

    function timeAgo(isoString) {
      const seconds = Math.floor((Date.now() - new Date(isoString)) / 1000);
      if (seconds < 60) return "just now";
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    }

    async function renderActivityLog() {
      const params = new URLSearchParams();
      if (activityCategory !== "all") params.set("category", activityCategory);
      if (activitySearch.value.trim())
        params.set("search", activitySearch.value.trim());

      let logs = [];
      try {
        const res = await fetch(
          `${API_BASE_URL}/activity?${params.toString()}`,
          {
            headers: { Authorization: `Bearer ${getAdminToken()}` },
          },
        );
        if (res.ok) logs = await res.json();
      } catch (err) {
        // fail silently — the log list just won't update this cycle
        return;
      }

      if (logs.length === 0) {
        activityLogList.innerHTML =
          '<p class="activity-empty">No activity yet — actions will appear here in real time.</p>';
        return;
      }

      activityLogList.innerHTML = logs
        .map(function (log) {
          const color = categoryColors[log.category] || "grey";
          return `
          <div class="activity-row activity-${color}">
            <span class="activity-badge activity-badge-${color}">${log.category}</span>
            <div class="activity-main">
              <span class="activity-action">${log.action}</span>
              <span class="activity-meta">${log.user}${log.details ? " — " + log.details : ""}</span>
            </div>
            <span class="activity-time">${timeAgo(log.createdAt)}</span>
          </div>
        `;
        })
        .join("");
    }

    activityFilterBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        activityFilterBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        activityCategory = btn.dataset.category;
        renderActivityLog();
      });
    });

    let searchDebounce;
    activitySearch.addEventListener("input", function () {
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(renderActivityLog, 300);
    });

    // ===== Orders management =====
    const ordersList = document.getElementById("ordersList");
    const noOrdersAdmin = document.getElementById("noOrdersAdmin");
    const ordersCountPill = document.getElementById("ordersCountPill");
    const STATUS_OPTIONS = ["Processing", "Shipped", "Delivered", "Cancelled"];

    async function renderOrders() {
      let orders = [];
      try {
        const res = await fetch(`${API_BASE_URL}/orders`, {
          headers: { Authorization: `Bearer ${getAdminToken()}` },
        });
        if (res.ok) orders = await res.json();
      } catch (err) {
        return;
      }

      const settings = await getSiteSettings();
      const symbol = settings.baseCurrency === "USD" ? "$" : "GH₵";

      ordersCountPill.textContent = `${orders.length} order${orders.length === 1 ? "" : "s"}`;

      if (orders.length === 0) {
        ordersList.innerHTML = "";
        noOrdersAdmin.style.display = "block";
        return;
      }

      noOrdersAdmin.style.display = "none";

      ordersList.innerHTML = orders
        .map(function (order) {
          const itemsHTML = order.items
            .map(function (item) {
              return `
            <div class="order-item-thumb">
              <div class="order-item-image" style="background-image:url('${item.image || ""}')"></div>
              <div class="order-item-info">
                <span class="order-item-name">${item.name}</span>
                <span class="order-item-qty">Qty: ${item.qty}</span>
              </div>
            </div>
          `;
            })
            .join("");

          const statusOptionsHTML = STATUS_OPTIONS.map(function (s) {
            return `<option value="${s}" ${s === order.status ? "selected" : ""}>${s}</option>`;
          }).join("");

          const date = new Date(order.createdAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          });

          return `
          <div class="admin-order-card" data-id="${order._id}">
            <div class="admin-order-top">
              <div>
                <span class="admin-order-number">${order.orderNumber}</span>
                <span class="admin-order-date">${date}</span>
              </div>
              <select class="order-status-select">${statusOptionsHTML}</select>
            </div>

            <div class="admin-order-customer">
              <strong>${order.customerName}</strong> — ${order.customerContact}
              <div class="admin-order-address">${order.address}</div>
            </div>

            <div class="order-items-row">${itemsHTML}</div>

            <div class="admin-order-bottom">
              <span class="admin-order-payment">Paid via ${order.paymentMethod === "momo" ? "Mobile Money" : order.paymentMethod === "card" ? "Card" : "Cash on Delivery"}</span>
              <span class="admin-order-total">${symbol}${order.total.toFixed(2)}</span>
            </div>
          </div>
        `;
        })
        .join("");

      ordersList
        .querySelectorAll(".order-status-select")
        .forEach(function (select) {
          select.addEventListener("change", async function () {
            const card = select.closest(".admin-order-card");
            const orderId = card.dataset.id;
            select.disabled = true;

            try {
              await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${getAdminToken()}`,
                },
                body: JSON.stringify({ status: select.value }),
              });
            } catch (err) {
              alert("Failed to update order status.");
            } finally {
              select.disabled = false;
            }
          });
        });
    }

    renderOrders();

    // ===== New-order toast + sound, piggybacking on the existing activity poll =====
    const newOrderToast = document.getElementById("newOrderToast");
    let latestKnownOrderLogId = null;
    let firstActivityCheck = true;

    function playNewOrderSound() {
      // Two-tone beep using the Web Audio API — no audio file needed.
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        [880, 1175].forEach(function (freq, i) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.frequency.value = freq;
          osc.type = "sine";
          gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.15);
          gain.gain.exponentialRampToValueAtTime(
            0.001,
            ctx.currentTime + i * 0.15 + 0.25,
          );
          osc.connect(gain).connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.15);
          osc.stop(ctx.currentTime + i * 0.15 + 0.25);
        });
      } catch (err) {
        /* audio not available — silently skip */
      }
    }

    function showNewOrderToast(message) {
      newOrderToast.textContent = message;
      newOrderToast.classList.add("show");
      setTimeout(function () {
        newOrderToast.classList.remove("show");
      }, 6000);
    }

    async function checkForNewOrders() {
      try {
        const res = await fetch(`${API_BASE_URL}/activity?category=Orders`, {
          headers: { Authorization: `Bearer ${getAdminToken()}` },
        });
        if (!res.ok) return;
        const logs = await res.json();
        if (logs.length === 0) return;

        const newest = logs[0];

        if (firstActivityCheck) {
          latestKnownOrderLogId = newest._id;
          firstActivityCheck = false;
          return;
        }

        if (
          newest._id !== latestKnownOrderLogId &&
          newest.action === "Order placed"
        ) {
          latestKnownOrderLogId = newest._id;
          playNewOrderSound();
          showNewOrderToast(`🛍️ New order: ${newest.details}`);
          renderOrders();
        } else {
          latestKnownOrderLogId = newest._id;
        }
      } catch (err) {
        /* silently skip this cycle */
      }
    }

    checkForNewOrders();
    setInterval(checkForNewOrders, 8000);

    renderActivityLog();
    activityPollTimer = setInterval(renderActivityLog, 8000); // feels "live" without needing websockets
  }
});
