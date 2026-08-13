const express = require('express');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const propertyController = require('./property.controller');

const router = express.Router();

router.use(authenticate);

router.get('/stats', authorize(), propertyController.getPropertyStats);

router
  .route('/')
  .get(authorize(), propertyController.listProperties)
  .post(authorize('super_admin'), propertyController.createProperty);

router
  .route('/:id')
  .get(authorize(), propertyController.getProperty)
  .patch(authorize('super_admin'), propertyController.updateProperty);

router.patch('/:id/status', authorize('super_admin'), propertyController.togglePropertyStatus);

module.exports = router;