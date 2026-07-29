const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: { type: String, required: true }, // snapshot at time of order
    image: { type: String, default: "" }, // snapshot of the product's main photo at time of order
    qty: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true }, // snapshot at time of order
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true }, // e.g. "BE-123456"
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional — guest checkout allowed
    customerName: { type: String, required: true },
    customerContact: { type: String, required: true },
    address: { type: String, required: true },
    // 'cod' kept in the enum for backward compatibility with any orders
    // already placed before Cash on Delivery was removed as a checkout option
    paymentMethod: {
      type: String,
      enum: ["momo", "card", "cod"],
      required: true,
    },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    shipping: { type: Number, required: true },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Processing",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);
