const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    plateNumber: { type: String, required: true, trim: true },
    makeModel: { type: String, required: true, trim: true },
    capacity: { type: Number, required: true, min: 1 },
    fuelTankCapacity: { type: Number, required: true, min: 0 },
    currentOdometer: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ['active', 'maintenance', 'out-of-service'], default: 'active' },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

vehicleSchema.index({ plateNumber: 1 }, { unique: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);