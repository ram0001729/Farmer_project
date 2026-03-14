 const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  payerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  payeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  method:{type:String,enum:['online_payment','offline_payment']},

  status: { type: String, enum: ['initiated','success','failed','refunded'], default: 'initiated' },
  transactionRef: String,
  meta: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

PaymentSchema.index({ bookingId: 1 });
module.exports = mongoose.model('Payment', PaymentSchema);
