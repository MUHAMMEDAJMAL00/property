const { DataTypes } = require('sequelize');
const sequelize = require('../../database/sequelize');

const Property = sequelize.define(
  'Property',
  {
    property_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    legal_name: { type: DataTypes.STRING(200) },
    restaurant_name: { type: DataTypes.STRING(150) },
    phone: { type: DataTypes.STRING(20) },
    email: { type: DataTypes.STRING(150) },
    address: { type: DataTypes.STRING(500) },
    city: { type: DataTypes.STRING(100) },
    state: { type: DataTypes.STRING(100) },
    country: { type: DataTypes.STRING(100), defaultValue: 'India' },
    zip_code: { type: DataTypes.STRING(20) },
    gst_number: { type: DataTypes.STRING(50) },
    logo_url: { type: DataTypes.STRING(500) },
    currency: { type: DataTypes.STRING(10), defaultValue: 'INR' },
    is_default: { type: DataTypes.BOOLEAN, defaultValue: false },
    status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
    created_by: { type: DataTypes.BIGINT },
    updated_by: { type: DataTypes.BIGINT },
  },
  { tableName: 'properties', paranoid: true }
);

module.exports = { Property };