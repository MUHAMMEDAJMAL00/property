const express = require('express');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const attendanceController = require('./attendance.controller');

const router = express.Router();

router.use(authenticate);

router.get('/summary', authorize(), attendanceController.monthlySummary);

router
  .route('/')
  .get(authorize(), attendanceController.listAttendance)
  .post(authorize('super_admin', 'hr'), attendanceController.markAttendance);

router.post('/:id/clock-out', authorize('super_admin', 'hr'), attendanceController.clockOut);

router
  .route('/holidays')
  .get(authorize(), attendanceController.listHolidays)
  .post(authorize('super_admin', 'hr'), attendanceController.createHoliday);

router
  .route('/overtime')
  .get(authorize(), attendanceController.listOvertime)
  .post(authorize('super_admin', 'hr'), attendanceController.createOvertime);

router.patch('/overtime/:id', authorize('super_admin', 'hr'), attendanceController.reviewOvertime);

module.exports = router;