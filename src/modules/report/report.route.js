const express = require('express');
const authenticate = require('../../middlewares/authenticate');
const reportController = require('./report.controller');

const router = express.Router();

router.use(authenticate);

router.get('/sales-summary', reportController.salesSummary);
router.get('/occupancy', reportController.occupancy);
router.get('/bookings-by-status', reportController.bookingsByStatus);

module.exports = router;