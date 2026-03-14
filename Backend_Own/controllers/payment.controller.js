const Payment = require('../models/Payment.model');
const Booking = require('../models/Booking.model');
const { getRazorpay, isConfigured } = require("../utils/razorpay");
const crypto = require("crypto");

/**
 * INITIATE PAYMENT (Farmer)
 * status → initiated
 */
exports.initiatePayment = async (req, res) => {
  try {
    const { bookingId, amount, method } = req.body;

    if (!bookingId || !amount || !method)
      return res.status(400).json({ error: 'Missing required fields' });

    if (req.user.role !== 'farmer')
      return res.status(403).json({ error: 'Only farmers can initiate payment' });

    const booking = await Booking.findById(bookingId);

    if (!booking)
      return res.status(404).json({ error: 'Booking not found' });

    // ✅ Payment allowed only when booking is pending
    if (booking.status !== 'pending')
      return res.status(400).json({
        error: 'Payment allowed only for pending bookings'
      });

    const payment = await Payment.create({
      bookingId,
      payerId: req.user.userId,
      payeeId: booking.providerId,
      amount,
      method,
      status: 'initiated'
    });

    res.status(201).json({
      success: true,
      payment
    });

  } catch (err) {
    res.status(500).json({ error: 'Payment initiation failed' });
  }
};



exports.createRazorpayOrder = async (req, res) => {
  try {
    if (!isConfigured())
      return res.status(503).json({ error: "Payment gateway not configured. Add Razorpay keys to .env" });

    const { bookingId } = req.body;

    if (!bookingId)
      return res.status(400).json({ error: "BookingId required" });

    const booking = await Booking.findById(bookingId);
    if (!booking)
      return res.status(404).json({ error: "Booking not found" });

    if (booking.status !== "pending")
      return res.status(400).json({ error: "Booking not payable" });

    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: booking.price * 100,
      currency: "INR",
      receipt: `receipt_${bookingId}`,
    });

    // 🔥 Create payment record linked to Razorpay order
    const payment = await Payment.create({
      bookingId,
      payerId: req.user.userId,
      payeeId: booking.providerId,
      amount: booking.price,
      method: "online_payment",
      status: "initiated",
      transactionRef: order.id, // store razorpay_order_id
    });

    res.json({
      success: true,
      order,
      paymentId: payment._id,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create order" });
  }
};





exports.markPaymentSuccess = async (req, res) => {
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret || keySecret === "xxxx")
      return res.status(503).json({ error: "Payment verification not configured" });

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature)
      return res.status(400).json({ error: "Invalid signature" });

    // Find payment using razorpay_order_id
    const payment = await Payment.findOne({
      transactionRef: razorpay_order_id,
    });

    if (!payment)
      return res.status(404).json({ error: "Payment not found" });

    payment.status = "success";
    payment.transactionRef = razorpay_payment_id; // store actual payment id
    await payment.save();

    await Booking.findByIdAndUpdate(payment.bookingId, {
      status: "confirmed",
    });

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Payment verification failed" });
  }
};






exports.markPaymentFailed = async (req, res) => {
  try {
    const { paymentId, meta } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment)
      return res.status(404).json({ error: 'Payment not found' });

    payment.status = 'failed';
    payment.meta = meta || {};
    await payment.save();

    res.json({
      success: true,
      message: 'Payment failed',
      payment
    });

  } catch (err) {
    res.status(500).json({ error: 'Failed to update payment status' });
  }
};





exports.refundPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment)
      return res.status(404).json({ error: 'Payment not found' });

    payment.status = 'refunded';
    await payment.save();

    res.json({
      success: true,
      message: 'Payment refunded',
      payment
    });

  } catch (err) {
    res.status(500).json({ error: 'Refund failed' });
  }
};

exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ payerId: req.user.userId })
      .populate({ path: 'bookingId', populate: { path: 'listingId', select: 'title providerRole' } })
      .populate('payeeId', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, payments });

  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};

/** GET /api/payments/config - Returns Razorpay key for frontend (public key only) */
exports.getPaymentConfig = async (req, res) => {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    res.json({
      success: true,
      razorpayKeyId: keyId && keyId !== "xxxx" ? keyId : null,
      isConfigured: isConfigured(),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch config' });
  }
};

/** GET /api/payments/provider/earnings - Provider's received payments */
exports.getProviderEarnings = async (req, res) => {
  try {
    const payments = await Payment.find({ payeeId: req.user.userId })
      .populate({ path: 'bookingId', populate: { path: 'listingId', select: 'title providerRole' } })
      .populate('payerId', 'name')
      .sort({ createdAt: -1 });

    const totalEarnings = payments
      .filter(p => p.status === 'success')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const pendingAmount = payments
      .filter(p => p.status === 'initiated')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const thisMonthEarnings = payments
      .filter(p => p.status === 'success' && new Date(p.createdAt).getMonth() === thisMonth && new Date(p.createdAt).getFullYear() === thisYear)
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    res.json({
      success: true,
      payments,
      stats: {
        totalEarnings,
        pendingAmount,
        thisMonthEarnings,
        walletBalance: totalEarnings - pendingAmount,
      },
    });
  } catch (err) {
    console.error('GET PROVIDER EARNINGS ERROR:', err);
    res.status(500).json({ error: 'Failed to fetch earnings' });
  }
};

