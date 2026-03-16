const Booking = require("../models/Booking.model");
const Listing = require("../models/Listing.model");
const Payment = require("../models/Payment.model");

const mongoose = require("mongoose");
const { getIO } = require("../utils/socket");

const toIdString = (value) => (value ? value.toString() : "");
const isSameId = (left, right) => toIdString(left) === toIdString(right);


exports.createBooking = async (req, res) => {
  try {
    const { listingId, startAt, endAt, area, paymentType, destinationCoordinates } = req.body;

    if (!listingId)
      return res.status(400).json({ error: "listingId is required" });

    if (!paymentType)
      return res.status(400).json({ error: "paymentType is required" });

    const listing = await Listing.findById(listingId);

    if (!listing)
      return res.status(404).json({ error: "Listing not found" });

    if (!listing.providerRole)
      return res.status(400).json({ error: "Listing missing providerRole" });

    const hasDestinationCoordinates =
      Array.isArray(destinationCoordinates) &&
      destinationCoordinates.length === 2 &&
      Number.isFinite(Number(destinationCoordinates[0])) &&
      Number.isFinite(Number(destinationCoordinates[1]));

    const bookingDestination = hasDestinationCoordinates
      ? [Number(destinationCoordinates[0]), Number(destinationCoordinates[1])]
      : listing.location.coordinates;

    const booking = await Booking.create({
      listingId: listing._id,
      farmerId: req.user.userId,
      providerId: listing.ownerId,
      providerRole: listing.providerRole,  // ✅ THIS MUST EXIST
      price: listing.price,
      location: {
        type: "Point",
        coordinates: bookingDestination,
      },
      startAt,
      endAt,
      area,
      paymentType,
      paymentStatus: paymentType === "offline" ? "paid" : "pending",
      status: paymentType === "offline" ? "confirmed" : "pending",
      createdBy: req.user.userId,
    });

    // Create Payment record for offline (cash/COD) so it appears in payment history
    if (paymentType === "offline") {
      await Payment.create({
        bookingId: booking._id,
        payerId: req.user.userId,
        payeeId: listing.ownerId,
        amount: listing.price,
        method: "offline_payment",
        status: "success",
      });
    }

      // Emit real-time notification to the provider
      try {
        getIO().to(`user:${listing.ownerId.toString()}`).emit("new_booking", {
          bookingId: booking._id,
          farmerName: req.user.name || "A farmer",
          listingTitle: listing.title || listing.providerRole,
          paymentType,
          price: listing.price,
          createdAt: booking.createdAt,
        });
      } catch (_) {
        // Socket may not be init in tests — safe to ignore
      }

    res.status(201).json({
      success: true,
      bookingId: booking._id,
      booking,
    });

  } catch (err) {
    console.error("BOOKING ERROR FULL:", err);
    res.status(500).json({ error: err.message });
  }
};


exports.confirmBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking)
      return res.status(404).json({ error: "Booking not found" });

    // Only provider can confirm the booking
    if (!isSameId(booking.providerId, req.user.userId))
      return res.status(403).json({ error: "Not authorized" });

    if (booking.status !== "pending")
      return res.status(400).json({ error: "Booking not pending" });

    booking.status = "confirmed";
    booking.confirmedAt = new Date();
    await booking.save();

    res.json({
      success: true,
      message: "Booking confirmed",
      booking,
    });
  } catch (err) {
    res.status(500).json({ error: "Confirmation failed" });
  }
};



exports.startBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking)
      return res.status(404).json({ error: "Booking not found" });

    // Only provider can start the booking
    if (!isSameId(booking.providerId, req.user.userId))
      return res.status(403).json({ error: "Not authorized" });

    if (booking.status !== "confirmed")
      return res.status(400).json({ error: "Booking not confirmed yet" });

    booking.status = "started";
    booking.startAt = new Date();

    await booking.save();

    res.json({
      success: true,
      message: "Booking started",
      booking,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to start booking" });
  }
};




exports.completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking)
      return res.status(404).json({ error: "Booking not found" });

    // Only provider can mark completion
    if (!isSameId(booking.providerId, req.user.userId))
      return res.status(403).json({ error: "Not authorized" });

    if (booking.status !== "started")
      return res.status(400).json({ error: "Booking not started" });

    booking.status = "completed";
    booking.endAt = new Date();

    await booking.save();

    res.json({
      success: true,
      message: "Booking completed",
      booking,
    });
  } catch (err) {
    res.status(500).json({ error: "Completion failed" });
  }
};




exports.cancelBooking = async (req, res) => {
  try {
    const DRIVER_CANCEL_WINDOW_MS = 9 * 60 * 60 * 1000;
    const booking = await Booking.findById(req.params.id);

    if (!booking)
      return res.status(404).json({ error: "Booking not found" });

    // Only the farmer or provider can cancel
    if (!isSameId(booking.farmerId, req.user.userId) && !isSameId(booking.providerId, req.user.userId)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    if (booking.status === "completed")
      return res.status(400).json({ error: "Cannot cancel completed booking" });

    const isFarmerCancelling = isSameId(booking.farmerId, req.user.userId);
    if (isFarmerCancelling && booking.providerRole === "driver") {
      const bookingAgeMs = Date.now() - new Date(booking.createdAt).getTime();
      if (bookingAgeMs > DRIVER_CANCEL_WINDOW_MS) {
        return res.status(400).json({
          error: "Farmer can cancel driver booking only within 9 hours",
        });
      }
    }

    // If cancellationAllowedUntil exists, enforce it
    if (
      booking.cancellationAllowedUntil &&
      new Date() > booking.cancellationAllowedUntil
    ) {
      return res.status(400).json({
        error: "Cancellation window expired",
      });
    }

    booking.status = "cancelled";
    await booking.save();

    res.json({
      success: true,
      message: "Booking cancelled",
      booking,
    });
  } catch (err) {
    res.status(500).json({ error: "Cancellation failed" });
  }
};



exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("listingId", "title providerRole price priceUnit")
      .populate("providerId", "name");

    if (!booking)
      return res.status(404).json({ error: "Booking not found" });

    if (!isSameId(booking.farmerId, req.user.userId))
      return res.status(403).json({ error: "Not authorized" });

    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch booking" });
  }
};





exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      farmerId: req.user.userId,
    })
      .populate("providerId", "name mobile role")
      .populate("listingId", "title mobile providerRole experience price priceUnit available rating location locationName")
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });

  } catch (err) {
    console.error("GET MY BOOKINGS ERROR:", err);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
};







// GET /api/bookings/provider
exports.getProviderBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      providerId: req.user.userId,
    })
      .populate("farmerId", "name mobile email")
      .populate("listingId", "title providerRole available price")
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
};
