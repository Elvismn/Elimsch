const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

/**
 * Verifies JWT from `Authorization: Bearer <token>` header and attaches
 * the live User document to `req.user`.
 */
const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) {
      throw new ApiError(401, 'Not authenticated');
    }
    const token = header.split(' ')[1];

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') throw new ApiError(401, 'Session expired, please log in again');
      throw new ApiError(401, 'Invalid token');
    }

    const user = await User.findOne({ _id: payload.id, deletedAt: null, isActive: true });
    if (!user) throw new ApiError(401, 'Account no longer active');

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Restricts an endpoint to specific roles.
 * Usage: restrictTo('admin', 'driver')
 */
const restrictTo = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new ApiError(403, 'Forbidden: insufficient permissions'));
  }
  next();
};

module.exports = { protect, restrictTo };