const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const { attendanceService, holidayService, overtimeService } = require('./attendance.service');

const attendanceController = {
  listAttendance: catchAsync(async (req, res) => {
    const data = await attendanceService.list(req.query);
    res.json(ApiResponse.success('Attendance fetched', data));
  }),

  markAttendance: catchAsync(async (req, res) => {
    const { employee_id, attendance_date, clock_in_at } = req.body;
    const data = await attendanceService.mark(employee_id, attendance_date, clock_in_at, req.user);
    res.status(201).json(ApiResponse.success('Attendance marked', data));
  }),

  clockOut: catchAsync(async (req, res) => {
    const data = await attendanceService.clockOut(req.params.id, req.body.clock_out_at);
    res.json(ApiResponse.success('Attendance clocked out', data));
  }),

  monthlySummary: catchAsync(async (req, res) => {
    const data = await attendanceService.monthlySummary(req.query);
    res.json(ApiResponse.success('Monthly summary fetched', data));
  }),

  listHolidays: catchAsync(async (req, res) => {
    const data = await holidayService.list(req.query);
    res.json(ApiResponse.success('Holidays fetched', data));
  }),

  createHoliday: catchAsync(async (req, res) => {
    const data = await holidayService.create(req.body);
    res.status(201).json(ApiResponse.success('Holiday created', data));
  }),

  listOvertime: catchAsync(async (req, res) => {
    const data = await overtimeService.list(req.query);
    res.json(ApiResponse.success('Overtime records fetched', data));
  }),

  createOvertime: catchAsync(async (req, res) => {
    const data = await overtimeService.create(req.body, req.user);
    res.status(201).json(ApiResponse.success('Overtime record created', data));
  }),

  reviewOvertime: catchAsync(async (req, res) => {
    const data = await overtimeService.approve(req.params.id, req.body.status, req.user);
    res.json(ApiResponse.success('Overtime review updated', data));
  }),
};

module.exports = attendanceController;