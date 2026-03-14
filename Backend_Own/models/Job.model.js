const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  slug: { type: String, index: true },
  category: { type: String }, // tractor, labour, ploughing, harvest, etc.
  description: String,
  basePrice: Number,
  priceUnit: { type: String, enum: ['hour','day','fixed'], default: 'hour' },
  durationDefault: Number, // default duration in units
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // who created the service (provider/admin)
}, { timestamps: true });

module.exports = mongoose.model('Job', JobSchema);
