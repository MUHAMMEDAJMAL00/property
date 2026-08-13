const { DataTypes } = require('sequelize');
const sequelize = require('../../database/sequelize');

const Department = sequelize.define(
  'Department',
  {
    department_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    code: { type: DataTypes.STRING(20), unique: true },
    description: { type: DataTypes.STRING(500) },
    status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
    created_by: { type: DataTypes.BIGINT },
    updated_by: { type: DataTypes.BIGINT },
  },
  { tableName: 'departments', paranoid: true }
);

module.exports = { Department };