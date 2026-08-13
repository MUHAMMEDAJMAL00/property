const express = require('express');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const settingsController = require('./settings.controller');

const router = express.Router();

router.use(authenticate);

router
  .route('/')
  .get(authorize(), settingsController.listSettings)
  .post(authorize('super_admin'), settingsController.upsertSetting);

router
  .route('/:key')
  .get(authorize(), settingsController.getSetting)
  .delete(authorize('super_admin'), settingsController.removeSetting);

module.exports = router;