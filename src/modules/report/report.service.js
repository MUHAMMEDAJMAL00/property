const { Op } = require('sequelize');
const { Invoice, Payment } = require('../billing/billing.model');
const { Expense } = require('../accounting/accounting.model');
const { Booking, GuestStay, BOOKING_STATUS } = require('../booking/booking.model');
const { Room } = require('../room/room.model');
const ApiError = require('../../utils/ApiError');

const reportService = {
  async salesSummary({ from, to }) {
    if (!from || !to) throw ApiError.badRequest('from and to dates are required');
    const where = { created_at: { [Op.between]: [new Date(`${from} 00:00:00`), new Date(`${to} 23:59:59`)] } };

    const [invoiceAgg, paymentModes, expenses, roomRevenue] = await Promise.all([
      Invoice.findAll({
        where: { ...where, [Op.not]: { status: 'void' } },
        attributes: [
          [require('sequelize').fn('SUM', require('sequelize').col('total_amount')), 'total'],
          [require('sequelize').fn('SUM', require('sequelize').col('tax_amount')), 'tax'],
        ],
        raw: true,
      }),
      Payment.findAll({
        where,
        attributes: ['payment_mode', [require('sequelize').fn('SUM', require('sequelize').col('amount')), 'amount']],
        group: ['payment_mode'],
        raw: true,
      }),
      Expense.findAll({
        where,
        attributes: ['category', [require('sequelize').fn('SUM', require('sequelize').col('total_amount')), 'amount']],
        group: ['category'],
        raw: true,
      }),
      Invoice.sum('total_amount', { where: { ...where, [Op.not]: { status: 'void' } } }),
    ]);

    const totalRevenue = Number(invoiceAgg[0]?.total) || 0;
    return {
      period: { from, to },
      total_revenue: totalRevenue,
      gst_collected: Number(invoiceAgg[0]?.tax) || 0,
      room_revenue: roomRevenue || 0,
      other_revenue: 0,
      payments_by_mode: paymentModes.map((p) => ({ mode: p.payment_mode, amount: Number(p.amount) })),
      expenses: expenses.map((e) => ({ category: e.category, amount: Number(e.amount) })),
      total_expenses: expenses.reduce((sum, e) => sum + Number(e.amount), 0),
      net_profit: totalRevenue - expenses.reduce((sum, e) => sum + Number(e.amount), 0),
    };
  },

  async occupancyReport({ from, to }) {
    if (!from || !to) throw ApiError.badRequest('from and to dates are required');
    const days = [];
    const cursor = new Date(`${from}T00:00:00`);
    const end = new Date(`${to}T00:00:00`);
    const totalRooms = await Room.count();
    const stays = await GuestStay.findAll({
      where: {
        [Op.and]: [
          { check_in_at: { [Op.lt]: new Date(`${to}T23:59:59`) } },
          { [Op.or]: [{ check_out_at: null }, { check_out_at: { [Op.gt]: new Date(`${from}T00:00:00`) } }] },
        ],
      },
    });

    while (cursor <= end) {
      const dayEnd = new Date(cursor);
      dayEnd.setHours(23, 59, 59, 999);
      const occupied = stays.filter((s) => new Date(s.check_in_at) <= dayEnd && (!s.check_out_at || new Date(s.check_out_at) >= cursor)).length;
      days.push({
        date: cursor.toISOString().slice(0, 10),
        occupied,
        available: Math.max(0, totalRooms - occupied),
        occupancy_percent: totalRooms ? Math.round((occupied / totalRooms) * 100) : 0,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    return { period: { from, to }, total_rooms: totalRooms, days };
  },

  async bookingsByStatus({ from, to }) {
    const where = {};
    if (from && to) {
      where[Op.and] = [{ check_in_date: { [Op.lte]: to } }, { check_out_date: { [Op.gte]: from } }];
    }
    const rows = await Booking.findAll({
      where,
      attributes: ['status', [require('sequelize').fn('COUNT', require('sequelize').col('booking_id')), 'count']],
      group: ['status'],
      raw: true,
    });
    return rows.map((r) => ({ status: r.status, count: Number(r.count) }));
  },
};

module.exports = reportService;