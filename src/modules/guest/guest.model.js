const { DataTypes } = require('sequelize');
const sequelize = require('../../database/sequelize');

const Guest = sequelize.define(
  'Guest',
  {
    guest_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    first_name: { type: DataTypes.STRING(100), allowNull: false },
    last_name: { type: DataTypes.STRING(100), allowNull: false },
    mobile: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    email: { type: DataTypes.STRING(150) },
    dob: { type: DataTypes.DATEONLY },
    gender: { type: DataTypes.ENUM('male', 'female', 'other') },
    nationality: { type: DataTypes.STRING(100) },
    address: { type: DataTypes.STRING(500) },
    city: { type: DataTypes.STRING(100) },
    country: { type: DataTypes.STRING(100), defaultValue: 'India' },
    id_type: { type: DataTypes.STRING(50) },
    id_number: { type: DataTypes.STRING(100) },
    id_document_url: { type: DataTypes.STRING(500) },
    company_id: { type: DataTypes.BIGINT },
    notes: { type: DataTypes.TEXT },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    created_by: { type: DataTypes.BIGINT },
    updated_by: { type: DataTypes.BIGINT },
  },
  { tableName: 'guests', paranoid: true }
);

module.exports = { Guest };