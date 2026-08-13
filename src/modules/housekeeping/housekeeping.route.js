const express = require('express');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const housekeepingController = require('./housekeeping.controller');

const router = express.Router();

router.use(authenticate);

router
  .route('/task-types')
  .get(authorize(), housekeepingController.listTaskTypes)
  .post(authorize('super_admin'), housekeepingController.createTaskType);

router
  .route('/tasks')
  .get(authorize(), housekeepingController.listTasks)
  .post(authorize('super_admin', 'housekeeping', 'front_office'), housekeepingController.createTask);

router
  .route('/tasks/:id')
  .get(authorize(), housekeepingController.getTask)
  .patch(authorize('super_admin', 'housekeeping'), housekeepingController.updateTask);

router.post('/tasks/:id/assign', authorize('super_admin', 'housekeeping'), housekeepingController.assignTask);
router.post('/tasks/:id/start', authorize('super_admin', 'housekeeping'), housekeepingController.startTask);
router.post('/tasks/:id/complete', authorize('super_admin', 'housekeeping'), housekeepingController.completeTask);
router.post('/tasks/:id/verify', authorize('super_admin', 'housekeeping', 'front_office'), housekeepingController.verifyTask);

router
  .route('/damage')
  .get(authorize(), housekeepingController.listDamages)
  .post(authorize('super_admin', 'housekeeping'), housekeepingController.createDamage);

router.patch('/damage/:id', authorize('super_admin', 'housekeeping'), housekeepingController.updateDamage);

router
  .route('/laundry')
  .get(authorize(), housekeepingController.listLaundry)
  .post(authorize('super_admin', 'housekeeping', 'front_office'), housekeepingController.createLaundry);

router.patch('/laundry/:id', authorize('super_admin', 'housekeeping'), housekeepingController.updateLaundry);

module.exports = router;