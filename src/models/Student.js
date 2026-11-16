const mongoose = require('mongoose');
const crypto = require('crypto');

const assignmentSchema = new mongoose.Schema(
  {
    routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
    stopId: { type: mongoose.Schema.Types.ObjectId, required: true },
  },
  { _id: false }
);

const studentSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amAssignment: { type: assignmentSchema, default: null },
    pmAssignment: { type: assignmentSchema, default: null },
    qrCodeIdentifier: { type: String, unique: true, sparse: true },
    gradeOrClass: { type: String, trim: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Mongoose 9: pre hooks are async-only; do NOT take `next`.
// Throw to reject the save, return normally to allow it.
studentSchema.pre('save', async function () {
  if (!this.qrCodeIdentifier) {
    this.qrCodeIdentifier = `STU-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
  }
  if (!this.amAssignment && !this.pmAssignment) {
    throw new Error('Student must have at least one assignment (AM or PM)');
  }
});

studentSchema.index({ 'amAssignment.routeId': 1 });
studentSchema.index({ 'pmAssignment.routeId': 1 });
studentSchema.index({ parentId: 1 });
// ❌ REMOVED: studentSchema.index({ qrCodeIdentifier: 1 }, { unique: true, sparse: true });
//    ^ was duplicating the inline `unique: true, sparse: true` on the field.

module.exports = mongoose.model('Student', studentSchema);