const express = require('express');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const assetController = require('./asset.controller');

const router = express.Router();

router.use(authenticate);

router
  .route('/categories')
  .get(authorize(), assetController.listCategories)
  .post(authorize('super_admin', 'accounts'), assetController.createCategory);

router
  .route('/')
  .get(authorize(), assetController.listAssets)
  .post(authorize('super_admin', 'accounts'), assetController.createAsset);

router
  .route('/:id')
  .get(authorize(), assetController.getAsset)
  .patch(authorize('super_admin', 'accounts'), assetController.updateAsset);

router.post('/:id/move', authorize('super_admin', 'accounts'), assetController.moveAsset);
router.post('/:id/depreciate', authorize('super_admin', 'accounts'), assetController.depreciateAsset);
router.get('/:id/movements', authorize(), assetController.getAssetMovements);

module.exports = router;