const mongoose = require('mongoose');

const fuelLogSchema = new mongoose.Schema(
  {
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', default: null },
    litersAdded: { type: Number, required: true, min: 0.01 },
    totalCost: { type: Number, required: true, min: 0 },
    odometerReading: { type: Number, required: true, min: 0 },
    loggedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

fuelLogSchema.index({ vehicleId: 1, createdAt: -1 });

module.exports = mongoose.model('FuelLog', fuelLogSchema);