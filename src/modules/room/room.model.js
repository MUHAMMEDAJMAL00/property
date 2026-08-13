const { DataTypes } = require('sequelize');
const sequelize = require('../../database/sequelize');

const ROOM_STATUS = {
  AVAILABLE: 'available',
  RESERVED: 'reserved',
  OCCUPIED: 'occupied',
  HOUSEKEEPING_PENDING: 'housekeeping_pending',
  HOUSEKEEPING_IN_PROGRESS: 'housekeeping_in_progress',
  MAINTENANCE: 'maintenance',
  OUT_OF_ORDER: 'out_of_order',
};

const Room = sequelize.define(
  'Room',
  {
    room_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    room_number: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    room_type_id: { type: DataTypes.BIGINT, allowNull: false },
    floor_id: { type: DataTypes.BIGINT, allowNull: false },
    property_id: { type: DataTypes.BIGINT, allowNull: false },
    status: {
      type: DataTypes.ENUM(...Object.values(ROOM_STATUS)),
      defaultValue: ROOM_STATUS.AVAILABLE,
    },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    notes: { type: DataTypes.TEXT },
    created_by: { type: DataTypes.BIGINT },
    updated_by: { type: DataTypes.BIGINT },
  },
  { tableName: 'rooms', paranoid: true }
);

const RoomStatusHistory = sequelize.define(
  'RoomStatusHistory',
  {
    history_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    room_id: { type: DataTypes.BIGINT, allowNull: false },
    from_status: { type: DataTypes.STRING(50) },
    to_status: { type: DataTypes.STRING(50), allowNull: false },
    changed_by: { type: DataTypes.BIGINT },
    reason: { type: DataTypes.STRING(500) },
  },
  { tableName: 'room_status_history' }
);

module.exports = { Room, RoomStatusHistory, ROOM_STATUS };