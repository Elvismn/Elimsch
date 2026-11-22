const express = require('express');
const { z } = require('zod');
const validate = require('../middleware/validate');
const { protect, restrictTo } = require('../middleware/auth');
const ctrl = require('../controllers/fuelLog.controller');

const router = express.Router();

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId');

const createSchema = z.object({
  vehicleId: objectId,
  tripId: objectId.optional().nullable(),
  litersAdded: z.number().positive(),
  totalCost: z.number().nonnegative(),
  odometerReading: z.number().nonnegative(),
});

router.use(protect);

router.post('/', restrictTo('admin', 'driver'), validate(createSchema), ctrl.createFuelLog);
router.get('/', restrictTo('admin', 'driver'), ctrl.listFuelLogs);
router.get('/:id', restrictTo('admin', 'driver'), ctrl.getFuelLog);

module.exports = router;