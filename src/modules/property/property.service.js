const { Op } = require('sequelize');
const { Property } = require('./property.model');
const { Room } = require('../room/room.model');
const ApiError = require('../../utils/ApiError');
const { getPagination, getPagingData } = require('../../utils/pagination');

const propertyService = {
  async list(query) {
    const { page, limit, offset } = getPagination(query);
    const where = {};
    if (query.search) {
      where[Op.or] = [{ name: { [Op.like]: `%${query.search}%` } }, { legal_name: { [Op.like]: `%${query.search}%` } }];
    }
    if (query.status) where.status = query.status;

    const { count, rows } = await Property.findAndCountAll({ where, limit, offset, distinct: true });
    return getPagingData({ count, rows }, page, limit);
  },

  async getById(id) {
    const property = await Property.findByPk(id);
    if (!property) throw ApiError.notFound('Property not found');
    return property;
  },

  async create(data) {
    const existing = await Property.findOne({ where: { name: data.name } });
    if (existing) throw ApiError.conflict(`Property named "${data.name}" already exists`);
    return Property.create(data);
  },

  async update(id, data, user) {
    const property = await this.getById(id);
    await property.update({ ...data, updated_by: user ? user.user_id : null });
    return this.getById(id);
  },

  async toggleStatus(id, status) {
    const property = await this.getById(id);
    property.status = status;
    await property.save();
    return property;
  },

  async getStats() {
    const [totalRooms, activeRooms, maintenanceRooms] = await Promise.all([
      Room.count(),
      Room.count({ where: { status: 'available', is_active: true } }),
      Room.count({ where: { status: { [Op.in]: ['maintenance', 'out_of_order'] } } }),
    ]);
    return {
      total_rooms: totalRooms,
      available_rooms: activeRooms,
      maintenance_rooms: maintenanceRooms,
      currency: (await Property.findOne({ where: { is_default: true } }))?.currency || 'INR',
    };
  },
};

module.exports = propertyService;