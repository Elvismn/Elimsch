const FuelLog = require('../models/FuelLog');
const Vehicle = require('../models/Vehicle');
const Trip = require('../models/Trip');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

exports.createFuelLog = asyncHandler(async (req, res) => {
  const { vehicleId, tripId, litersAdded, totalCost, odometerReading } = req.body;

  const vehicle = await Vehicle.findOne({ _id: vehicleId, deletedAt: null });
  if (!vehicle) throw new ApiError(404, 'Vehicle not found');

  if (tripId) {
    const trip = await Trip.findById(tripId);
    if (!trip) throw new ApiError(404, 'Trip not found');
    if (String(trip.vehicleId) !== String(vehicleId)) {
      throw new ApiError(400, 'Trip is not assigned to this vehicle');
    }
  }

  const log = await FuelLog.create({
    vehicleId,
    tripId: tripId || null,
    litersAdded,
    totalCost,
    odometerReading,
    loggedBy: req.user._id,
  });

  // Side effect: bump odometer only if the new reading is higher
  let odometerUpdated = false;
  if (odometerReading > vehicle.currentOdometer) {
    vehicle.currentOdometer = odometerReading;
    await vehicle.save();
    odometerUpdated = true;
  }

  res.status(201).json({
    success: true,
    data: { log, odometerUpdated },
    message: odometerUpdated ? 'Fuel log recorded and odometer updated' : 'Fuel log recorded',
    errors: null,
  });
});

exports.listFuelLogs = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.vehicleId) filter.vehicleId = req.query.vehicleId;
  if (req.query.tripId) filter.tripId = req.query.tripId;
  if (req.user.role === 'driver') filter.loggedBy = req.user._id;

  const logs = await FuelLog.find(filter)
    .populate('vehicleId', 'plateNumber makeModel')
    .populate('loggedBy', 'name role')
    .sort('-createdAt');

  res.status(200).json({ success: true, data: logs, message: 'Fuel logs retrieved', errors: null });
});

exports.getFuelLog = asyncHandler(async (req, res) => {
  const log = await FuelLog.findById(req.params.id)
    .populate('vehicleId', 'plateNumber makeModel')
    .populate('loggedBy', 'name role');
  if (!log) throw new ApiError(404, 'Fuel log not found');

  if (req.user.role === 'driver' && String(log.loggedBy._id) !== String(req.user._id)) {
    throw new ApiError(403, 'You can only view your own fuel logs');
  }

  res.status(200).json({ success: true, data: log, message: 'Fuel log retrieved', errors: null });
});