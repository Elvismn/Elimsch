const express = require('express');
const { z } = require('zod');
const validate = require('../middleware/validate');
const { protect, restrictTo } = require('../middleware/auth');
const ctrl = require('../controllers/trip.controller');

const router = express.Router();

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId');

const createSchema = z.object({
  routeId: objectId,
  vehicleId: objectId,
  driverId: objectId,
  coDriverId: objectId.optional().nullable(),
  date: z.string().refine((v) => !isNaN(new Date(v).getTime()), 'Invalid date'),
});

const statusSchema = z.object({
  status: z.enum(['scheduled', 'in-progress', 'completed', 'cancelled']),
});

const manifestItemSchema = z.object({
  studentId: objectId.optional(),
  qrCodeIdentifier: z.string().min(1).optional(),
  status: z.enum(['expected', 'boarded', 'dropped', 'no-show', 'excused']),
}).refine((d) => d.studentId || d.qrCodeIdentifier, {
  message: 'Each update requires studentId or qrCodeIdentifier',
});

const manifestSchema = z.union([
  manifestItemSchema,
  z.object({ updates: z.array(manifestItemSchema).min(1) }),
]);

router.use(protect);

router.post('/', restrictTo('admin'), validate(createSchema), ctrl.createTrip);
router.get('/', restrictTo('admin'), ctrl.listTrips);
router.get('/active', restrictTo('admin', 'driver', 'co-driver', 'parent'), ctrl.getActiveTrips);
router.get('/:id', restrictTo('admin', 'driver', 'co-driver', 'parent'), ctrl.getTrip);
router.patch('/:id/status', restrictTo('admin', 'driver'), validate(statusSchema), ctrl.updateStatus);
router.patch('/:id/manifest', restrictTo('admin', 'co-driver'), validate(manifestSchema), ctrl.updateManifest);

module.exports = router;