const { DataTypes } = require('sequelize');
const sequelize = require('../../database/sequelize');

const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CHECKED_IN: 'checked_in',
  CHECKED_OUT: 'checked_out',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
};

const PAYMENT_STATUS = {
  UNPAID: 'unpaid',
  PARTIAL: 'partial',
  PAID: 'paid',
  REFUNDED: 'refunded',
};

const Booking = sequelize.define(
  'Booking',
  {
    booking_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    booking_number: { type: DataTypes.STRING(30), allowNull: false, unique: true },
    guest_id: { type: DataTypes.BIGINT, allowNull: false },
    company_id: { type: DataTypes.BIGINT },
    property_id: { type: DataTypes.BIGINT },
    check_in_date: { type: DataTypes.DATEONLY, allowNull: false },
    check_out_date: { type: DataTypes.DATEONLY, allowNull: false },
    adults: { type: DataTypes.INTEGER, defaultValue: 1 },
    children: { type: DataTypes.INTEGER, defaultValue: 0 },
    rate: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
    tax_amount: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
    discount_amount: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
    total_amount: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
    tax_category: { type: DataTypes.STRING(50), defaultValue: 'standard' },
    payment_status: { type: DataTypes.ENUM(...Object.values(PAYMENT_STATUS)), defaultValue: 'unpaid' },
    booking_source: {
      type: DataTypes.ENUM('walk_in', 'phone', 'website', 'agency', 'corporate', 'other'),
      defaultValue: 'walk_in',
    },
    special_requests: { type: DataTypes.TEXT },
    status: { type: DataTypes.ENUM(...Object.values(BOOKING_STATUS)), defaultValue: 'pending' },
    checked_in_at: { type: DataTypes.DATE },
    checked_out_at: { type: DataTypes.DATE },
    created_by: { type: DataTypes.BIGINT },
    updated_by: { type: DataTypes.BIGINT },
  },
  { tableName: 'bookings' }
);

const BookingRoom = sequelize.define(
  'BookingRoom',
  {
    booking_room_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    booking_id: { type: DataTypes.BIGINT, allowNull: false },
    room_id: { type: DataTypes.BIGINT, allowNull: false },
    room_type_id: { type: DataTypes.BIGINT },
    room_rate: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
    check_in_date: { type: DataTypes.DATEONLY },
    check_out_date: { type: DataTypes.DATEONLY },
    status: { type: DataTypes.ENUM('reserved', 'checked_in', 'checked_out', 'cancelled', 'no_show'), defaultValue: 'reserved' },
  },
  { tableName: 'booking_rooms' }
);

const BookingGuest = sequelize.define(
  'BookingGuest',
  {
    booking_guest_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    booking_id: { type: DataTypes.BIGINT, allowNull: false },
    guest_id: { type: DataTypes.BIGINT, allowNull: false },
    is_primary: { type: DataTypes.BOOLEAN, defaultValue: false },
    guest_type: { type: DataTypes.ENUM('adult', 'child'), defaultValue: 'adult' },
  },
  { tableName: 'booking_guests' }
);

const GuestStay = sequelize.define(
  'GuestStay',
  {
    stay_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    booking_id: { type: DataTypes.BIGINT, allowNull: false },
    guest_id: { type: DataTypes.BIGINT, allowNull: false },
    room_id: { type: DataTypes.BIGINT, allowNull: false },
    check_in_at: { type: DataTypes.DATE, allowNull: false },
    check_out_at: { type: DataTypes.DATE },
    status: { type: DataTypes.ENUM('in_house', 'checked_out'), defaultValue: 'in_house' },
  },
  { tableName: 'guest_stays' }
);

const BookingStatusHistory = sequelize.define(
  'BookingStatusHistory',
  {
    history_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    booking_id: { type: DataTypes.BIGINT, allowNull: false },
    from_status: { type: DataTypes.STRING(50) },
    to_status: { type: DataTypes.STRING(50), allowNull: false },
    changed_by: { type: DataTypes.BIGINT },
    reason: { type: DataTypes.STRING(500) },
  },
  { tableName: 'booking_status_history' }
);

module.exports = {
  Booking,
  BookingRoom,
  BookingGuest,
  GuestStay,
  BookingStatusHistory,
  BOOKING_STATUS,
  PAYMENT_STATUS,
};