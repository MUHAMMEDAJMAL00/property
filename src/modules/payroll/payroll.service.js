const { Op } = require('sequelize');
const {
  LeaveType,
  LeaveRequest,
  StaffAdvance,
  SalaryStructure,
  SalaryComponent,
  Payroll,
} = require('./payroll.model');
const createCrudService = require('../../utils/genericCrud');
const ApiError = require('../../utils/ApiError');

const leaveTypeService = createCrudService(LeaveType, {
  searchFields: ['name'],
  filterFields: ['status'],
});

const leaveRequestService = createCrudService(LeaveRequest, {
  filterFields: ['employee_id', 'leave_type_id', 'status'],
  includes: ['employee', 'leaveType'],
});

leaveRequestService.create = async (data, user) => {
  const fromDate = new Date(data.from_date);
  const toDate = new Date(data.to_date);
  const days = Math.round((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1;
  if (days <= 0) throw ApiError.badRequest('to_date must be on or after from_date');
  return LeaveRequest.create({ ...data, days, created_by: user ? user.user_id : null });
};

leaveRequestService.approve = async (id, status, user) => {
  const request = await leaveRequestService.getById(id);
  if (status === 'cancelled' && request.status !== 'pending') {
    throw ApiError.badRequest('Only pending requests can be cancelled');
  }
  await request.update({
    status,
    approved_by: user ? user.user_id : null,
    approved_at: ['approved', 'rejected'].includes(status) ? new Date() : null,
    updated_by: user ? user.user_id : null,
  });
  return leaveRequestService.getById(id);
};

const advanceService = createCrudService(StaffAdvance, {
  filterFields: ['employee_id', 'status'],
  includes: ['employee'],
});

advanceService.create = async (data, user) => {
  const monthlyRecovery = Number(data.monthly_recovery) || (Number(data.recovery_months) ? Number(data.amount) / Number(data.recovery_months) : 0);
  return StaffAdvance.create({
    ...data,
    monthly_recovery: monthlyRecovery,
    outstanding_amount: data.amount,
    created_by: user ? user.user_id : null,
  });
};

const structureService = createCrudService(SalaryStructure, {
  searchFields: ['notes'],
  filterFields: ['employee_id', 'is_current'],
  includes: ['employee', 'components'],
});

structureService.create = async (data, user) => {
  const structure = await SalaryStructure.create({ ...data, created_by: user ? user.user_id : null });
  if (data.components && data.components.length) {
    await SalaryComponent.bulkCreate(data.components.map((c) => ({ ...c, structure_id: structure.structure_id })));
  }
  return structureService.getById(structure.structure_id);
};

const payrollService = createCrudService(Payroll, {
  filterFields: ['employee_id', 'payroll_month', 'status'],
  includes: ['employee'],
});

payrollService.create = async (data, user) => {
  const existing = await Payroll.findOne({ where: { employee_id: data.employee_id, payroll_month: data.payroll_month } });
  if (existing) throw ApiError.conflict('Payroll already exists for this employee and month');

  const gross = Number(data.basic_pay || 0) + Number(data.allowances || 0) + Number(data.overtime_pay || 0);
  const net = gross - Number(data.deductions || 0) - Number(data.advance_recovery || 0);
  return Payroll.create({
    ...data,
    gross_amount: data.gross_amount || gross,
    net_amount: data.net_amount || net,
    created_by: user ? user.user_id : null,
  });
};

payrollService.changeStatus = async (id, status, user) => {
  const payroll = await payrollService.getById(id);
  const updates = { status, updated_by: user ? user.user_id : null };
  if (status === 'paid') updates.paid_at = new Date();
  await payroll.update(updates);
  return payrollService.getById(id);
};

module.exports = { leaveTypeService, leaveRequestService, advanceService, structureService, payrollService };