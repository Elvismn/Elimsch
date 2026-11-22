const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth.routes'));
router.use('/users', require('./user.routes'));
router.use('/vehicles', require('./vehicle.routes'));
router.use('/routes', require('./route.routes'));
router.use('/students', require('./student.routes'));
router.use('/trips', require('./trip.routes'));
router.use('/fuel-logs', require('./fuelLog.routes'));

module.exports = router;