const express = require('express');
const authenticate = require('../../middlewares/authenticate');
const dashboardController = require('./dashboard.controller');

const router = express.Router();

router.use(authenticate);

router.get('/desk', dashboardController.desk);
router.get('/room-board', dashboardController.roomBoard);
router.get('/housekeeping', dashboardController.housekeeping);
router.get('/maintenance', dashboardController.maintenance);
router.get('/security', dashboardController.security);
router.get('/billing', dashboardController.billing);

module.exports = router;