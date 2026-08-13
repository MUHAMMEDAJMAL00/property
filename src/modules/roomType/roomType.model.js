const { DataTypes } = require('sequelize');
const sequelize = require('../../database/sequelize');

const RoomType = sequelize.define(
  'RoomType',
  {
    room_type_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    description: { type: DataTypes.STRING(500) },
    base_rate: { type: DataTypes.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
    max_adults: { type: DataTypes.INTEGER, defaultValue: 2 },
    max_children: { type: DataTypes.INTEGER, defaultValue: 0 },
    bed_type: { type: DataTypes.STRING(50) },
    tax_category: { type: DataTypes.STRING(50), defaultValue: 'standard' },
    status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
    created_by: { type: DataTypes.BIGINT },
    updated_by: { type: DataTypes.BIGINT },
  },
  { tableName: 'room_types', paranoid: true }
);

module.exports = { RoomType };