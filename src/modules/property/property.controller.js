const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const propertyService = require('./property.service');

const propertyController = {
  listProperties: catchAsync(async (req, res) => {
    const data = await propertyService.list(req.query);
    res.json(ApiResponse.success('Properties fetched', data));
  }),

  getProperty: catchAsync(async (req, res) => {
    const data = await propertyService.getById(req.params.id);
    res.json(ApiResponse.success('Property fetched', data));
  }),

  createProperty: catchAsync(async (req, res) => {
    const data = await propertyService.create(req.body);
    res.status(201).json(ApiResponse.success('Property created', data));
  }),

  updateProperty: catchAsync(async (req, res) => {
    const data = await propertyService.update(req.params.id, req.body, req.user);
    res.json(ApiResponse.success('Property updated', data));
  }),

  togglePropertyStatus: catchAsync(async (req, res) => {
    const data = await propertyService.toggleStatus(req.params.id, req.body.status);
    res.json(ApiResponse.success('Property status updated', data));
  }),

  getPropertyStats: catchAsync(async (req, res) => {
    const data = await propertyService.getStats();
    res.json(ApiResponse.success('Property stats fetched', data));
  }),
};

module.exports = propertyController;