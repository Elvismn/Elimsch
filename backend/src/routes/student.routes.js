const express = require('express');
const { z } = require('zod');
const validate = require('../middleware/validate');
const { protect, restrictTo } = require('../middleware/auth');
const ctrl = require('../controllers/student.controller');

const router = express.Router();

const assignmentSchema = z.object({
  routeId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid routeId'),
  stopId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid stopId'),
});

const createSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  parentId: z.string().regex(/^[a-f\d]{24}$/i),
  amAssignment: assignmentSchema.optional().nullable(),
  pmAssignment: assignmentSchema.optional().nullable(),
  gradeOrClass: z.string().optional(),
});

const updateSchema = createSchema.partial();

router.use(protect);

router.get('/', restrictTo('admin', 'parent'), ctrl.listStudents);
router.get('/:id', restrictTo('admin', 'parent'), ctrl.getStudent);

router.post('/', restrictTo('admin'), validate(createSchema), ctrl.createStudent);
router.patch('/:id', restrictTo('admin'), validate(updateSchema), ctrl.updateStudent);
router.delete('/:id', restrictTo('admin'), ctrl.deleteStudent);

module.exports = router;