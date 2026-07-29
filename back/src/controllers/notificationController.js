const Notification = require("../models/Notification");

// GET all notifications for a customer
async function getNotifications(req, res, next) {
  try {
    const { userId } = req.params;

    const notifications = await Notification.find({
      user: userId,
    }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    next(err);
  }
}

// Mark notification as read
async function markAsRead(req, res, next) {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    notification.isRead = true;

    await notification.save();

    res.json(notification);
  } catch (err) {
    next(err);
  }
}

// Delete notification
async function deleteNotification(req, res, next) {
  try {
    await Notification.findByIdAndDelete(req.params.id);

    res.json({
      message: "Notification deleted",
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getNotifications,
  markAsRead,
  deleteNotification,
};
