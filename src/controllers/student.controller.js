const Student = require('../models/Student');
const Route = require('../models/Route');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const validateAssignment = async (assignment) => {
  if (!assignment) return;
  const route = await Route.findOne({ _id: assignment.routeId, deletedAt: null });
  if (!route) throw new ApiError(404, 'Assigned route not found');
  const stopExists = route.stops.some((s) => String(s._id) === String(assignment.stopId));
  if (!stopExists) throw new ApiError(400, 'Assigned stop does not exist on this route');
};

exports.createStudent = asyncHandler(async (req, res) => {
  const { parentId, amAssignment, pmAssignment } = req.body;

  const parent = await User.findOne({ _id: parentId, role: 'parent', deletedAt: null, isActive: true });
  if (!parent) throw new ApiError(404, 'Parent not found or not a parent role');

  await validateAssignment(amAssignment);
  await validateAssignment(pmAssignment);

  const student = await Student.create(req.body);
  res.status(201).json({ success: true, data: student, message: 'Student created', errors: null });
});

exports.listStudents = asyncHandler(async (req, res) => {
  const filter = { deletedAt: null };

  if (req.user.role === 'parent') {
    filter.parentId = req.user._id;
  } else if (req.user.role === 'admin') {
    if (req.query.parentId) filter.parentId = req.query.parentId;
  } else {
    throw new ApiError(403, 'Forbidden');
  }

  const students = await Student.find(filter)
    .populate('parentId', 'name email phone')
    .sort('lastName');
  res.status(200).json({ success: true, data: students, message: 'Students retrieved', errors: null });
});

exports.getStudent = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ _id: req.params.id, deletedAt: null })
    .populate('parentId', 'name email phone')
    .populate('amAssignment.routeId', 'name shiftType')
    .populate('pmAssignment.routeId', 'name shiftType');

  if (!student) throw new ApiError(404, 'Student not found');

  if (req.user.role === 'parent' && String(student.parentId._id) !== String(req.user._id)) {
    throw new ApiError(403, 'You can only view your own children');
  }

  res.status(200).json({ success: true, data: student, message: 'Student retrieved', errors: null });
});

exports.updateStudent = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ _id: req.params.id, deletedAt: null });
  if (!student) throw new ApiError(404, 'Student not found');

  if (req.body.amAssignment) await validateAssignment(req.body.amAssignment);
  if (req.body.pmAssignment) await validateAssignment(req.body.pmAssignment);

  Object.assign(student, req.body);
  await student.save();
  res.status(200).json({ success: true, data: student, message: 'Student updated', errors: null });
});

exports.deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ _id: req.params.id, deletedAt: null });
  if (!student) throw new ApiError(404, 'Student not found');

  student.deletedAt = new Date();
  await student.save();
  res.status(200).json({ success: true, data: null, message: 'Student soft-deleted', errors: null });
});