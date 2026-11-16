const express = require('express');
const { z } = require('zod');
const validate = require('../middleware/validate');
const { protect, restrictTo } = require('../middleware/auth');
const ctrl = require('../controllers/user.controller');

const router = express.Router();

const createSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['admin', 'driver', 'co-driver', 'parent']),
  phone: z.string().min(5),
  isActive: z.boolean().optional(),
});

const updateSchema = createSchema.partial();

router.use(protect, restrictTo('admin'));

router.post('/', validate(createSchema), ctrl.createUser);
router.get('/', ctrl.listUsers);
router.get('/:id', ctrl.getUser);
router.patch('/:id', validate(updateSchema), ctrl.updateUser);
router.delete('/:id', ctrl.deleteUser);

module.exports = router;