const { DataTypes } = require('sequelize');
const sequelize = require('../../database/sequelize');

const Company = sequelize.define(
  'Company',
  {
    company_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    company_name: { type: DataTypes.STRING(200), allowNull: false, unique: true },
    contact_person: { type: DataTypes.STRING(100) },
    mobile: { type: DataTypes.STRING(20) },
    email: { type: DataTypes.STRING(150) },
    address: { type: DataTypes.STRING(500) },
    gst_number: { type: DataTypes.STRING(50) },
    company_type: { type: DataTypes.ENUM('corporate', 'travel_agency', 'tour_operator', 'organization', 'other') },
    status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
    notes: { type: DataTypes.TEXT },
    created_by: { type: DataTypes.BIGINT },
    updated_by: { type: DataTypes.BIGINT },
  },
  { tableName: 'companies', paranoid: true }
);

module.exports = { Company };