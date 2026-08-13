const { Op } = require('sequelize');
const { Room, RoomStatusHistory } = require('./room.model');
const { BookingRoom } = require('../booking/booking.model');
const ApiError = require('../../utils/ApiError');
const { getPagination, getPagingData } = require('../../utils/pagination');

const INCLUDES = [
  { association: 'floor' },
  { association: 'roomType' },
  { association: 'property' },
];

const roomService = {
  async list(query) {
    const { page, limit, offset } = getPagination(query);
    const where = {};
    if (query.search) where.room_number = { [Op.like]: `%${query.search}%` };
    if (query.status) where.status = query.status;
    if (query.floor_id) where.floor_id = query.floor_id;
    if (query.room_type_id) where.room_type_id = query.room_type_id;
    if (query.is_active !== undefined) where.is_active = query.is_active === 'true';

    const { count, rows } = await Room.findAndCountAll({
      where,
      include: INCLUDES,
      distinct: true,
      limit,
      offset,
      order: [['room_number', 'ASC']],
    });
    return getPagingData({ count, rows }, page, limit);
  },

  async getById(id) {
    const room = await Room.findByPk(id, { include: INCLUDES });
    if (!room) throw ApiError.notFound('Room not found');
    return room;
  },

  async create(data) {
    const existing = await Room.findOne({ where: { room_number: data.room_number } });
    if (existing) throw ApiError.conflict(`Room number ${data.room_number} already exists`);
    return Room.create(data);
  },

  async update(id, data, user) {
    await this.getById(id);
    const room = await Room.findByPk(id);
    await room.update({ ...data, updated_by: user ? user.user_id : null });
    return this.getById(id);
  },

  async changeStatus(id, status, reason, user) {
    const room = await this.getById(id);
    const previous = room.status;
    await room.update({ status, updated_by: user ? user.user_id : null });
    await RoomStatusHistory.create({
      room_id: room.room_id,
      from_status: previous,
      to_status: status,
      changed_by: user ? user.user_id : null,
      reason,
    });
    return this.getById(id);
  },

  async getStatusHistory(id) {
    await this.getById(id);
    return RoomStatusHistory.findAll({
      where: { room_id: id },
      include: [{ association: 'changedByUser', attributes: ['user_id', 'first_name', 'last_name'] }],
      order: [['created_at', 'DESC']],
      limit: 50,
    });
  },

  async getAvailable(fromDate, toDate) {
    const where = {
      status: { [Op.notIn]: ['occupied', 'maintenance', 'out_of_order'] },
      is_active: true,
    };

    if (fromDate && toDate) {
      const bookedRooms = await BookingRoom.findAll({
        where: { [Op.and]: [{ check_out_date: { [Op.gt]: fromDate } }, { check_in_date: { [Op.lt]: toDate } }] },
        attributes: ['room_id'],
        raw: true,
      });
      const bookedIds = bookedRooms.map((b) => b.room_id);
      if (bookedIds.length) where.room_id = { [Op.notIn]: bookedIds };
    }

    return Room.findAll({ where, include: INCLUDES, order: [['room_number', 'ASC']] });
  },
};

module.exports = roomService;