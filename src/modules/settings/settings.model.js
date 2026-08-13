const { DataTypes } = require('sequelize');
const sequelize = require('../../database/sequelize');

const Setting = sequelize.define(
  'Setting',
  {
    setting_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    section: {
      type: DataTypes.ENUM('property', 'booking', 'tax', 'communication', 'operational', 'system'),
      allowNull: false,
    },
    key: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    value: { type: DataTypes.TEXT },
    description: { type: DataTypes.STRING(500) },
    updated_by: { type: DataTypes.BIGINT },
  },
  { tableName: 'settings' }
);

module.exports = { Setting };