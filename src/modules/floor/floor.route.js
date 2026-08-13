const express = require('express');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const floorController = require('./floor.controller');

const router = express.Router();

router.use(authenticate);

router
  .route('/')
  .get(authorize(), floorController.list)
  .post(authorize('super_admin'), floorController.create);

router
  .route('/:id')
  .get(authorize(), floorController.getById)
  .patch(authorize('super_admin'), floorController.update)
  .delete(authorize('super_admin'), floorController.remove);

module.exports = router;