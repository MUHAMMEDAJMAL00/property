const { DataTypes } = require('sequelize');
const sequelize = require('../../database/sequelize');

const ChartOfAccount = sequelize.define(
  'ChartOfAccount',
  {
    account_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    account_code: { type: DataTypes.STRING(30), allowNull: false, unique: true },
    account_name: { type: DataTypes.STRING(150), allowNull: false },
    account_type: {
      type: DataTypes.ENUM('asset', 'liability', 'equity', 'revenue', 'expense'),
      allowNull: false,
    },
    parent_account_id: { type: DataTypes.BIGINT },
    opening_balance: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    description: { type: DataTypes.STRING(500) },
    created_by: { type: DataTypes.BIGINT },
    updated_by: { type: DataTypes.BIGINT },
  },
  { tableName: 'chart_of_accounts' }
);

const Journal = sequelize.define(
  'Journal',
  {
    journal_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    journal_number: { type: DataTypes.STRING(30), allowNull: false, unique: true },
    journal_date: { type: DataTypes.DATEONLY, allowNull: false },
    memo: { type: DataTypes.STRING(500) },
    status: { type: DataTypes.ENUM('draft', 'posted', 'reversed'), defaultValue: 'draft' },
    posted_by: { type: DataTypes.BIGINT },
    posted_at: { type: DataTypes.DATE },
    created_by: { type: DataTypes.BIGINT },
    updated_by: { type: DataTypes.BIGINT },
  },
  { tableName: 'journals' }
);

const JournalEntry = sequelize.define(
  'JournalEntry',
  {
    journal_entry_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    journal_id: { type: DataTypes.BIGINT, allowNull: false },
    account_id: { type: DataTypes.BIGINT, allowNull: false },
    debit_amount: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
    credit_amount: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
    description: { type: DataTypes.STRING(500) },
  },
  { tableName: 'journal_entries' }
);

const Ledger = sequelize.define(
  'Ledger',
  {
    ledger_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    account_id: { type: DataTypes.BIGINT, allowNull: false },
    entry_date: { type: DataTypes.DATEONLY, allowNull: false },
    description: { type: DataTypes.STRING(500) },
    debit_amount: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
    credit_amount: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
    balance: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
    reference_type: { type: DataTypes.STRING(50) },
    reference_id: { type: DataTypes.BIGINT },
    created_by: { type: DataTypes.BIGINT },
  },
  { tableName: 'ledgers' }
);

const Expense = sequelize.define(
  'Expense',
  {
    expense_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    expense_date: { type: DataTypes.DATEONLY, allowNull: false },
    category: { type: DataTypes.STRING(100), allowNull: false },
    vendor_name: { type: DataTypes.STRING(150) },
    description: { type: DataTypes.STRING(300) },
    amount: { type: DataTypes.DECIMAL(18, 2), allowNull: false },
    tax_amount: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
    total_amount: { type: DataTypes.DECIMAL(18, 2), allowNull: false },
    payment_mode: { type: DataTypes.ENUM('cash', 'card', 'upi', 'bank_transfer', 'other'), defaultValue: 'cash' },
    invoice_reference: { type: DataTypes.STRING(100) },
    status: { type: DataTypes.ENUM('pending', 'approved', 'paid', 'rejected'), defaultValue: 'pending' },
    approved_by: { type: DataTypes.BIGINT },
    receipt_url: { type: DataTypes.STRING(500) },
    notes: { type: DataTypes.TEXT },
    created_by: { type: DataTypes.BIGINT },
    updated_by: { type: DataTypes.BIGINT },
  },
  { tableName: 'expenses' }
);

module.exports = { ChartOfAccount, Journal, JournalEntry, Ledger, Expense };