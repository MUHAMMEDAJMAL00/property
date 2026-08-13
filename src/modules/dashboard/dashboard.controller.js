const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const dashboardService = require('./dashboard.service');

const dashboardController = {
  desk: catchAsync(async (req, res) => {
    const data = await dashboardService.deskStats();
    res.json(ApiResponse.success('Desk stats fetched', data));
  }),

  roomBoard: catchAsync(async (req, res) => {
    const data = await dashboardService.roomBoard();
    res.json(ApiResponse.success('Room board fetched', data));
  }),

  housekeeping: catchAsync(async (req, res) => {
    const data = await dashboardService.housekeepingSummary();
    res.json(ApiResponse.success('Housekeeping summary fetched', data));
  }),

  maintenance: catchAsync(async (req, res) => {
    const data = await dashboardService.maintenanceSummary();
    res.json(ApiResponse.success('Maintenance summary fetched', data));
  }),

  security: catchAsync(async (req, res) => {
    const data = await dashboardService.securitySummary();
    res.json(ApiResponse.success('Security summary fetched', data));
  }),

  billing: catchAsync(async (req, res) => {
    const data = await dashboardService.billingSummary();
    res.json(ApiResponse.success('Billing summary fetched', data));
  }),
};

module.exports = dashboardController;