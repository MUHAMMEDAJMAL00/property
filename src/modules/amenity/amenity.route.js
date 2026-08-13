const express = require('express');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const amenityController = require('./amenity.controller');

const router = express.Router();

router.use(authenticate);

router
  .route('/')
  .get(authorize(), amenityController.list)
  .post(authorize('super_admin'), amenityController.create);

router
  .route('/:id')
  .get(authorize(), amenityController.getById)
  .patch(authorize('super_admin'), amenityController.update)
  .delete(authorize('super_admin'), amenityController.remove);

module.exports = router;