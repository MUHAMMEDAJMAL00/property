const { Op } = require('sequelize');
const { Attendance, Holiday, OvertimeRecord } = require('./attendance.model');
const createCrudService = require('../../utils/genericCrud');

const attendanceService = createCrudService(Attendance, {
  filterFields: ['employee_id', 'status', 'attendance_date'],
  includes: ['employee'],
});

attendanceService.mark = async (employeeId, date, clockInAt, user) => {
  const [attendance, created] = await Attendance.findOrCreate({
    where: { employee_id: employeeId, attendance_date: date },
    defaults: { clock_in_at: clockInAt, status: 'present', created_by: user ? user.user_id : null },
  });
  if (!created) {
    await attendance.update({ clock_in_at: clockInAt || attendance.clock_in_at, updated_by: user ? user.user_id : null });
  }
  return attendanceService.getById(attendance.attendance_id);
};

attendanceService.clockOut = async (attendanceId, clockOutAt) => {
  const attendance = await attendanceService.getById(attendanceId);
  const start = attendance.clock_in_at ? new Date(attendance.clock_in_at) : new Date();
  const end = clockOutAt ? new Date(clockOutAt) : new Date();
  const hours = Math.max(0, (end - start) / (1000 * 60 * 60));
  await attendance.update({ clock_out_at: end, hours_worked: Math.round(hours * 100) / 100, status: 'present' });
  return attendanceService.getById(attendanceId);
};

attendanceService.monthlySummary = async (query) => {
  const { employee_id: employeeId, month } = query;
  if (!month) throw new (require('../../utils/ApiError')).badRequest('month is required (YYYY-MM)');

  const [year, mon] = month.split('-').map(Number);
  const from = new Date(year, mon - 1, 1).toISOString().slice(0, 10);
  const to = new Date(year, mon, 0).toISOString().slice(0, 10);

  const where = { attendance_date: { [Op.between]: [from, to] } };
  if (employeeId) where.employee_id = employeeId;

  const records = await Attendance.findAll({
    where,
    include: [{ association: 'employee', attributes: ['employee_id', 'employee_code', 'first_name', 'last_name'] }],
    order: [['attendance_date', 'ASC']],
  });

  const summary = {};
  records.forEach((r) => {
    const key = r.employee_id;
    if (!summary[key]) summary[key] = { employee: r.employee, present: 0, absent: 0, half_day: 0, leave: 0, total_hours: 0 };
    if (summary[key][r.status] !== undefined) summary[key][r.status] += 1;
    summary[key].total_hours += Number(r.hours_worked || 0);
  });

  return { month, from, to, records: Object.values(summary) };
};

const holidayService = createCrudService(Holiday, {
  searchFields: ['name'],
  filterFields: ['year'],
});

const overtimeService = createCrudService(OvertimeRecord, {
  filterFields: ['employee_id', 'status'],
  includes: ['employee'],
});

overtimeService.approve = async (id, status, user) => {
  const record = await overtimeService.getById(id);
  await record.update({ status, approved_by: user ? user.user_id : null, approved_at: new Date(), updated_by: user ? user.user_id : null });
  return overtimeService.getById(id);
};

module.exports = { attendanceService, holidayService, overtimeService };