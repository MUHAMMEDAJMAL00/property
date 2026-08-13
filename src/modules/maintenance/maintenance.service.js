const { Op } = require('sequelize');
const {
  MaintenanceRequest,
  MaintenanceCategory,
  MaintenanceArea,
  MaintenanceStatusHistory,
  MAINTENANCE_STATUS,
} = require('./maintenance.model');
const { Room, ROOM_STATUS } = require('../room/room.model');
const ApiError = require('../../utils/ApiError');
const { getPagination, getPagingData } = require('../../utils/pagination');
const { generateSequenceNumber } = require('../../utils/helpers');

const INCLUDES = [
  { association: 'category' },
  { association: 'area' },
  { association: 'room' },
  { association: 'assignedStaff' },
  { association: 'statusHistory', include: ['changedByUser'] },
];

const maintenanceService = {
  async list(query) {
    const { page, limit, offset } = getPagination(query);
    const where = {};
    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;
    if (query.category_id) where.category_id = query.category_id;
    if (query.assigned_staff_id) where.assigned_staff_id = query.assigned_staff_id;
    if (query.search) where.title = { [Op.like]: `%${query.search}%` };

    const { count, rows } = await MaintenanceRequest.findAndCountAll({
      where,
      include: INCLUDES,
      distinct: true,
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });
    return getPagingData({ count, rows }, page, limit);
  },

  async getById(id) {
    const request = await MaintenanceRequest.findByPk(id, { include: INCLUDES });
    if (!request) throw ApiError.notFound('Maintenance request not found');
    return request;
  },

  async create(data, user) {
    const count = await MaintenanceRequest.count();
    const requestNumber = generateSequenceNumber('MR', count);

    const request = await MaintenanceRequest.create({
      ...data,
      request_number: requestNumber,
      reported_by: user ? user.user_id : null,
      created_by: user ? user.user_id : null,
    });

    if (data.location_type === 'room' && data.room_id) {
      await Room.update({ status: ROOM_STATUS.MAINTENANCE }, { where: { room_id: data.room_id } });
    }
    await MaintenanceStatusHistory.create({
      request_id: request.request_id,
      to_status: MAINTENANCE_STATUS.OPEN,
      changed_by: user ? user.user_id : null,
    });
    return this.getById(request.request_id);
  },

  async changeStatus(id, status, notes, user) {
    const request = await this.getById(id);
    const previous = request.status;
    await request.update({ status, updated_by: user ? user.user_id : null });
    await MaintenanceStatusHistory.create({
      request_id: request.request_id,
      from_status: previous,
      to_status: status,
      changed_by: user ? user.user_id : null,
      notes,
    });

    if (status === MAINTENANCE_STATUS.RESOLVED) {
      await request.update({ completed_at: new Date(), resolved_at: new Date(), approved_by: user ? user.user_id : null, resolution_notes: notes || null });
    }
    if (status === MAINTENANCE_STATUS.IN_PROGRESS) {
      await request.update({ started_at: new Date() });
    }
    if (request.location_type === 'room' && request.room_id) {
      const roomStatus = status === MAINTENANCE_STATUS.RESOLVED || status === MAINTENANCE_STATUS.CLOSED ? ROOM_STATUS.HOUSEKEEPING_PENDING : ROOM_STATUS.MAINTENANCE;
      await Room.update({ status: roomStatus }, { where: { room_id: request.room_id } });
    }
    return this.getById(id);
  },

  async assign(id, staffId, user) {
    const request = await this.getById(id);
    await request.update({ assigned_staff_id: staffId, status: MAINTENANCE_STATUS.ASSIGNED, updated_by: user ? user.user_id : null });
    return this.changeStatus(id, MAINTENANCE_STATUS.ASSIGNED, `Assigned to staff ${staffId}`, user);
  },

  async getStatusHistory(id) {
    await this.getById(id);
    return MaintenanceStatusHistory.findAll({
      where: { request_id: id },
      include: [{ association: 'changedByUser', attributes: ['user_id', 'first_name', 'last_name'] }],
      order: [['created_at', 'ASC']],
    });
  },
};

const categoryService = {
  async list(query) {
    const { page, limit, offset } = getPagination(query);
    const { count, rows } = await MaintenanceCategory.findAndCountAll({ where: {}, limit, offset, order: [['name', 'ASC']] });
    return getPagingData({ count, rows }, page, limit);
  },
  async create(data) {
    return MaintenanceCategory.create(data);
  },
};

const areaService = {
  async list(query) {
    const { page, limit, offset } = getPagination(query);
    const { count, rows } = await MaintenanceArea.findAndCountAll({ where: {}, limit, offset, order: [['name', 'ASC']] });
    return getPagingData({ count, rows }, page, limit);
  },
  async create(data) {
    return MaintenanceArea.create(data);
  },
};

module.exports = { maintenanceService, categoryService, areaService };