const { Op } = require('sequelize');
const { Booking, GuestStay, BOOKING_STATUS } = require('../booking/booking.model');
const { Room, ROOM_STATUS } = require('../room/room.model');
const { HousekeepingTask, TASK_STATUS } = require('../housekeeping/housekeeping.model');
const { MaintenanceRequest, MAINTENANCE_STATUS } = require('../maintenance/maintenance.model');
const { VisitorLog, Vehicle, GatePass, PettyCashTransaction } = require('../security/security.model');
const { Invoice, Payment } = require('../billing/billing.model');

const startOfDay = (date) => new Date(date).setHours(0, 0, 0, 0);
const endOfDay = (date) => new Date(date).setHours(23, 59, 59, 999);

const dashboardService = {
  async deskStats() {
    const now = new Date();
    const from = new Date(startOfDay(now));
    const to = new Date(endOfDay(now));

    const [checkInsToday, checkOutsToday, inHouse, rooms, dirtyRooms, maintenanceRooms] = await Promise.all([
      Booking.count({ where: { status: BOOKING_STATUS.CHECKED_IN, checked_in_at: { [Op.between]: [from, to] } } }),
      Booking.count({ where: { status: BOOKING_STATUS.CHECKED_OUT, checked_out_at: { [Op.between]: [from, to] } } }),
      GuestStay.count({ where: { status: 'in_house' }, distinct: true, col: 'booking_id' }),
      Room.findAll({ attributes: ['status'] }),
      Room.count({ where: { status: { [Op.in]: [ROOM_STATUS.HOUSEKEEPING_PENDING, ROOM_STATUS.HOUSEKEEPING_IN_PROGRESS] } } }),
      Room.count({ where: { status: { [Op.in]: [ROOM_STATUS.MAINTENANCE, ROOM_STATUS.OUT_OF_ORDER] } } }),
    ]);

    const totalRooms = rooms.length;
    const occupied = rooms.filter((r) => r.status === ROOM_STATUS.OCCUPIED).length;
    const available = rooms.filter((r) => r.status === ROOM_STATUS.AVAILABLE).length;

    const statusSummary = {};
    rooms.forEach((r) => {
      statusSummary[r.status] = (statusSummary[r.status] || 0) + 1;
    });

    return {
      check_ins_today: checkInsToday,
      check_outs_today: checkOutsToday,
      in_house_guests: inHouse,
      total_rooms: totalRooms,
      available_rooms: available,
      occupied_rooms: occupied,
      dirty_rooms: dirtyRooms,
      maintenance_rooms: maintenanceRooms,
      occupancy_percent: totalRooms ? Math.round((occupied / totalRooms) * 100) : 0,
      room_status_summary: statusSummary,
    };
  },

  async roomBoard() {
    const rooms = await Room.findAll({
      include: ['floor', 'roomType'],
      order: [['room_number', 'ASC']],
    });
    const board = {};
    rooms.forEach((room) => {
      const floorName = room.floor ? room.floor.name : 'Unknown';
      if (!board[floorName]) board[floorName] = [];
      board[floorName].push(room);
    });
    return board;
  },

  async housekeepingSummary() {
    const [pendingRooms, activeTasks, awaitingVerify, laundryPending] = await Promise.all([
      Room.count({ where: { status: { [Op.in]: [ROOM_STATUS.HOUSEKEEPING_PENDING, ROOM_STATUS.HOUSEKEEPING_IN_PROGRESS] } } }),
      HousekeepingTask.count({ where: { status: { [Op.in]: [TASK_STATUS.PENDING, TASK_STATUS.ASSIGNED, TASK_STATUS.IN_PROGRESS] } } }),
      HousekeepingTask.count({ where: { status: TASK_STATUS.DONE } }),
      require('../housekeeping/housekeeping.model').Laundry.count({ where: { status: { [Op.in]: ['pending', 'collected', 'processing'] } } }),
    ]);
    return { rooms_pending: pendingRooms, active_tasks: activeTasks, awaiting_verify: awaitingVerify, laundry_pending: laundryPending };
  },

  async maintenanceSummary() {
    const [openReqs, inProgress, pendingApproval, resolved] = await Promise.all([
      MaintenanceRequest.count({ where: { status: { [Op.in]: [MAINTENANCE_STATUS.OPEN, MAINTENANCE_STATUS.ASSIGNED] } } }),
      MaintenanceRequest.count({ where: { status: MAINTENANCE_STATUS.IN_PROGRESS } }),
      MaintenanceRequest.count({ where: { status: MAINTENANCE_STATUS.PENDING_APPROVAL } }),
      MaintenanceRequest.count({ where: { status: { [Op.in]: [MAINTENANCE_STATUS.RESOLVED, MAINTENANCE_STATUS.CLOSED] } } }),
    ]);
    return { open: openReqs, in_progress: inProgress, pending_approval: pendingApproval, resolved };
  },

  async securitySummary() {
    const today = new Date();
    const from = new Date(startOfDay(today));
    const to = new Date(endOfDay(today));
    const [visitorsToday, insideVisitors, vehiclesInside, gatePassesPending, pettyCashToday] = await Promise.all([
      VisitorLog.count({ where: { entry_at: { [Op.between]: [from, to] } } }),
      VisitorLog.count({ where: { exit_at: null } }),
      Vehicle.count({ where: { status: 'inside' } }),
      GatePass.count({ where: { status: { [Op.in]: ['pending', 'issued'] } } }),
      PettyCashTransaction.sum('amount', { where: { transaction_date: { [Op.between]: [today.toISOString().slice(0, 10), today.toISOString().slice(0, 10)] } } }),
    ]);
    return { visitors_today: visitorsToday, inside_now: insideVisitors, vehicles_inside: vehiclesInside, gate_passes_pending: gatePassesPending, petty_cash_today: pettyCashToday || 0 };
  },

  async billingSummary() {
    const from = new Date(startOfDay(new Date()));
    const to = new Date(endOfDay(new Date()));
    const [salesToday, paymentsToday, outstanding] = await Promise.all([
      Invoice.sum('total_amount', { where: { created_at: { [Op.between]: [from, to] } } }),
      Payment.sum('amount', { where: { paid_at: { [Op.between]: [from, to] } } }),
      Invoice.sum('total_amount', { where: { [Op.not]: { status: 'paid' } } }),
    ]);
    return { sales_today: salesToday || 0, payments_today: paymentsToday || 0, outstanding_amount: outstanding || 0 };
  },
};

module.exports = dashboardService;