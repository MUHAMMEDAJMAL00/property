const express = require('express');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const companyController = require('./company.controller');

const router = express.Router();

router.use(authenticate);

router
  .route('/')
  .get(authorize(), companyController.list)
  .post(authorize('super_admin', 'front_office'), companyController.create);

router
  .route('/:id')
  .get(authorize(), companyController.getById)
  .patch(authorize('super_admin', 'front_office'), companyController.update)
  .delete(authorize('super_admin'), companyController.remove);

module.exports = router;