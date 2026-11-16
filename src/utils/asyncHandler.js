// Express 5 auto-forwards promise rejections, but explicit wrapping keeps
// intent obvious and is safe if we ever downgrade.
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;