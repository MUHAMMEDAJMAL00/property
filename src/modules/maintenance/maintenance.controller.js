const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const { maintenanceService, categoryService, areaService } = require('./maintenance.service');

const maintenanceController = {
  listRequests: catchAsync(async (req, res) => {
    const data = await maintenanceService.list(req.query);
    res.json(ApiResponse.success('Maintenance requests fetched', data));
  }),

  getRequest: catchAsync(async (req, res) => {
    const data = await maintenanceService.getById(req.params.id);
    res.json(ApiResponse.success('Maintenance request fetched', data));
  }),

  createRequest: catchAsync(async (req, res) => {
    const data = await maintenanceService.create(req.body, req.user);
    res.status(201).json(ApiResponse.success('Maintenance request created', data));
  }),

  changeRequestStatus: catchAsync(async (req, res) => {
    const { status, notes } = req.body;
    const data = await maintenanceService.changeStatus(req.params.id, status, notes, req.user);
    res.json(ApiResponse.success('Maintenance status changed', data));
  }),

  assignRequest: catchAsync(async (req, res) => {
    const data = await maintenanceService.assign(req.params.id, req.body.staff_id, req.user);
    res.json(ApiResponse.success('Maintenance request assigned', data));
  }),

  getRequestHistory: catchAsync(async (req, res) => {
    const data = await maintenanceService.getStatusHistory(req.params.id);
    res.json(ApiResponse.success('Maintenance history fetched', data));
  }),

  listCategories: catchAsync(async (req, res) => {
    const data = await categoryService.list(req.query);
    res.json(ApiResponse.success('Categories fetched', data));
  }),

  createCategory: catchAsync(async (req, res) => {
    const data = await categoryService.create(req.body);
    res.status(201).json(ApiResponse.success('Category created', data));
  }),

  listAreas: catchAsync(async (req, res) => {
    const data = await areaService.list(req.query);
    res.json(ApiResponse.success('Areas fetched', data));
  }),

  createArea: catchAsync(async (req, res) => {
    const data = await areaService.create(req.body);
    res.status(201).json(ApiResponse.success('Area created', data));
  }),
};

module.exports = maintenanceController;