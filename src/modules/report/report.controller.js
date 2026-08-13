const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const reportService = require('./report.service');

const reportController = {
  salesSummary: catchAsync(async (req, res) => {
    const data = await reportService.salesSummary(req.query);
    res.json(ApiResponse.success('Sales summary generated', data));
  }),

  occupancy: catchAsync(async (req, res) => {
    const data = await reportService.occupancyReport(req.query);
    res.json(ApiResponse.success('Occupancy report generated', data));
  }),

  bookingsByStatus: catchAsync(async (req, res) => {
    const data = await reportService.bookingsByStatus(req.query);
    res.json(ApiResponse.success('Booking status report generated', data));
  }),
};

module.exports = reportController;