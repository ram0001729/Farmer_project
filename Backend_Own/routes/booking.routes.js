const express = require("express");
const router = express.Router();
const bookingCtrl = require("../controllers/booking.controller");
const { authenticate } = require('../middlewares/auth.middleware');

router.post("/", authenticate, bookingCtrl.createBooking);
router.patch("/:id/confirm", authenticate, bookingCtrl.confirmBooking);
router.patch("/:id/start", authenticate, bookingCtrl.startBooking);
router.patch("/:id/complete", authenticate, bookingCtrl.completeBooking);
router.patch("/:id/cancel", authenticate, bookingCtrl.cancelBooking);
router.get("/me", authenticate, bookingCtrl.getMyBookings);
router.get("/:id", authenticate, bookingCtrl.getBookingById);
router.get("/provider", authenticate, bookingCtrl.getProviderBookings);

module.exports = router;
