const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });

const sanitize = (u) => ({
  _id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
  phone: u.phone,
  isActive: u.isActive,
  createdAt: u.createdAt,
  updatedAt: u.updatedAt,
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase(), deletedAt: null }).select('+passwordHash');
  if (!user || !user.isActive) throw new ApiError(401, 'Invalid email or password');

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) throw new ApiError(401, 'Invalid email or password');

  const token = signToken(user);

  res.status(200).json({
    success: true,
    data: { token, user: sanitize(user) },
    message: 'Login successful',
    errors: null,
  });
});

exports.me = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: sanitize(req.user), message: 'Current user', errors: null });
});