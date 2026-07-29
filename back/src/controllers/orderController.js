const Order = require("../models/Order");
const Setting = require("../models/Setting");
const logActivity = require("../utils/logActivity");
const { sendAdminOrderNotification } = require("../utils/emailService");
const Notification = require("../models/Notification");

function generateOrderNumber() {
  return "BE-" + Math.floor(100000 + Math.random() * 900000);
}

// POST /api/orders — place an order (works for logged-in users or guests)
async function createOrder(req, res, next) {
  try {
    const {
      customerName,
      customerContact,
      address,
      paymentMethod,
      items,
      subtotal,
      shipping,
      total,
    } = req.body;

    if (!items || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Cannot place an order with no items." });
    }

    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      user: req.user ? req.user._id : undefined,
      customerName,
      customerContact,
      address,
      paymentMethod,
      items,
      subtotal,
      shipping,
      total,
    });
    if (order.user) {
      await Notification.create({
        user: order.user,
        order: order._id,
        title: "Order Received",
        message: `Your order ${order.orderNumber} has been received successfully.`,
        type: "order",
      });
    }
    const settings = await Setting.findOne();
    const currencySymbol =
      settings && settings.baseCurrency === "USD" ? "$" : "GH₵";

    logActivity({
      category: "Orders",
      action: "Order placed",
      user: `${customerName} (${customerContact})`,
      details: `${order.orderNumber} — ${items.length} item${items.length === 1 ? "" : "s"}, total ${currencySymbol}${total.toFixed(2)}, paid via ${paymentMethod}.`,
      req,
    });

    // Best-effort — a failed notification email should never block the order itself
    sendAdminOrderNotification(order, currencySymbol).catch(function (err) {
      console.error(
        "Failed to send admin order notification email:",
        err.message,
      );
    });

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
}

// GET /api/orders/mine — logged-in customer's own order history
async function getMyOrders(req, res, next) {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (err) {
    next(err);
  }
}

// GET /api/orders — admin only, all orders
async function getAllOrders(req, res, next) {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    next(err);
  }
}

// PUT /api/orders/:id/status — admin only
// PUT /api/orders/:id/status — admin only
async function updateOrderStatus(req, res, next) {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    order.status = req.body.status;

    await order.save();

    logActivity({
      category: "Orders",
      action: "Order status updated",
      user: "Admin",
      details: `${order.orderNumber} marked as ${order.status}.`,
      req,
    });

    // Notification titles/messages
    const notifications = {
      Pending: {
        title: "Order Pending",
        message: `Your order ${order.orderNumber} is awaiting confirmation.`,
      },

      Confirmed: {
        title: "Order Confirmed",
        message: `Your order ${order.orderNumber} has been confirmed.`,
      },

      Processing: {
        title: "Order Processing",
        message: `We're preparing your order ${order.orderNumber}.`,
      },

      Packed: {
        title: "Order Packed",
        message: `Your order ${order.orderNumber} has been packed.`,
      },

      Shipped: {
        title: "Order Shipped",
        message: `Good news! Your order ${order.orderNumber} has been shipped.`,
      },

      "Out for Delivery": {
        title: "Out for Delivery",
        message: `Your order ${order.orderNumber} is out for delivery.`,
      },

      Delivered: {
        title: "Order Delivered",
        message: `Your order ${order.orderNumber} has been delivered successfully.`,
      },

      Cancelled: {
        title: "Order Cancelled",
        message: `Your order ${order.orderNumber} has been cancelled.`,
      },
    };

    if (order.user && notifications[order.status]) {
      await Notification.create({
        user: order.user,
        order: order._id,
        title: notifications[order.status].title,
        message: notifications[order.status].message,
        type: "order",
      });
    }

    res.json(order);
  } catch (err) {
    next(err);
  }
}

module.exports = { createOrder, getMyOrders, getAllOrders, updateOrderStatus };
