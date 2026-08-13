const { DataTypes } = require('sequelize');
const sequelize = require('../../database/sequelize');

const AssetCategory = sequelize.define(
  'AssetCategory',
  {
    category_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    description: { type: DataTypes.STRING(500) },
    status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
  },
  { tableName: 'asset_categories' }
);

const Asset = sequelize.define(
  'Asset',
  {
    asset_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    asset_code: { type: DataTypes.STRING(30), allowNull: false, unique: true },
    asset_name: { type: DataTypes.STRING(200), allowNull: false },
    category_id: { type: DataTypes.BIGINT, allowNull: false },
    quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
    unit_value: { type: DataTypes.DECIMAL(18, 2), allowNull: false },
    total_value: { type: DataTypes.DECIMAL(18, 2), allowNull: false },
    purchase_date: { type: DataTypes.DATEONLY, allowNull: false },
    vendor_name: { type: DataTypes.STRING(150) },
    invoice_number: { type: DataTypes.STRING(100) },
    location: { type: DataTypes.STRING(150) },
    department_id: { type: DataTypes.BIGINT },
    depreciation_method: { type: DataTypes.ENUM('straight_line', 'reducing_balance'), defaultValue: 'straight_line' },
    useful_life_years: { type: DataTypes.INTEGER },
    residual_value: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
    current_book_value: { type: DataTypes.DECIMAL(18, 2), allowNull: false },
    status: { type: DataTypes.ENUM('active', 'in_repair', 'scrapped', 'disposed'), defaultValue: 'active' },
    notes: { type: DataTypes.TEXT },
    created_by: { type: DataTypes.BIGINT },
    updated_by: { type: DataTypes.BIGINT },
  },
  { tableName: 'assets' }
);

const AssetMovement = sequelize.define(
  'AssetMovement',
  {
    movement_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    asset_id: { type: DataTypes.BIGINT, allowNull: false },
    from_location: { type: DataTypes.STRING(150) },
    to_location: { type: DataTypes.STRING(150), allowNull: false },
    moved_at: { type: DataTypes.DATE, allowNull: false },
    moved_by: { type: DataTypes.BIGINT },
    notes: { type: DataTypes.TEXT },
  },
  { tableName: 'asset_movements' }
);

const AssetDepreciation = sequelize.define(
  'AssetDepreciation',
  {
    depreciation_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    asset_id: { type: DataTypes.BIGINT, allowNull: false },
    period: { type: DataTypes.STRING(7), allowNull: false },
    amount: { type: DataTypes.DECIMAL(18, 2), allowNull: false },
    accumulated_depreciation: { type: DataTypes.DECIMAL(18, 2), allowNull: false },
    book_value_after: { type: DataTypes.DECIMAL(18, 2), allowNull: false },
    created_by: { type: DataTypes.BIGINT },
  },
  { tableName: 'asset_depreciation' }
);

module.exports = { AssetCategory, Asset, AssetMovement, AssetDepreciation };