const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const { taskService, damageService, laundryService, taskTypeService } = require('./housekeeping.service');

const housekeepingController = {
  listTasks: catchAsync(async (req, res) => {
    const data = await taskService.list(req.query);
    res.json(ApiResponse.success('Tasks fetched', data));
  }),

  getTask: catchAsync(async (req, res) => {
    const data = await taskService.getById(req.params.id);
    res.json(ApiResponse.success('Task fetched', data));
  }),

  createTask: catchAsync(async (req, res) => {
    const data = await taskService.create(req.body, req.user);
    res.status(201).json(ApiResponse.success('Task created', data));
  }),

  updateTask: catchAsync(async (req, res) => {
    const data = await taskService.update(req.params.id, req.body, req.user);
    res.json(ApiResponse.success('Task updated', data));
  }),

  assignTask: catchAsync(async (req, res) => {
    const data = await taskService.assignStaff(req.params.id, req.body.staff_id, req.user);
    res.json(ApiResponse.success('Task assigned', data));
  }),

  startTask: catchAsync(async (req, res) => {
    const data = await taskService.start(req.params.id, req.user);
    res.json(ApiResponse.success('Task started', data));
  }),

  completeTask: catchAsync(async (req, res) => {
    const data = await taskService.complete(req.params.id, req.user);
    res.json(ApiResponse.success('Task completed', data));
  }),

  verifyTask: catchAsync(async (req, res) => {
    const data = await taskService.verify(req.params.id, req.user);
    res.json(ApiResponse.success('Task verified', data));
  }),

  listTaskTypes: catchAsync(async (req, res) => {
    const data = await taskTypeService.list(req.query);
    res.json(ApiResponse.success('Task types fetched', data));
  }),

  createTaskType: catchAsync(async (req, res) => {
    const data = await taskTypeService.create(req.body);
    res.status(201).json(ApiResponse.success('Task type created', data));
  }),

  listDamages: catchAsync(async (req, res) => {
    const data = await damageService.list(req.query);
    res.json(ApiResponse.success('Damage records fetched', data));
  }),

  createDamage: catchAsync(async (req, res) => {
    const data = await damageService.create({ ...req.body, reported_by: req.user ? req.user.user_id : null, reported_at: new Date() }, req.user);
    res.status(201).json(ApiResponse.success('Damage record created', data));
  }),

  updateDamage: catchAsync(async (req, res) => {
    const data = await damageService.update(req.params.id, req.body, req.user);
    res.json(ApiResponse.success('Damage record updated', data));
  }),

  listLaundry: catchAsync(async (req, res) => {
    const data = await laundryService.list(req.query);
    res.json(ApiResponse.success('Laundry records fetched', data));
  }),

  createLaundry: catchAsync(async (req, res) => {
    const data = await laundryService.create(req.body, req.user);
    res.status(201).json(ApiResponse.success('Laundry record created', data));
  }),

  updateLaundry: catchAsync(async (req, res) => {
    const data = await laundryService.update(req.params.id, req.body, req.user);
    res.json(ApiResponse.success('Laundry record updated', data));
  }),
};

module.exports = housekeepingController;