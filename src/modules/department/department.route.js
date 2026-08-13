const express = require('express');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const departmentController = require('./department.controller');

const router = express.Router();

router.use(authenticate);

router
  .route('/')
  .get(authorize(), departmentController.list)
  .post(authorize('super_admin'), departmentController.create);

router
  .route('/:id')
  .get(authorize(), departmentController.getById)
  .patch(authorize('super_admin'), departmentController.update)
  .delete(authorize('super_admin'), departmentController.remove);

module.exports = router;