const express = require('express');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const securityController = require('./security.controller');

const router = express.Router();

router.use(authenticate);

router
  .route('/visitors')
  .get(authorize(), securityController.listVisitors)
  .post(authorize('super_admin', 'security'), securityController.createVisitor);

router
  .route('/visitors/:id/entry')
  .post(authorize('super_admin', 'security'), securityController.recordVisitorEntry);

router
  .route('/logs/:id/exit')
  .post(authorize('super_admin', 'security'), securityController.recordVisitorExit);

router
  .route('/logs')
  .get(authorize(), securityController.listVisitorLogs);

router
  .route('/vehicles')
  .get(authorize(), securityController.listVehicles)
  .post(authorize('super_admin', 'security'), securityController.createVehicle);

router
  .route('/vehicles/:id/exit')
  .post(authorize('super_admin', 'security'), securityController.recordVehicleExit);

router
  .route('/gate-passes')
  .get(authorize(), securityController.listGatePasses)
  .post(authorize('super_admin', 'security'), securityController.createGatePass);

router.post('/gate-passes/:id/status', authorize('super_admin', 'security'), securityController.changeGatePassStatus);

router
  .route('/petty-cash')
  .get(authorize(), securityController.listPettyCash)
  .post(authorize('super_admin', 'security'), securityController.createPettyCash);

router.patch('/petty-cash/:id/status', authorize('super_admin', 'security', 'accounts'), securityController.changePettyCashStatus);

module.exports = router;