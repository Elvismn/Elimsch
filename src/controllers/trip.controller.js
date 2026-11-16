const Trip = require('../models/Trip');
const Route = require('../models/Route');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const Student = require('../models/Student');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const normalizeDate = (input) => {
  const d = new Date(input);
  if (isNaN(d.getTime())) throw new ApiError(400, 'Invalid date');
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

const ALLOWED_TRANSITIONS = {
  scheduled: ['in-progress', 'cancelled'],
  'in-progress': ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

/* ----- CREATE (admin only) ----- */
exports.createTrip = asyncHandler(async (req, res) => {
  const { routeId, vehicleId, driverId, coDriverId, date } = req.body;

  const route = await Route.findOne({ _id: routeId, deletedAt: null });
  if (!route) throw new ApiError(404, 'Route not found');

  const vehicle = await Vehicle.findOne({ _id: vehicleId, deletedAt: null });
  if (!vehicle) throw new ApiError(404, 'Vehicle not found');
  if (vehicle.status !== 'active') throw new ApiError(400, 'Vehicle is not active');

  const driver = await User.findOne({ _id: driverId, role: 'driver', deletedAt: null, isActive: true });
  if (!driver) throw new ApiError(404, 'Driver not found or inactive');

  if (coDriverId) {
    const co = await User.findOne({ _id: coDriverId, role: 'co-driver', deletedAt: null, isActive: true });
    if (!co) throw new ApiError(404, 'Co-driver not found or inactive');
  }

  const normalizedDate = normalizeDate(date);

  // Defensive 409 before hitting the unique index
  const dup = await Trip.findOne({ routeId, date: normalizedDate });
  if (dup) throw new ApiError(409, 'A trip for this route already exists on this date');

  // Auto-populate manifest based on the route's shift type
  const shiftKey = route.shiftType === 'am' ? 'amAssignment' : 'pmAssignment';
  const students = await Student.find({ [`${shiftKey}.routeId`]: routeId, deletedAt: null }).select('_id');

  const attendanceManifest = students.map((s) => ({
    studentId: s._id,
    status: 'expected',
    timestamp: null,
  }));

  const trip = await Trip.create({
    routeId,
    vehicleId,
    driverId,
    coDriverId: coDriverId || null,
    date: normalizedDate,
    attendanceManifest,
  });

  res.status(201).json({
    success: true,
    data: trip,
    message: `Trip created with ${attendanceManifest.length} students on manifest`,
    errors: null,
  });
});

/* ----- LIST (admin) ----- */
exports.listTrips = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.routeId) filter.routeId = req.query.routeId;
  if (req.query.vehicleId) filter.vehicleId = req.query.vehicleId;
  if (req.query.driverId) filter.driverId = req.query.driverId;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.date) {
    const start = normalizeDate(req.query.date);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);
    filter.date = { $gte: start, $lt: end };
  }

  const trips = await Trip.find(filter)
    .populate('routeId', 'name shiftType')
    .populate('vehicleId', 'plateNumber makeModel')
    .populate('driverId', 'name phone')
    .populate('coDriverId', 'name phone')
    .sort('-date');

  res.status(200).json({ success: true, data: trips, message: 'Trips retrieved', errors: null });
});

/* ----- ACTIVE (scoped by role) ----- */
exports.getActiveTrips = asyncHandler(async (req, res) => {
  const today = normalizeDate(new Date());
  const tomorrow = new Date(today);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

  const filter = { date: { $gte: today, $lt: tomorrow }, status: { $ne: 'cancelled' } };

  if (req.user.role === 'driver') {
    filter.driverId = req.user._id;
  } else if (req.user.role === 'co-driver') {
    filter.coDriverId = req.user._id;
  } else if (req.user.role === 'parent') {
    const children = await Student.find({ parentId: req.user._id, deletedAt: null })
      .select('amAssignment pmAssignment');
    const routeIds = new Set();
    children.forEach((c) => {
      if (c.amAssignment) routeIds.add(String(c.amAssignment.routeId));
      if (c.pmAssignment) routeIds.add(String(c.pmAssignment.routeId));
    });
    if (routeIds.size === 0) {
      return res.status(200).json({ success: true, data: [], message: 'No active trips', errors: null });
    }
    filter.routeId = { $in: Array.from(routeIds) };
  }
  // admin: no additional filter

  const trips = await Trip.find(filter)
    .populate('routeId', 'name shiftType stops')
    .populate('vehicleId', 'plateNumber makeModel')
    .populate('driverId', 'name phone')
    .populate('coDriverId', 'name phone')
    .sort('date');

  res.status(200).json({ success: true, data: trips, message: 'Active trips', errors: null });
});

/* ----- GET ONE (parent is scoped to their child's manifest row) ----- */
exports.getTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id)
    .populate('routeId', 'name shiftType stops')
    .populate('vehicleId', 'plateNumber makeModel')
    .populate('driverId', 'name phone')
    .populate('coDriverId', 'name phone')
    .populate('attendanceManifest.studentId', 'firstName lastName gradeOrClass qrCodeIdentifier');

  if (!trip) throw new ApiError(404, 'Trip not found');

  const tripObj = trip.toObject();

  if (req.user.role === 'parent') {
    const children = await Student.find({ parentId: req.user._id, deletedAt: null }).select('_id');
    const childIds = new Set(children.map((c) => String(c._id)));

    const filteredManifest = tripObj.attendanceManifest.filter((row) => {
      const sid = row.studentId && (row.studentId._id || row.studentId);
      return childIds.has(String(sid));
    });

    if (filteredManifest.length === 0) throw new ApiError(403, 'This trip does not involve your child');

    tripObj.attendanceManifest = filteredManifest;
  }

  res.status(200).json({ success: true, data: tripObj, message: 'Trip retrieved', errors: null });
});

/* ----- STATUS TRANSITION ----- */
exports.updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const trip = await Trip.findById(req.params.id);
  if (!trip) throw new ApiError(404, 'Trip not found');

  if (!['admin', 'driver'].includes(req.user.role)) {
    throw new ApiError(403, 'Only admins and drivers can update trip status');
  }
  if (req.user.role === 'driver' && String(trip.driverId) !== String(req.user._id)) {
    throw new ApiError(403, 'You can only update your assigned trips');
  }

  if (!ALLOWED_TRANSITIONS[trip.status].includes(status)) {
    throw new ApiError(400, `Cannot transition from '${trip.status}' to '${status}'`);
  }

  trip.status = status;
  await trip.save();

  res.status(200).json({ success: true, data: trip, message: `Trip marked as ${status}`, errors: null });
});

/* ----- MANIFEST UPDATE ----- */
exports.updateManifest = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id);
  if (!trip) throw new ApiError(404, 'Trip not found');

  if (!['admin', 'co-driver'].includes(req.user.role)) {
    throw new ApiError(403, 'Only co-drivers and admins can update the manifest');
  }
  if (req.user.role === 'co-driver' && String(trip.coDriverId) !== String(req.user._id)) {
    throw new ApiError(403, 'You can only update manifests for your assigned trips');
  }

  // Accept single or bulk updates
  let updates = req.body.updates;
  if (!updates) {
    updates = [{ studentId: req.body.studentId, qrCodeIdentifier: req.body.qrCodeIdentifier, status: req.body.status }];
  }
  if (!Array.isArray(updates) || updates.length === 0) {
    throw new ApiError(400, 'Provide a single update or an array of updates');
  }

  // Resolve QR identifiers in bulk
  const qrIds = updates.filter((u) => !u.studentId && u.qrCodeIdentifier).map((u) => u.qrCodeIdentifier);
  const qrMap = {};
  if (qrIds.length) {
    const found = await Student.find({ qrCodeIdentifier: { $in: qrIds }, deletedAt: null }).select('_id qrCodeIdentifier');
    found.forEach((s) => (qrMap[s.qrCodeIdentifier] = String(s._id)));
  }

  const now = new Date();
  const results = [];

  for (const u of updates) {
    let studentId = u.studentId;
    if (!studentId && u.qrCodeIdentifier) {
      studentId = qrMap[u.qrCodeIdentifier];
      if (!studentId) {
        results.push({ ...u, applied: false, reason: 'QR code not recognized' });
        continue;
      }
    }
    if (!studentId) {
      results.push({ ...u, applied: false, reason: 'Missing studentId or qrCodeIdentifier' });
      continue;
    }

    const row = trip.attendanceManifest.find((r) => String(r.studentId) === String(studentId));
    if (!row) {
      results.push({ studentId, applied: false, reason: 'Student not on this trip manifest' });
      continue;
    }

    row.status = u.status;
    row.timestamp = now;
    results.push({ studentId, status: u.status, applied: true });
  }

  await trip.save();

  const failures = results.filter((r) => !r.applied);
  res.status(200).json({
    success: true,
    data: { trip, results },
    message:
      failures.length === 0
        ? `Manifest updated (${results.length} rows)`
        : `Manifest partially updated — ${failures.length} row(s) failed`,
    errors: failures.length ? failures : null,
  });
});