const Route = require('../models/Route');
const Trip = require('../models/Trip');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

exports.createRoute = asyncHandler(async (req, res) => {
  const route = await Route.create(req.body);
  res.status(201).json({ success: true, data: route, message: 'Route created', errors: null });
});

exports.listRoutes = asyncHandler(async (req, res) => {
  const filter = { deletedAt: null };
  if (req.query.shiftType) filter.shiftType = req.query.shiftType;
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

  const routes = await Route.find(filter).sort('name');
  res.status(200).json({ success: true, data: routes, message: 'Routes retrieved', errors: null });
});

exports.getRoute = asyncHandler(async (req, res) => {
  const route = await Route.findOne({ _id: req.params.id, deletedAt: null });
  if (!route) throw new ApiError(404, 'Route not found');
  res.status(200).json({ success: true, data: route, message: 'Route retrieved', errors: null });
});

exports.updateRoute = asyncHandler(async (req, res) => {
  const route = await Route.findOneAndUpdate(
    { _id: req.params.id, deletedAt: null },
    req.body,
    { new: true, runValidators: true }
  );
  if (!route) throw new ApiError(404, 'Route not found');
  res.status(200).json({ success: true, data: route, message: 'Route updated', errors: null });
});

exports.deleteRoute = asyncHandler(async (req, res) => {
  const route = await Route.findOne({ _id: req.params.id, deletedAt: null });
  if (!route) throw new ApiError(404, 'Route not found');

  const active = await Trip.exists({ routeId: route._id, status: { $in: ['scheduled', 'in-progress'] } });
  if (active) throw new ApiError(400, 'Cannot delete a route with an active trip');

  route.deletedAt = new Date();
  route.isActive = false;
  await route.save();
  res.status(200).json({ success: true, data: null, message: 'Route soft-deleted', errors: null });
});