const express = require('express');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const payrollController = require('./payroll.controller');

const router = express.Router();

router.use(authenticate);

router
  .route('/leave-types')
  .get(authorize(), payrollController.listLeaveTypes);

router
  .route('/leave-requests')
  .get(authorize(), payrollController.listLeaveRequests)
  .post(authorize('super_admin', 'hr'), payrollController.createLeaveRequest);

router.patch('/leave-requests/:id', authorize('super_admin', 'hr'), payrollController.reviewLeaveRequest);

router
  .route('/advances')
  .get(authorize(), payrollController.listAdvances)
  .post(authorize('super_admin', 'hr'), payrollController.createAdvance);

router
  .route('/salary-structures')
  .get(authorize(), payrollController.listStructures)
  .post(authorize('super_admin', 'hr'), payrollController.createStructure);

router
  .route('/payroll')
  .get(authorize(), payrollController.listPayrolls)
  .post(authorize('super_admin', 'hr'), payrollController.createPayroll);

router.patch('/payroll/:id/status', authorize('super_admin', 'hr'), payrollController.changePayrollStatus);

module.exports = router;