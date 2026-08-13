const { Op } = require('sequelize');
const { Guest } = require('./guest.model');
const { Booking } = require('../booking/booking.model');
const ApiError = require('../../utils/ApiError');
const { getPagination, getPagingData } = require('../../utils/pagination');

const guestService = {
  async list(query) {
    const { page, limit, offset } = getPagination(query);
    const where = {};
    if (query.search) {
      where[Op.or] = [
        { first_name: { [Op.like]: `%${query.search}%` } },
        { last_name: { [Op.like]: `%${query.search}%` } },
        { mobile: { [Op.like]: `%${query.search}%` } },
        { email: { [Op.like]: `%${query.search}%` } },
        { id_number: { [Op.like]: `%${query.search}%` } },
      ];
    }
    if (query.is_active !== undefined) where.is_active = query.is_active === 'true';

    const { count, rows } = await Guest.findAndCountAll({
      where,
      limit,
      offset,
      distinct: true,
      order: [['created_at', 'DESC']],
    });
    return getPagingData({ count, rows }, page, limit);
  },

  async getById(id) {
    const guest = await Guest.findByPk(id, { include: ['company'] });
    if (!guest) throw ApiError.notFound('Guest not found');
    return guest;
  },

  async getHistory(id) {
    await this.getById(id);
    const bookings = await Booking.findAll({
      where: { guest_id: id },
      include: [{ association: 'bookingRooms', include: ['room', 'roomType'] }],
      order: [['created_at', 'DESC']],
    });
    return bookings;
  },

  async create(data) {
    const existing = await Guest.findOne({ where: { mobile: data.mobile } });
    if (existing) throw ApiError.conflict('A guest with this mobile number already exists');
    return Guest.create(data);
  },

  async update(id, data, user) {
    await this.getById(id);
    const guest = await Guest.findByPk(id);
    await guest.update({ ...data, updated_by: user ? user.user_id : null });
    return this.getById(id);
  },

  async remove(id) {
    await this.getById(id);
    const guest = await Guest.findByPk(id);
    await guest.destroy();
    return guest;
  },
};

module.exports = guestService;