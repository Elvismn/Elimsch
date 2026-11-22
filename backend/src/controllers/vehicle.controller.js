const Vehicle = require('../models/Vehicle');
const Trip = require('../models/Trip');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

exports.createVehicle = asyncHandler(async (req, res) => {
  const existing = await Vehicle.findOne({ plateNumber: req.body.plateNumber });
  if (existing) throw new ApiError(409, 'A vehicle with this plate number already exists');

  const vehicle = await Vehicle.create(req.body);
  res.status(201).json({ success: true, data: vehicle, message: 'Vehicle created', errors: null });
});

exports.listVehicles = asyncHandler(async (req, res) => {
  const filter = { deletedAt: null };
  if (req.query.status) filter.status = req.query.status;

  const vehicles = await Vehicle.find(filter).sort('-createdAt');
  res.status(200).json({ success: true, data: vehicles, message: 'Vehicles retrieved', errors: null });
});

exports.getVehicle = asyncHandler(async (req, res) => {
  const v = await Vehicle.findOne({ _id: req.params.id, deletedAt: null });
  if (!v) throw new ApiError(404, 'Vehicle not found');
  res.status(200).json({ success: true, data: v, message: 'Vehicle retrieved', errors: null });
});

exports.updateVehicle = asyncHandler(async (req, res) => {
  const v = await Vehicle.findOneAndUpdate(
    { _id: req.params.id, deletedAt: null },
    req.body,
    { new: true, runValidators: true }
  );
  if (!v) throw new ApiError(404, 'Vehicle not found');
  res.status(200).json({ success: true, data: v, message: 'Vehicle updated', errors: null });
});

exports.updateVehicleStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const v = await Vehicle.findOne({ _id: req.params.id, deletedAt: null });
  if (!v) throw new ApiError(404, 'Vehicle not found');

  // Drivers may only update vehicles currently assigned to their trips
  if (req.user.role === 'driver') {
    const hasTrip = await Trip.exists({
      vehicleId: v._id,
      driverId: req.user._id,
      status: { $in: ['scheduled', 'in-progress'] },
    });
    if (!hasTrip) throw new ApiError(403, 'You can only update vehicles on your assigned trips');
  }

  v.status = status;
  await v.save();
  res.status(200).json({ success: true, data: v, message: 'Vehicle status updated', errors: null });
});

exports.deleteVehicle = asyncHandler(async (req, res) => {
  const v = await Vehicle.findOne({ _id: req.params.id, deletedAt: null });
  if (!v) throw new ApiError(404, 'Vehicle not found');

  // Block delete if attached to an in-progress trip
  const active = await Trip.exists({ vehicleId: v._id, status: { $in: ['scheduled', 'in-progress'] } });
  if (active) throw new ApiError(400, 'Cannot delete a vehicle assigned to an active trip');

  v.deletedAt = new Date();
  v.status = 'out-of-service';
  await v.save();
  res.status(200).json({ success: true, data: null, message: 'Vehicle soft-deleted', errors: null });
});