const { DataTypes } = require('sequelize');
const sequelize = require('../../database/sequelize');

const LeaveType = sequelize.define(
  'LeaveType',
  {
    leave_type_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    code: { type: DataTypes.STRING(10), unique: true },
    days_per_year: { type: DataTypes.INTEGER, allowNull: false },
    description: { type: DataTypes.STRING(500) },
    status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
  },
  { tableName: 'leave_types' }
);

const LeaveRequest = sequelize.define(
  'LeaveRequest',
  {
    leave_request_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    employee_id: { type: DataTypes.BIGINT, allowNull: false },
    leave_type_id: { type: DataTypes.BIGINT, allowNull: false },
    from_date: { type: DataTypes.DATEONLY, allowNull: false },
    to_date: { type: DataTypes.DATEONLY, allowNull: false },
    days: { type: DataTypes.INTEGER, allowNull: false },
    reason: { type: DataTypes.TEXT },
    status: { type: DataTypes.ENUM('pending', 'approved', 'rejected', 'cancelled'), defaultValue: 'pending' },
    approved_by: { type: DataTypes.BIGINT },
    approved_at: { type: DataTypes.DATE },
    notes: { type: DataTypes.TEXT },
    created_by: { type: DataTypes.BIGINT },
    updated_by: { type: DataTypes.BIGINT },
  },
  { tableName: 'leave_requests' }
);

const StaffAdvance = sequelize.define(
  'StaffAdvance',
  {
    advance_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    employee_id: { type: DataTypes.BIGINT, allowNull: false },
    advance_date: { type: DataTypes.DATEONLY, allowNull: false },
    amount: { type: DataTypes.DECIMAL(18, 2), allowNull: false },
    purpose: { type: DataTypes.STRING(300) },
    recovery_months: { type: DataTypes.INTEGER, defaultValue: 1 },
    monthly_recovery: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
    outstanding_amount: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
    status: { type: DataTypes.ENUM('open', 'recovering', 'settled', 'written_off'), defaultValue: 'open' },
    notes: { type: DataTypes.TEXT },
    created_by: { type: DataTypes.BIGINT },
    updated_by: { type: DataTypes.BIGINT },
  },
  { tableName: 'staff_advances' }
);

const SalaryStructure = sequelize.define(
  'SalaryStructure',
  {
    structure_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    employee_id: { type: DataTypes.BIGINT, allowNull: false },
    effective_from: { type: DataTypes.DATEONLY, allowNull: false },
    gross_salary: { type: DataTypes.DECIMAL(18, 2), allowNull: false },
    is_current: { type: DataTypes.BOOLEAN, defaultValue: true },
    notes: { type: DataTypes.TEXT },
    created_by: { type: DataTypes.BIGINT },
    updated_by: { type: DataTypes.BIGINT },
  },
  { tableName: 'salary_structures' }
);

const SalaryComponent = sequelize.define(
  'SalaryComponent',
  {
    component_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    structure_id: { type: DataTypes.BIGINT, allowNull: false },
    component_name: { type: DataTypes.STRING(100), allowNull: false },
    component_type: { type: DataTypes.ENUM('earning', 'deduction'), allowNull: false },
    amount: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
    is_percentage: { type: DataTypes.BOOLEAN, defaultValue: false },
    percentage_value: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
  },
  { tableName: 'salary_components' }
);

const Payroll = sequelize.define(
  'Payroll',
  {
    payroll_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    employee_id: { type: DataTypes.BIGINT, allowNull: false },
    payroll_month: { type: DataTypes.STRING(7), allowNull: false },
    basic_pay: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
    allowances: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
    deductions: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
    overtime_pay: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
    advance_recovery: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
    gross_amount: { type: DataTypes.DECIMAL(18, 2), allowNull: false },
    net_amount: { type: DataTypes.DECIMAL(18, 2), allowNull: false },
    status: { type: DataTypes.ENUM('draft', 'processed', 'paid'), defaultValue: 'draft' },
    paid_at: { type: DataTypes.DATE },
    payment_mode: { type: DataTypes.ENUM('cash', 'card', 'bank_transfer', 'upi', 'other'), defaultValue: 'bank_transfer' },
    notes: { type: DataTypes.TEXT },
    created_by: { type: DataTypes.BIGINT },
    updated_by: { type: DataTypes.BIGINT },
  },
  { tableName: 'payroll_records', indexes: [{ unique: true, fields: ['employee_id', 'payroll_month'] }] }
);

module.exports = { LeaveType, LeaveRequest, StaffAdvance, SalaryStructure, SalaryComponent, Payroll };