const express = require('express');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const employeeController = require('./employee.controller');

const router = express.Router();

router.use(authenticate);

router
  .route('/')
  .get(authorize(), employeeController.list)
  .post(authorize('super_admin', 'hr'), employeeController.create);

router
  .route('/:id')
  .get(authorize(), employeeController.getById)
  .patch(authorize('super_admin', 'hr'), employeeController.update)
  .delete(authorize('super_admin', 'hr'), employeeController.remove);

module.exports = router;