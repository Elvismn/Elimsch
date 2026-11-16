const express = require('express');
const { z } = require('zod');
const validate = require('../middleware/validate');
const { protect, restrictTo } = require('../middleware/auth');
const ctrl = require('../controllers/vehicle.controller');

const router = express.Router();

const createSchema = z.object({
  plateNumber: z.string().min(2),
  makeModel: z.string().min(2),
  capacity: z.number().int().positive(),
  fuelTankCapacity: z.number().nonnegative(),
  currentOdometer: z.number().nonnegative().optional(),
  status: z.enum(['active', 'maintenance', 'out-of-service']).optional(),
});

const updateSchema = createSchema.partial();
const statusSchema = z.object({ status: z.enum(['active', 'maintenance', 'out-of-service']) });

router.use(protect);

router.get('/', restrictTo('admin', 'driver'), ctrl.listVehicles);
router.get('/:id', restrictTo('admin', 'driver'), ctrl.getVehicle);

router.post('/', restrictTo('admin'), validate(createSchema), ctrl.createVehicle);
router.patch('/:id', restrictTo('admin'), validate(updateSchema), ctrl.updateVehicle);
router.patch('/:id/status', restrictTo('admin', 'driver'), validate(statusSchema), ctrl.updateVehicleStatus);
router.delete('/:id', restrictTo('admin'), ctrl.deleteVehicle);

module.exports = router;