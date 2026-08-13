const { DataTypes } = require('sequelize');
const sequelize = require('../../database/sequelize');

const Permission = sequelize.define(
  'Permission',
  {
    permission_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    description: { type: DataTypes.STRING(255) },
    created_by: { type: DataTypes.BIGINT },
    updated_by: { type: DataTypes.BIGINT },
  },
  { tableName: 'permissions' }
);

const Role = sequelize.define(
  'Role',
  {
    role_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    description: { type: DataTypes.STRING(255) },
    is_system: { type: DataTypes.BOOLEAN, defaultValue: false },
    created_by: { type: DataTypes.BIGINT },
    updated_by: { type: DataTypes.BIGINT },
  },
  { tableName: 'roles', paranoid: true }
);

const RolePermission = sequelize.define(
  'RolePermission',
  {
    role_id: { type: DataTypes.BIGINT, allowNull: false, primaryKey: true },
    permission_id: { type: DataTypes.BIGINT, allowNull: false, primaryKey: true },
  },
  { tableName: 'role_permissions', timestamps: false }
);

module.exports = { Role, Permission, RolePermission };