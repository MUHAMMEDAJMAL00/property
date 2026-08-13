const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const settingsService = require('./settings.service');

const settingsController = {
  listSettings: catchAsync(async (req, res) => {
    const data = await settingsService.list(req.query);
    res.json(ApiResponse.success('Settings fetched', data));
  }),

  getSetting: catchAsync(async (req, res) => {
    const data = await settingsService.getByKey(req.params.key);
    res.json(ApiResponse.success('Setting fetched', data));
  }),

  upsertSetting: catchAsync(async (req, res) => {
    const data = await settingsService.upsert(req.body, req.user);
    res.json(ApiResponse.success('Setting saved', data));
  }),

  removeSetting: catchAsync(async (req, res) => {
    const data = await settingsService.remove(req.params.key);
    res.json(ApiResponse.success('Setting removed', data));
  }),
};

module.exports = settingsController;