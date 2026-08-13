const { DataTypes } = require('sequelize');
const sequelize = require('../../database/sequelize');

const INVOICE_STATUS = {
  DRAFT: 'draft',
  ISSUED: 'issued',
  PARTIALLY_PAID: 'partially_paid',
  PAID: 'paid',
  VOID: 'void',
};

const Invoice = sequelize.define(
  'Invoice',
  {
    invoice_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    invoice_number: { type: DataTypes.STRING(30), allowNull: false, unique: true },
    booking_id: { type: DataTypes.BIGINT, allowNull: false },
    guest_id: { type: DataTypes.BIGINT, allowNull: false },
    invoice_date: { type: DataTypes.DATEONLY, allowNull: false },
    due_date: { type: DataTypes.DATEONLY },
    subtotal: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
    tax_amount: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
    discount_amount: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
    total_amount: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
    paid_amount: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
    status: { type: DataTypes.ENUM(...Object.values(INVOICE_STATUS)), defaultValue: 'draft' },
    notes: { type: DataTypes.TEXT },
    created_by: { type: DataTypes.BIGINT },
    updated_by: { type: DataTypes.BIGINT },
  },
  { tableName: 'invoices' }
);

const InvoiceItem = sequelize.define(
  'InvoiceItem',
  {
    invoice_item_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    invoice_id: { type: DataTypes.BIGINT, allowNull: false },
    description: { type: DataTypes.STRING(255), allowNull: false },
    item_type: {
      type: DataTypes.ENUM('room_charge', 'extra_bed', 'extra_person', 'damage_charge', 'late_checkout', 'other'),
      defaultValue: 'room_charge',
    },
    quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
    unit_price: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
    amount: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
    tax_amount: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
  },
  { tableName: 'invoice_items' }
);

const Payment = sequelize.define(
  'Payment',
  {
    payment_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    invoice_id: { type: DataTypes.BIGINT, allowNull: false },
    amount: { type: DataTypes.DECIMAL(18, 2), allowNull: false },
    payment_mode: { type: DataTypes.ENUM('cash', 'card', 'upi', 'bank_transfer', 'other'), defaultValue: 'cash' },
    reference_number: { type: DataTypes.STRING(100) },
    paid_at: { type: DataTypes.DATE, allowNull: false },
    received_by: { type: DataTypes.BIGINT },
    status: { type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'), defaultValue: 'completed' },
    notes: { type: DataTypes.TEXT },
    created_by: { type: DataTypes.BIGINT },
    updated_by: { type: DataTypes.BIGINT },
  },
  { tableName: 'payments' }
);

const AdditionalCharge = sequelize.define(
  'AdditionalCharge',
  {
    charge_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    booking_id: { type: DataTypes.BIGINT, allowNull: false },
    description: { type: DataTypes.STRING(255), allowNull: false },
    charge_type: {
      type: DataTypes.ENUM('extra_bed', 'extra_person', 'damage_charge', 'late_checkout', 'room_service', 'other'),
      defaultValue: 'other',
    },
    amount: { type: DataTypes.DECIMAL(18, 2), allowNull: false },
    tax_amount: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
    charge_date: { type: DataTypes.DATEONLY, allowNull: false },
    status: { type: DataTypes.ENUM('pending', 'approved', 'charged', 'waived'), defaultValue: 'pending' },
    created_by: { type: DataTypes.BIGINT },
    updated_by: { type: DataTypes.BIGINT },
  },
  { tableName: 'additional_charges' }
);

module.exports = { Invoice, InvoiceItem, Payment, AdditionalCharge, INVOICE_STATUS };