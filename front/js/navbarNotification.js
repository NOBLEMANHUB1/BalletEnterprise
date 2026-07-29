document.addEventListener("DOMContentLoaded", () => {
  const badge = document.getElementById("notificationBadge");

  if (!badge) return;

  async function loadNotificationCount() {
    const session = getCustomerSession();

    if (!session || !session.id) {
      badge.style.display = "none";
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/notifications/${session.id}`, {
        headers: {
          Authorization: `Bearer ${getCustomerToken()}`,
        },
      });

      const notifications = await res.json();

      const unread = notifications.filter((n) => !n.isRead).length;

      if (unread > 0) {
        badge.style.display = "flex";
        badge.textContent = unread;
      } else {
        badge.style.display = "none";
      }
    } catch (err) {
      console.error(err);
    }
  }

  loadNotificationCount();

  setInterval(loadNotificationCount, 30000);
});
