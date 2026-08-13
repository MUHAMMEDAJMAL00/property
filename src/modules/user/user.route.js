const express = require('express');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const userController = require('./user.controller');

const router = express.Router();

router.use(authenticate);

router
  .route('/')
  .get(authorize(), userController.list)
  .post(authorize('super_admin'), userController.create);

router
  .route('/:id')
  .get(authorize(), userController.getById)
  .patch(authorize('super_admin'), userController.update);

router.post('/:id/reset-password', authorize('super_admin'), userController.resetPassword);
router.patch('/:id/activation', authorize('super_admin'), userController.activate);

module.exports = router;