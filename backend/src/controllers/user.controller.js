const bcrypt = require('bcryptjs');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

const sanitize = (u) => ({
  _id: u._id, name: u.name, email: u.email, role: u.role,
  phone: u.phone, isActive: u.isActive, createdAt: u.createdAt, updatedAt: u.updatedAt,
});

exports.createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, isActive } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new ApiError(409, 'Email already registered');

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ name, email, passwordHash, role, phone, isActive });

  res.status(201).json({ success: true, data: sanitize(user), message: 'User created', errors: null });
});

exports.listUsers = asyncHandler(async (req, res) => {
  const filter = { deletedAt: null };
  if (req.query.role) filter.role = req.query.role;
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

  const users = await User.find(filter).sort('-createdAt');
  res.status(200).json({ success: true, data: users.map(sanitize), message: 'Users retrieved', errors: null });
});

exports.getUser = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, deletedAt: null });
  if (!user) throw new ApiError(404, 'User not found');
  res.status(200).json({ success: true, data: sanitize(user), message: 'User retrieved', errors: null });
});

exports.updateUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, isActive } = req.body;
  const user = await User.findOne({ _id: req.params.id, deletedAt: null }).select('+passwordHash');
  if (!user) throw new ApiError(404, 'User not found');

  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email.toLowerCase();
  if (role !== undefined) user.role = role;
  if (phone !== undefined) user.phone = phone;
  if (isActive !== undefined) user.isActive = isActive;
  if (password) user.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  await user.save();
  res.status(200).json({ success: true, data: sanitize(user), message: 'User updated', errors: null });
});

exports.deleteUser = asyncHandler(async (req, res) => {
  if (String(req.params.id) === String(req.user._id)) {
    throw new ApiError(400, 'You cannot delete your own account');
  }
  const user = await User.findOne({ _id: req.params.id, deletedAt: null });
  if (!user) throw new ApiError(404, 'User not found');

  user.deletedAt = new Date();
  user.isActive = false;
  await user.save();

  res.status(200).json({ success: true, data: null, message: 'User soft-deleted', errors: null });
});