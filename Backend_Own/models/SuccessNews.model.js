const mongoose = require("mongoose");

const SuccessNewsSchema = new mongoose.Schema(
  {
    farmerName: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    crop: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    summary: { type: String, required: true, trim: true },
    impact: { type: String, default: "" },
    source: { type: String, default: "" },
    link: { type: String, default: "" },
    image: { type: String, default: "" },
    isPublished: { type: Boolean, default: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SuccessNews", SuccessNewsSchema);
