const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const { assetService, assetCategoryService } = require('./asset.service');

const assetController = {
  listAssets: catchAsync(async (req, res) => {
    const data = await assetService.list(req.query);
    res.json(ApiResponse.success('Assets fetched', data));
  }),

  getAsset: catchAsync(async (req, res) => {
    const data = await assetService.getById(req.params.id);
    res.json(ApiResponse.success('Asset fetched', data));
  }),

  createAsset: catchAsync(async (req, res) => {
    const data = await assetService.create(req.body, req.user);
    res.status(201).json(ApiResponse.success('Asset created', data));
  }),

  updateAsset: catchAsync(async (req, res) => {
    const data = await assetService.update(req.params.id, req.body, req.user);
    res.json(ApiResponse.success('Asset updated', data));
  }),

  moveAsset: catchAsync(async (req, res) => {
    const data = await assetService.move(req.params.id, req.body.to_location, req.body.notes, req.user);
    res.status(201).json(ApiResponse.success('Asset moved', data));
  }),

  depreciateAsset: catchAsync(async (req, res) => {
    const data = await assetService.depreciate(req.params.id, req.body.period, req.user);
    res.json(ApiResponse.success('Depreciation recorded', data));
  }),

  getAssetMovements: catchAsync(async (req, res) => {
    const data = await assetService.movements(req.params.id);
    res.json(ApiResponse.success('Asset movements fetched', data));
  }),

  listCategories: catchAsync(async (req, res) => {
    const data = await assetCategoryService.list(req.query);
    res.json(ApiResponse.success('Asset categories fetched', data));
  }),

  createCategory: catchAsync(async (req, res) => {
    const data = await assetCategoryService.create(req.body);
    res.status(201).json(ApiResponse.success('Asset category created', data));
  }),
};

module.exports = assetController;