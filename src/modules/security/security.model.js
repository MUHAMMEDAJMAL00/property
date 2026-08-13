const { DataTypes } = require('sequelize');
const sequelize = require('../../database/sequelize');

const Visitor = sequelize.define(
  'Visitor',
  {
    visitor_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(150), allowNull: false },
    mobile: { type: DataTypes.STRING(20) },
    id_type: { type: DataTypes.STRING(50) },
    id_number: { type: DataTypes.STRING(100) },
    purpose: { type: DataTypes.STRING(200), allowNull: false },
    to_visit_person: { type: DataTypes.STRING(150) },
    to_visit_department: { type: DataTypes.STRING(150) },
    notes: { type: DataTypes.TEXT },
    created_by: { type: DataTypes.BIGINT },
    updated_by: { type: DataTypes.BIGINT },
  },
  { tableName: 'visitors' }
);

const VisitorLog = sequelize.define(
  'VisitorLog',
  {
    log_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    visitor_id: { type: DataTypes.BIGINT, allowNull: false },
    entry_at: { type: DataTypes.DATE, allowNull: false },
    exit_at: { type: DataTypes.DATE },
    security_staff_id: { type: DataTypes.BIGINT },
    notes: { type: DataTypes.TEXT },
    created_by: { type: DataTypes.BIGINT },
  },
  { tableName: 'visitor_logs' }
);

const Vehicle = sequelize.define(
  'Vehicle',
  {
    vehicle_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    vehicle_number: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    vehicle_type: { type: DataTypes.ENUM('car', 'bike', 'truck', 'bus', 'van', 'other'), defaultValue: 'car' },
    driver_name: { type: DataTypes.STRING(150) },
    driver_mobile: { type: DataTypes.STRING(20) },
    owner_type: { type: DataTypes.ENUM('visitor', 'guest', 'staff', 'other'), defaultValue: 'visitor' },
    owner_name: { type: DataTypes.STRING(150) },
    parking_location: { type: DataTypes.STRING(100) },
    status: { type: DataTypes.ENUM('inside', 'outside'), defaultValue: 'outside' },
    notes: { type: DataTypes.TEXT },
    created_by: { type: DataTypes.BIGINT },
    updated_by: { type: DataTypes.BIGINT },
  },
  { tableName: 'vehicles' }
);

const VehicleEntryExit = sequelize.define(
  'VehicleEntryExit',
  {
    entry_exit_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    vehicle_id: { type: DataTypes.BIGINT, allowNull: false },
    entry_at: { type: DataTypes.DATE, allowNull: false },
    exit_at: { type: DataTypes.DATE },
    security_staff_id: { type: DataTypes.BIGINT },
    purpose: { type: DataTypes.STRING(200) },
    parking_location: { type: DataTypes.STRING(100) },
    notes: { type: DataTypes.TEXT },
    created_by: { type: DataTypes.BIGINT },
  },
  { tableName: 'vehicle_entry_exits' }
);

const GatePass = sequelize.define(
  'GatePass',
  {
    gate_pass_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    pass_number: { type: DataTypes.STRING(30), allowNull: false, unique: true },
    pass_type: { type: DataTypes.ENUM('material', 'equipment', 'vehicle', 'other'), defaultValue: 'material' },
    person_name: { type: DataTypes.STRING(150) },
    department_name: { type: DataTypes.STRING(150) },
    vehicle_id: { type: DataTypes.BIGINT },
    purpose: { type: DataTypes.STRING(300), allowNull: false },
    issued_at: { type: DataTypes.DATE, allowNull: false },
    issued_by: { type: DataTypes.BIGINT },
    expected_return_at: { type: DataTypes.DATE },
    actual_return_at: { type: DataTypes.DATE },
    approved_by: { type: DataTypes.BIGINT },
    status: { type: DataTypes.ENUM('pending', 'issued', 'returned', 'closed', 'cancelled'), defaultValue: 'pending' },
    notes: { type: DataTypes.TEXT },
    created_by: { type: DataTypes.BIGINT },
    updated_by: { type: DataTypes.BIGINT },
  },
  { tableName: 'gate_passes' }
);

const GatePassItem = sequelize.define(
  'GatePassItem',
  {
    gate_pass_item_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    gate_pass_id: { type: DataTypes.BIGINT, allowNull: false },
    item_name: { type: DataTypes.STRING(150), allowNull: false },
    quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
    remarks: { type: DataTypes.STRING(300) },
  },
  { tableName: 'gate_pass_items' }
);

const PettyCashTransaction = sequelize.define(
  'PettyCashTransaction',
  {
    petty_cash_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    transaction_date: { type: DataTypes.DATEONLY, allowNull: false },
    amount: { type: DataTypes.DECIMAL(18, 2), allowNull: false },
    transaction_type: { type: DataTypes.ENUM('in', 'out'), allowNull: false },
    expense_category: { type: DataTypes.STRING(100) },
    description: { type: DataTypes.STRING(300) },
    paid_to: { type: DataTypes.STRING(150) },
    receipt_url: { type: DataTypes.STRING(500) },
    status: { type: DataTypes.ENUM('pending', 'approved', 'rejected', 'completed'), defaultValue: 'pending' },
    created_by: { type: DataTypes.BIGINT },
    approved_by: { type: DataTypes.BIGINT },
    notes: { type: DataTypes.TEXT },
  },
  { tableName: 'petty_cash_transactions' }
);

module.exports = {
  Visitor,
  VisitorLog,
  Vehicle,
  VehicleEntryExit,
  GatePass,
  GatePassItem,
  PettyCashTransaction,
};