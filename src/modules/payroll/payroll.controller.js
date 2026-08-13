const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const {
  leaveTypeService,
  leaveRequestService,
  advanceService,
  structureService,
  payrollService,
} = require('./payroll.service');

const payrollController = {
  listLeaveTypes: catchAsync(async (req, res) => {
    const data = await leaveTypeService.list(req.query);
    res.json(ApiResponse.success('Leave types fetched', data));
  }),

  listLeaveRequests: catchAsync(async (req, res) => {
    const data = await leaveRequestService.list(req.query);
    res.json(ApiResponse.success('Leave requests fetched', data));
  }),

  createLeaveRequest: catchAsync(async (req, res) => {
    const data = await leaveRequestService.create(req.body, req.user);
    res.status(201).json(ApiResponse.success('Leave request created', data));
  }),

  reviewLeaveRequest: catchAsync(async (req, res) => {
    const data = await leaveRequestService.approve(req.params.id, req.body.status, req.user);
    res.json(ApiResponse.success('Leave request reviewed', data));
  }),

  listAdvances: catchAsync(async (req, res) => {
    const data = await advanceService.list(req.query);
    res.json(ApiResponse.success('Staff advances fetched', data));
  }),

  createAdvance: catchAsync(async (req, res) => {
    const data = await advanceService.create(req.body, req.user);
    res.status(201).json(ApiResponse.success('Staff advance created', data));
  }),

  listStructures: catchAsync(async (req, res) => {
    const data = await structureService.list(req.query);
    res.json(ApiResponse.success('Salary structures fetched', data));
  }),

  createStructure: catchAsync(async (req, res) => {
    const data = await structureService.create(req.body, req.user);
    res.status(201).json(ApiResponse.success('Salary structure created', data));
  }),

  listPayrolls: catchAsync(async (req, res) => {
    const data = await payrollService.list(req.query);
    res.json(ApiResponse.success('Payroll records fetched', data));
  }),

  createPayroll: catchAsync(async (req, res) => {
    const data = await payrollService.create(req.body, req.user);
    res.status(201).json(ApiResponse.success('Payroll record created', data));
  }),

  changePayrollStatus: catchAsync(async (req, res) => {
    const data = await payrollService.changeStatus(req.params.id, req.body.status, req.user);
    res.json(ApiResponse.success('Payroll status updated', data));
  }),
};

module.exports = payrollController;