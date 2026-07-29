const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: [
        'Kitchen Appliances',
        'Phones',
        'Phone Accessories',
        'Laptops',
        'Laptop Accessories',
        'TVs',
        'TV Accessories'
      ]
    },
    price: { type: Number, required: true, min: 0 },
    availability: { type: String, enum: ['ghana', 'preorder'], required: true },
    tag: { type: String, default: '' }, // e.g. "New", "Best Seller", "Limited"
    shipTime: { type: String, default: '' }, // only relevant when availability === 'preorder'
    description: { type: String, default: '' },
    images: {
      type: [String],
      validate: {
        validator: (arr) => arr.length >= 1,
        message: 'At least one product image is required.'
      }
    },
    video: { type: String, default: '' } // optional, admin-provided (.mp4), max ~3 min by convention
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);