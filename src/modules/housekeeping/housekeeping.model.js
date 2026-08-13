const { DataTypes } = require('sequelize');
const sequelize = require('../../database/sequelize');

const TASK_STATUS = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
  VERIFIED: 'verified',
};

const HousekeepingTaskType = sequelize.define(
  'HousekeepingTaskType',
  {
    task_type_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    description: { type: DataTypes.STRING(500) },
    status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
  },
  { tableName: 'housekeeping_task_types' }
);

const HousekeepingTask = sequelize.define(
  'HousekeepingTask',
  {
    task_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    room_id: { type: DataTypes.BIGINT, allowNull: false },
    task_type_id: { type: DataTypes.BIGINT, allowNull: false },
    priority: { type: DataTypes.ENUM('low', 'normal', 'high'), defaultValue: 'normal' },
    status: { type: DataTypes.ENUM(...Object.values(TASK_STATUS)), defaultValue: 'pending' },
    assigned_staff_id: { type: DataTypes.BIGINT },
    instructions: { type: DataTypes.TEXT },
    notes: { type: DataTypes.TEXT },
    started_at: { type: DataTypes.DATE },
    completed_at: { type: DataTypes.DATE },
    verified_by: { type: DataTypes.BIGINT },
    verified_at: { type: DataTypes.DATE },
    created_by: { type: DataTypes.BIGINT },
    updated_by: { type: DataTypes.BIGINT },
  },
  { tableName: 'housekeeping_tasks' }
);

const DamageAndMissing = sequelize.define(
  'DamageAndMissing',
  {
    damage_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    room_id: { type: DataTypes.BIGINT, allowNull: false },
    booking_id: { type: DataTypes.BIGINT },
    item: { type: DataTypes.STRING(150), allowNull: false },
    description: { type: DataTypes.TEXT },
    quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
    estimated_cost: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
    evidence_url: { type: DataTypes.STRING(500) },
    status: { type: DataTypes.ENUM('reported', 'reviewed', 'charge_guest', 'closed'), defaultValue: 'reported' },
    reported_by: { type: DataTypes.BIGINT },
    reported_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    created_by: { type: DataTypes.BIGINT },
    updated_by: { type: DataTypes.BIGINT },
  },
  { tableName: 'damages_and_missing' }
);

const Laundry = sequelize.define(
  'Laundry',
  {
    laundry_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    room_id: { type: DataTypes.BIGINT },
    guest_id: { type: DataTypes.BIGINT },
    item_type: { type: DataTypes.ENUM('linen', 'towel', 'bedsheet', 'pillow_cover', 'guest_laundry', 'other'), defaultValue: 'linen' },
    quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
    collection_date: { type: DataTypes.DATEONLY, allowNull: false },
    expected_return_date: { type: DataTypes.DATEONLY },
    status: { type: DataTypes.ENUM('pending', 'collected', 'processing', 'completed', 'delivered'), defaultValue: 'pending' },
    staff_id: { type: DataTypes.BIGINT },
    notes: { type: DataTypes.TEXT },
    created_by: { type: DataTypes.BIGINT },
    updated_by: { type: DataTypes.BIGINT },
  },
  { tableName: 'laundry' }
);

module.exports = {
  HousekeepingTaskType,
  HousekeepingTask,
  DamageAndMissing,
  Laundry,
  TASK_STATUS,
};