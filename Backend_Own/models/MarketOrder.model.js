const mongoose = require("mongoose");

const MarketOrderSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MarketItem",
      required: true,
      index: true,
    },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    orderType: {
      type: String,
      enum: ["purchase", "rental"],
      default: "purchase",
      index: true,
    },
    rentalDuration: { type: Number, min: 1, default: null },
    rentalUnit: {
      type: String,
      enum: ["hour", "day", "week", null],
      default: null,
    },
    unitPrice: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: ["online", "offline"],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["placed", "confirmed", "cancelled"],
      default: "placed",
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MarketOrder", MarketOrderSchema);
