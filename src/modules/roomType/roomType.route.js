const express = require('express');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const roomTypeController = require('./roomType.controller');

const router = express.Router();

router.use(authenticate);

router
  .route('/')
  .get(authorize(), roomTypeController.list)
  .post(authorize('super_admin'), roomTypeController.create);

router
  .route('/:id')
  .get(authorize(), roomTypeController.getById)
  .patch(authorize('super_admin'), roomTypeController.update)
  .delete(authorize('super_admin'), roomTypeController.remove);

module.exports = router;