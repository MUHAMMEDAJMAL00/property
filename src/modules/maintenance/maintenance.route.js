const express = require('express');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const maintenanceController = require('./maintenance.controller');

const router = express.Router();

router.use(authenticate);

router
  .route('/categories')
  .get(authorize(), maintenanceController.listCategories)
  .post(authorize('super_admin'), maintenanceController.createCategory);

router
  .route('/areas')
  .get(authorize(), maintenanceController.listAreas)
  .post(authorize('super_admin'), maintenanceController.createArea);

router
  .route('/')
  .get(authorize(), maintenanceController.listRequests)
  .post(authorize('super_admin', 'maintenance', 'front_office'), maintenanceController.createRequest);

router
  .route('/:id')
  .get(authorize(), maintenanceController.getRequest);

router.post('/:id/status', authorize('super_admin', 'maintenance'), maintenanceController.changeRequestStatus);
router.post('/:id/assign', authorize('super_admin', 'maintenance'), maintenanceController.assignRequest);
router.get('/:id/history', authorize(), maintenanceController.getRequestHistory);

module.exports = router;