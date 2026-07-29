// frontend/js/Notification.js

async function loadNotifications() {
  const notificationList = document.getElementById("notificationList");
  const noNotifications = document.getElementById("noNotifications");

  if (!notificationList) return;

  const session = getCustomerSession();

  if (!session || !session.id) {
    notificationList.innerHTML = "";
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/notifications/${session.id}`, {
      headers: {
        Authorization: `Bearer ${getCustomerToken()}`,
      },
    });

    const notifications = await res.json();

    if (!notifications.length) {
      notificationList.innerHTML = "";
      if (noNotifications) noNotifications.style.display = "block";
      return;
    }

    if (noNotifications) noNotifications.style.display = "none";

    notificationList.innerHTML = notifications
      .map(
        (n) => `
        <div class="notification-card ${n.isRead ? "" : "unread"}">

            <div class="notification-title">
                ${n.title}
            </div>

            <div class="notification-message">
                ${n.message}
            </div>

            <div class="notification-footer">

                <small>
                    ${new Date(n.createdAt).toLocaleString()}
                </small>

                <div>

                    ${
                      !n.isRead
                        ? `
                        <button onclick="markNotificationRead('${n._id}')">
                            Mark as Read
                        </button>
                    `
                        : ""
                    }

                    <button onclick="deleteNotification('${n._id}')">
                        Delete
                    </button>

                </div>

            </div>

        </div>
    `,
      )
      .join("");
  } catch (err) {
    console.error(err);
  }
}

async function markNotificationRead(id) {
  try {
    await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getCustomerToken()}`,
      },
    });

    loadNotifications();
  } catch (err) {
    console.error(err);
  }
}

async function deleteNotification(id) {
  try {
    await fetch(`${API_BASE_URL}/notifications/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getCustomerToken()}`,
      },
    });

    loadNotifications();
  } catch (err) {
    console.error(err);
  }
}

async function markAllNotificationsRead() {
  const session = getCustomerSession();

  if (!session) return;

  try {
    const res = await fetch(`${API_BASE_URL}/notifications/${session.id}`, {
      headers: {
        Authorization: `Bearer ${getCustomerToken()}`,
      },
    });

    const notifications = await res.json();

    for (const notification of notifications) {
      if (!notification.isRead) {
        await fetch(`${API_BASE_URL}/notifications/${notification._id}/read`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${getCustomerToken()}`,
          },
        });
      }
    }

    loadNotifications();
  } catch (err) {
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("markAllReadBtn");

  if (btn) {
    btn.addEventListener("click", markAllNotificationsRead);
  }

  loadNotifications();

  // Refresh notifications every 30 seconds
  setInterval(loadNotifications, 30000);
});
