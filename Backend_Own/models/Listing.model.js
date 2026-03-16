const mongoose = require('mongoose');

const ListingSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
   
  title: { type: String, required: true },
  mobile: { type: String, required: true },  
  
  
  providerRole: {
    type: String,
    enum: ['labour', 'driver', 'equipment_provider'],
    required: true
  },


  description: String,
  experience:String,
  price: Number, 
  priceUnit: { type: String, enum: ['hour','day','fixed'], default: 'hour' },
  available: { type: Boolean, default: true },
  locationName: {
    type: String,
    trim: true,
  },
location: {
  type: { type: String, enum: ['Point'], default: 'Point' },
coordinates: {
  type: [Number],
  required: true
}
},
  vehicleDetails: {
  model: {
    type: String,
    trim: true,
  },
  regNumber: {
    type: String,
    trim: true,
  },
  condition: {
    type: String,
    enum: ["bad", "good", "best"],
    required: false,
    default: undefined,
  },
},

  rating: { type: Number, default: 0 },
  meta: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

ListingSchema.index({ location: '2dsphere' });
module.exports = mongoose.model('Listing', ListingSchema);
