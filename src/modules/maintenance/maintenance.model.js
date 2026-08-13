const { DataTypes } = require('sequelize');
const sequelize = require('../../database/sequelize');

const MAINTENANCE_STATUS = {
  OPEN: 'open',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  PENDING_APPROVAL: 'pending_approval',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  CANCELLED: 'cancelled',
};

const MaintenanceCategory = sequelize.define(
  'MaintenanceCategory',
  {
    category_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    description: { type: DataTypes.STRING(500) },
    status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
  },
  { tableName: 'maintenance_categories' }
);

const MaintenanceArea = sequelize.define(
  'MaintenanceArea',
  {
    area_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    description: { type: DataTypes.STRING(500) },
    status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
  },
  { tableName: 'maintenance_areas' }
);

const MaintenanceRequest = sequelize.define(
  'MaintenanceRequest',
  {
    request_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    request_number: { type: DataTypes.STRING(30), allowNull: false, unique: true },
    location_type: { type: DataTypes.ENUM('room', 'area', 'other'), allowNull: false },
    room_id: { type: DataTypes.BIGINT },
    area_id: { type: DataTypes.BIGINT },
    title: { type: DataTypes.STRING(200), allowNull: false },
    category_id: { type: DataTypes.BIGINT, allowNull: false },
    priority: { type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'), defaultValue: 'normal' },
    description: { type: DataTypes.TEXT },
    notes: { type: DataTypes.TEXT },
    status: { type: DataTypes.ENUM(...Object.values(MAINTENANCE_STATUS)), defaultValue: 'open' },
    assigned_staff_id: { type: DataTypes.BIGINT },
    started_at: { type: DataTypes.DATE },
    completed_at: { type: DataTypes.DATE },
    approved_by: { type: DataTypes.BIGINT },
    resolved_at: { type: DataTypes.DATE },
    resolution_notes: { type: DataTypes.TEXT },
    cost: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
    reported_by: { type: DataTypes.BIGINT, allowNull: false },
    created_by: { type: DataTypes.BIGINT },
    updated_by: { type: DataTypes.BIGINT },
  },
  { tableName: 'maintenance_requests' }
);

const MaintenanceStatusHistory = sequelize.define(
  'MaintenanceStatusHistory',
  {
    history_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    request_id: { type: DataTypes.BIGINT, allowNull: false },
    from_status: { type: DataTypes.STRING(50) },
    to_status: { type: DataTypes.STRING(50), allowNull: false },
    changed_by: { type: DataTypes.BIGINT },
    notes: { type: DataTypes.STRING(500) },
  },
  { tableName: 'maintenance_status_history' }
);

module.exports = {
  MaintenanceCategory,
  MaintenanceArea,
  MaintenanceRequest,
  MaintenanceStatusHistory,
  MAINTENANCE_STATUS,
};