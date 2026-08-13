const { Op } = require('sequelize');
const {
  Visitor,
  VisitorLog,
  Vehicle,
  VehicleEntryExit,
  GatePass,
  GatePassItem,
  PettyCashTransaction,
} = require('./security.model');
const ApiError = require('../../utils/ApiError');
const { getPagination, getPagingData } = require('../../utils/pagination');
const { generateSequenceNumber } = require('../../utils/helpers');

const visitorService = {
  async list(query) {
    const { page, limit, offset } = getPagination(query);
    const where = {};
    if (query.search) {
      where[Op.or] = [{ name: { [Op.like]: `%${query.search}%` } }, { mobile: { [Op.like]: `%${query.search}%` } }, { purpose: { [Op.like]: `%${query.search}%` } }];
    }
    const { count, rows } = await Visitor.findAndCountAll({ where, distinct: true, limit, offset, order: [['created_at', 'DESC']] });
    return getPagingData({ count, rows }, page, limit);
  },

  async create(data, user) {
    return Visitor.create({ ...data, created_by: user ? user.user_id : null });
  },

  async recordEntry(visitorId, notes, user) {
    const visitor = await Visitor.findByPk(visitorId);
    if (!visitor) throw ApiError.notFound('Visitor not found');
    const active = await VisitorLog.findOne({ where: { visitor_id: visitorId, exit_at: null } });
    if (active) throw ApiError.conflict('Visitor is already inside the property');
    return VisitorLog.create({ visitor_id: visitorId, entry_at: new Date(), security_staff_id: user ? user.employee_id : null, notes, created_by: user ? user.user_id : null });
  },

  async recordExit(logId, user) {
    const log = await VisitorLog.findByPk(logId);
    if (!log) throw ApiError.notFound('Visitor log not found');
    await log.update({ exit_at: new Date(), security_staff_id: user ? user.employee_id : null });
    return log;
  },
};

const visitorLogService = {
  async list(query) {
    const { page, limit, offset } = getPagination(query);
    const where = {};
    if (query.date) where.entry_at = { [Op.gte]: `${query.date} 00:00:00`, [Op.lte]: `${query.date} 23:59:59` };
    if (query.inside === 'true') where.exit_at = null;
    const { count, rows } = await VisitorLog.findAndCountAll({
      where,
      include: [{ association: 'visitor' }, { association: 'securityStaff', attributes: ['employee_id', 'first_name', 'last_name'] }],
      distinct: true,
      limit,
      offset,
      order: [['entry_at', 'DESC']],
    });
    return getPagingData({ count, rows }, page, limit);
  },
};

const vehicleService = {
  async list(query) {
    const { page, limit, offset } = getPagination(query);
    const where = {};
    if (query.search) where.vehicle_number = { [Op.like]: `%${query.search}%` };
    if (query.status) where.status = query.status;
    const { count, rows } = await Vehicle.findAndCountAll({ where, distinct: true, limit, offset, order: [['created_at', 'DESC']] });
    return getPagingData({ count, rows }, page, limit);
  },

  async create(data, user) {
    const existing = await Vehicle.findOne({ where: { vehicle_number: data.vehicle_number } });
    const payload = existing ? existing : await Vehicle.create({ ...data, created_by: user ? user.user_id : null });
    await VehicleEntryExit.create({ vehicle_id: payload.vehicle_id, entry_at: new Date(), security_staff_id: user ? user.employee_id : null, purpose: data.purpose, parking_location: data.parking_location, created_by: user ? user.user_id : null });
    await payload.update({ status: 'inside' });
    return payload;
  },

  async recordExit(entryExitId, user) {
    const entry = await VehicleEntryExit.findByPk(entryExitId);
    if (!entry) throw ApiError.notFound('Vehicle entry record not found');
    await entry.update({ exit_at: new Date(), security_staff_id: user ? user.employee_id : null });
    await Vehicle.update({ status: 'outside' }, { where: { vehicle_id: entry.vehicle_id } });
    return entry;
  },
};

const gatePassService = {
  async list(query) {
    const { page, limit, offset } = getPagination(query);
    const where = {};
    if (query.status) where.status = query.status;
    if (query.pass_type) where.pass_type = query.pass_type;
    const { count, rows } = await GatePass.findAndCountAll({
      where,
      include: [{ association: 'items' }, { association: 'vehicle' }],
      distinct: true,
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });
    return getPagingData({ count, rows }, page, limit);
  },

  async create(data, user) {
    const count = await GatePass.count();
    const passNumber = generateSequenceNumber('GP', count);
    const gatePass = await GatePass.create({
      ...data,
      pass_number: passNumber,
      issued_by: user ? user.user_id : null,
      issued_at: data.issued_at || new Date(),
      status: data.status || 'issued',
      created_by: user ? user.user_id : null,
    });
    if (data.items && data.items.length) {
      await GatePassItem.bulkCreate(data.items.map((item) => ({ ...item, gate_pass_id: gatePass.gate_pass_id })));
    }
    return this.getById(gatePass.gate_pass_id);
  },

  async getById(id) {
    const gatePass = await GatePass.findByPk(id, { include: [{ association: 'items' }, { association: 'vehicle' }] });
    if (!gatePass) throw ApiError.notFound('Gate pass not found');
    return gatePass;
  },

  async changeStatus(id, status, user) {
    const gatePass = await this.getById(id);
    const updates = { status, updated_by: user ? user.user_id : null };
    if (status === 'returned' || status === 'closed') updates.actual_return_at = new Date();
    await gatePass.update(updates);
    return this.getById(id);
  },
};

const pettyCashService = {
  async list(query) {
    const { page, limit, offset } = getPagination(query);
    const where = {};
    if (query.status) where.status = query.status;
    if (query.from_date && query.to_date) where.transaction_date = { [Op.between]: [query.from_date, query.to_date] };
    if (query.date) where.transaction_date = query.date;
    const { count, rows } = await PettyCashTransaction.findAndCountAll({ where, distinct: true, limit, offset, order: [['transaction_date', 'DESC']] });
    return getPagingData({ count, rows }, page, limit);
  },

  async create(data, user) {
    return PettyCashTransaction.create({ ...data, created_by: user ? user.user_id : null });
  },

  async changeStatus(id, status, user) {
    const tx = await PettyCashTransaction.findByPk(id);
    if (!tx) throw ApiError.notFound('Petty cash transaction not found');
    await tx.update({ status, approved_by: user ? user.user_id : null });
    return tx;
  },
};

module.exports = { visitorService, visitorLogService, vehicleService, gatePassService, pettyCashService };