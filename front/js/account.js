document.addEventListener("DOMContentLoaded", async function () {
  const signedOutEl = document.getElementById("accountSignedOut");
  const contentEl = document.getElementById("accountContent");
  const orderListEl = document.getElementById("orderList");
  const noOrdersEl = document.getElementById("noOrders");
  const notificationList = document.getElementById("notificationList");

  if (!signedOutEl || !contentEl) return;

  const session = getCustomerSession();

  if (!session || !getCustomerToken()) {
    signedOutEl.style.display = "block";
    contentEl.style.display = "none";
    return;
  }

  signedOutEl.style.display = "none";
  contentEl.style.display = "block";

  document.getElementById("accountName").textContent =
    `Welcome back, ${session.name}`;

  document.getElementById("accountContact").textContent = session.contact;

  document
    .getElementById("accountLogoutBtn")
    .addEventListener("click", function () {
      clearCustomerSession();
      clearCustomerToken();
      window.location.href = "index.html";
    });

  // -------------------------
  // Load Orders
  // -------------------------

  let orders = [];

  try {
    orders = await getMyOrders();
  } catch (err) {
    console.error(err);
    orders = [];
  }

  if (orders.length === 0) {
    if (noOrdersEl) noOrdersEl.style.display = "block";
  } else {
    if (noOrdersEl) noOrdersEl.style.display = "none";
  }

  function formatDate(date) {
    return new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function progress(status) {
    const stages = [
      "Pending",
      "Confirmed",
      "Processing",
      "Packed",
      "Shipped",
      "Out for Delivery",
      "Delivered",
    ];

    const current = stages.indexOf(status);

    return stages
      .map((stage, index) => {
        return `
          <div class="track-step ${index <= current ? "active" : ""}">
            ${stage}
          </div>
        `;
      })
      .join("");
  }

  const html = await Promise.all(
    orders.map(async (order) => {
      const total = await formatPrice(order.total);

      const items = order.items.map((i) => `${i.name} ×${i.qty}`).join(", ");

      return `
      <div class="order-card">

        <div class="order-card-top">
          <div>
            <strong>${order.orderNumber}</strong><br>
            <small>${formatDate(order.createdAt)}</small>
          </div>

          <span class="order-status">
            ${order.status}
          </span>
        </div>

        <p>${items}</p>

        <div class="order-progress">
          ${progress(order.status)}
        </div>

        <div class="order-card-bottom">

          <span>
            ${order.paymentMethod === "momo" ? "Mobile Money" : "Card"}
          </span>

          <strong>${total}</strong>

        </div>

      </div>
      `;
    }),
  );

  if (orderListEl) {
    orderListEl.innerHTML = html.join("");
  }

  // -------------------------
  // Notifications
  // -------------------------

  if (notificationList && session.id) {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/${session.id}`);

      const notifications = await res.json();

      if (!notifications.length) {
        notificationList.innerHTML = "<p>No notifications yet.</p>";
      } else {
        notificationList.innerHTML = notifications
          .map(
            (n) => `
            <div class="notification-card ${n.isRead ? "" : "unread"}">

              <h4>${n.title}</h4>

              <p>${n.message}</p>

              <small>
                ${new Date(n.createdAt).toLocaleString()}
              </small>

              <div class="notification-actions">

                ${
                  !n.isRead
                    ? `<button onclick="markNotificationRead('${n._id}')">
                        Mark Read
                      </button>`
                    : ""
                }

                <button onclick="deleteNotification('${n._id}')">
                  Delete
                </button>

              </div>

            </div>
          `,
          )
          .join("");
      }
    } catch (err) {
      console.error(err);
    }
  }
});

// -------------------------
// Notification Functions
// -------------------------

async function markNotificationRead(id) {
  try {
    await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: "PUT",
    });

    location.reload();
  } catch (err) {
    console.error(err);
  }
}

async function deleteNotification(id) {
  if (!confirm("Delete this notification?")) return;

  try {
    await fetch(`${API_BASE_URL}/notifications/${id}`, {
      method: "DELETE",
    });

    location.reload();
  } catch (err) {
    console.error(err);
  }
}
