const { DataTypes } = require('sequelize');
const sequelize = require('../../database/sequelize');

const Attendance = sequelize.define(
  'Attendance',
  {
    attendance_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    employee_id: { type: DataTypes.BIGINT, allowNull: false },
    attendance_date: { type: DataTypes.DATEONLY, allowNull: false },
    clock_in_at: { type: DataTypes.DATE },
    clock_out_at: { type: DataTypes.DATE },
    hours_worked: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
    status: { type: DataTypes.ENUM('present', 'absent', 'half_day', 'leave', 'holiday'), defaultValue: 'present' },
    notes: { type: DataTypes.TEXT },
    created_by: { type: DataTypes.BIGINT },
    updated_by: { type: DataTypes.BIGINT },
  },
  { tableName: 'attendance', indexes: [{ unique: true, fields: ['employee_id', 'attendance_date'] }] }
);

const Holiday = sequelize.define(
  'Holiday',
  {
    holiday_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    holiday_date: { type: DataTypes.DATEONLY, allowNull: false },
    name: { type: DataTypes.STRING(150), allowNull: false },
    year: { type: DataTypes.INTEGER, allowNull: false },
    is_optional: { type: DataTypes.BOOLEAN, defaultValue: false },
    notes: { type: DataTypes.TEXT },
    created_by: { type: DataTypes.BIGINT },
    updated_by: { type: DataTypes.BIGINT },
  },
  { tableName: 'holidays', indexes: [{ unique: true, fields: ['holiday_date'] }] }
);

const OvertimeRecord = sequelize.define(
  'OvertimeRecord',
  {
    overtime_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    employee_id: { type: DataTypes.BIGINT, allowNull: false },
    overtime_date: { type: DataTypes.DATEONLY, allowNull: false },
    hours: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
    description: { type: DataTypes.STRING(300) },
    status: { type: DataTypes.ENUM('pending', 'approved', 'rejected'), defaultValue: 'pending' },
    approved_by: { type: DataTypes.BIGINT },
    approved_at: { type: DataTypes.DATE },
    notes: { type: DataTypes.TEXT },
    created_by: { type: DataTypes.BIGINT },
    updated_by: { type: DataTypes.BIGINT },
  },
  { tableName: 'overtime_records' }
);

module.exports = { Attendance, Holiday, OvertimeRecord };