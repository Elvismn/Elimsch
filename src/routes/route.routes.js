const express = require('express');
const { z } = require('zod');
const validate = require('../middleware/validate');
const { protect, restrictTo } = require('../middleware/auth');
const ctrl = require('../controllers/route.controller');

const router = express.Router();

const stopSchema = z.object({
  stopName: z.string().min(1),
  sequenceOrder: z.number().int().positive(),
  location: z.object({
    type: z.literal('Point').optional(),
    coordinates: z.tuple([z.number(), z.number()]), // [lng, lat]
  }),
  geofenceRadiusMeters: z.number().nonnegative().optional(),
});

const createSchema = z.object({
  name: z.string().min(1),
  shiftType: z.enum(['am', 'pm']),
  stops: z.array(stopSchema).min(1),
  isActive: z.boolean().optional(),
});

const updateSchema = createSchema.partial();

router.use(protect);

router.get('/', restrictTo('admin', 'driver', 'co-driver'), ctrl.listRoutes);
router.get('/:id', restrictTo('admin', 'driver', 'co-driver'), ctrl.getRoute);

router.post('/', restrictTo('admin'), validate(createSchema), ctrl.createRoute);
router.patch('/:id', restrictTo('admin'), validate(updateSchema), ctrl.updateRoute);
router.delete('/:id', restrictTo('admin'), ctrl.deleteRoute);

module.exports = router;