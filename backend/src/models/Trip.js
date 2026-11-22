const mongoose = require('mongoose');

const attendanceItemSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    status: {
      type: String,
      enum: ['expected', 'boarded', 'dropped', 'no-show', 'excused'],
      default: 'expected',
    },
    timestamp: { type: Date, default: null },
  },
  { _id: false }
);

const tripSchema = new mongoose.Schema(
  {
    routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    coDriverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    date: { type: Date, required: true }, // normalized to UTC midnight
    status: {
      type: String,
      enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    attendanceManifest: { type: [attendanceItemSchema], default: [] },
  },
  { timestamps: true }
);

// One trip per route per day
tripSchema.index({ routeId: 1, date: 1 }, { unique: true });
tripSchema.index({ driverId: 1, date: 1 });
tripSchema.index({ coDriverId: 1, date: 1 });
tripSchema.index({ status: 1 });

module.exports = mongoose.model('Trip', tripSchema);