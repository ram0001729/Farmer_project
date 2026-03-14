const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    providerRole: {
      type: String,
      enum: ["labour", "driver", "equipment_provider"],
      required: true,
    },

    

    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },

    startAt: {
      type: Date,
      required: true,
    },

    endAt: {
      type: Date,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    area: {
      value: { type: String, required: true },
      label: String,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "started", "completed", "cancelled"],
      default: "pending",
    },
paymentType: {
  type: String,
  enum: ["online", "offline"],
  required: true,
},

paymentStatus: {
  type: String,
  enum: ["pending", "paid", "failed"],
  default: "pending",
},
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    confirmedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", BookingSchema);
