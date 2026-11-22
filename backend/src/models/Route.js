const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema(
  {
    stopName: { type: String, required: true, trim: true },
    sequenceOrder: { type: Number, required: true, min: 1 },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: (v) => Array.isArray(v) && v.length === 2,
          message: 'coordinates must be [longitude, latitude]',
        },
      },
    },
    geofenceRadiusMeters: { type: Number, default: 100, min: 0 },
  },
  { _id: true }
);

const routeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    shiftType: { type: String, enum: ['am', 'pm'], required: true },
    stops: {
      type: [stopSchema],
      validate: [(v) => v.length > 0, 'Route must have at least one stop'],
    },
    isActive: { type: Boolean, default: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

routeSchema.index({ 'stops.location': '2dsphere' });

module.exports = mongoose.model('Route', routeSchema);