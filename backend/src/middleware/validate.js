/**
 * Zod-based body validator. Replaces `req.body` with the sanitized output
 * (strips unknown keys → protects against mass-assignment).
 */
const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    next(err); // ZodError → handled by errorHandler
  }
};

module.exports = validate;