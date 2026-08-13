const express = require('express');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const roleController = require('./role.controller');

const router = express.Router();

router.use(authenticate);

router.get('/permissions', authorize(), roleController.allPermissions);

router
  .route('/')
  .get(authorize(), roleController.list)
  .post(authorize('super_admin'), roleController.create);

router
  .route('/:id')
  .get(authorize(), roleController.getById)
  .patch(authorize('super_admin'), roleController.update)
  .delete(authorize('super_admin'), roleController.remove);

router.post('/:id/permissions', authorize('super_admin'), roleController.assignPermissions);

module.exports = router;