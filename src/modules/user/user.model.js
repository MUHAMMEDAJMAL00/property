const { DataTypes } = require('sequelize');
const sequelize = require('../../database/sequelize');

const User = sequelize.define(
  'User',
  {
    user_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    first_name: { type: DataTypes.STRING(100), allowNull: false },
    last_name: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    mobile: { type: DataTypes.STRING(20) },
    password_hash: { type: DataTypes.STRING(255), allowNull: false },
    role_id: { type: DataTypes.BIGINT, allowNull: false },
    employee_id: { type: DataTypes.BIGINT },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    last_login_at: { type: DataTypes.DATE },
    created_by: { type: DataTypes.BIGINT },
    updated_by: { type: DataTypes.BIGINT },
  },
  { tableName: 'users', paranoid: true }
);

User.prototype.toJSON = function toJSON() {
  const values = { ...this.get() };
  delete values.password_hash;
  return values;
};

module.exports = { User };