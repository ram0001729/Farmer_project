const mongoose = require("mongoose");

const MarketItemSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["fertilizer", "equipment"],
      required: true,
      index: true,
    },
    description: { type: String, default: "" },
    brand: { type: String, default: "" },
    bestFor: { type: String, default: "" },
    image: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true, default: "per unit" },
    rentalAvailable: { type: Boolean, default: false },
    rentalPrice: { type: Number, min: 0, default: 0 },
    rentalUnit: {
      type: String,
      enum: ["hour", "day", "week"],
      default: "day",
    },
    minimumRentalPeriod: { type: Number, min: 1, default: 1 },
    stockQty: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true, index: true },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MarketItem", MarketItemSchema);
