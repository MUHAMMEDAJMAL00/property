const { DataTypes } = require('sequelize');
const sequelize = require('../../database/sequelize');

const Amenity = sequelize.define(
  'Amenity',
  {
    amenity_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    description: { type: DataTypes.STRING(500) },
    icon: { type: DataTypes.STRING(100) },
    status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
    created_by: { type: DataTypes.BIGINT },
    updated_by: { type: DataTypes.BIGINT },
  },
  { tableName: 'amenities', paranoid: true }
);

module.exports = { Amenity };