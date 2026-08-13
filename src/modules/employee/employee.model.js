const { DataTypes } = require('sequelize');
const sequelize = require('../../database/sequelize');

const Employee = sequelize.define(
  'Employee',
  {
    employee_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    employee_code: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    first_name: { type: DataTypes.STRING(100), allowNull: false },
    last_name: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(150), unique: true },
    mobile: { type: DataTypes.STRING(20) },
    gender: { type: DataTypes.ENUM('male', 'female', 'other') },
    dob: { type: DataTypes.DATEONLY },
    address: { type: DataTypes.STRING(500) },
    department_id: { type: DataTypes.BIGINT },
    designation: { type: DataTypes.STRING(100) },
    employment_category: { type: DataTypes.ENUM('permanent', 'contract', 'trainee', 'other'), defaultValue: 'permanent' },
    join_date: { type: DataTypes.DATEONLY },
    status: { type: DataTypes.ENUM('active', 'on_leave', 'inactive'), defaultValue: 'active' },
    created_by: { type: DataTypes.BIGINT },
    updated_by: { type: DataTypes.BIGINT },
  },
  { tableName: 'employees', paranoid: true }
);

module.exports = { Employee };