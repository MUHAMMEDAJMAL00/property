const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const {
  visitorService,
  visitorLogService,
  vehicleService,
  gatePassService,
  pettyCashService,
} = require('./security.service');

const securityController = {
  listVisitors: catchAsync(async (req, res) => {
    const data = await visitorService.list(req.query);
    res.json(ApiResponse.success('Visitors fetched', data));
  }),

  createVisitor: catchAsync(async (req, res) => {
    const data = await visitorService.create(req.body, req.user);
    res.status(201).json(ApiResponse.success('Visitor created', data));
  }),

  recordVisitorEntry: catchAsync(async (req, res) => {
    const data = await visitorService.recordEntry(req.params.id, req.body.notes, req.user);
    res.status(201).json(ApiResponse.success('Visitor entry recorded', data));
  }),

  recordVisitorExit: catchAsync(async (req, res) => {
    const data = await visitorService.recordExit(req.params.id, req.user);
    res.json(ApiResponse.success('Visitor exit recorded', data));
  }),

  listVisitorLogs: catchAsync(async (req, res) => {
    const data = await visitorLogService.list(req.query);
    res.json(ApiResponse.success('Visitor logs fetched', data));
  }),

  listVehicles: catchAsync(async (req, res) => {
    const data = await vehicleService.list(req.query);
    res.json(ApiResponse.success('Vehicles fetched', data));
  }),

  createVehicle: catchAsync(async (req, res) => {
    const data = await vehicleService.create(req.body, req.user);
    res.status(201).json(ApiResponse.success('Vehicle entry recorded', data));
  }),

  recordVehicleExit: catchAsync(async (req, res) => {
    const data = await vehicleService.recordExit(req.params.id, req.user);
    res.json(ApiResponse.success('Vehicle exit recorded', data));
  }),

  listGatePasses: catchAsync(async (req, res) => {
    const data = await gatePassService.list(req.query);
    res.json(ApiResponse.success('Gate passes fetched', data));
  }),

  createGatePass: catchAsync(async (req, res) => {
    const data = await gatePassService.create(req.body, req.user);
    res.status(201).json(ApiResponse.success('Gate pass created', data));
  }),

  changeGatePassStatus: catchAsync(async (req, res) => {
    const data = await gatePassService.changeStatus(req.params.id, req.body.status, req.user);
    res.json(ApiResponse.success('Gate pass status updated', data));
  }),

  listPettyCash: catchAsync(async (req, res) => {
    const data = await pettyCashService.list(req.query);
    res.json(ApiResponse.success('Petty cash transactions fetched', data));
  }),

  createPettyCash: catchAsync(async (req, res) => {
    const data = await pettyCashService.create(req.body, req.user);
    res.status(201).json(ApiResponse.success('Petty cash transaction created', data));
  }),

  changePettyCashStatus: catchAsync(async (req, res) => {
    const data = await pettyCashService.changeStatus(req.params.id, req.body.status, req.user);
    res.json(ApiResponse.success('Petty cash status updated', data));
  }),
};

module.exports = securityController;