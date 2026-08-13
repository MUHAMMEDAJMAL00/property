const { Op } = require('sequelize');
const {
  Booking,
  BookingRoom,
  BookingGuest,
  GuestStay,
  BookingStatusHistory,
  BOOKING_STATUS,
} = require('./booking.model');
const { Room, ROOM_STATUS } = require('../room/room.model');
const ApiError = require('../../utils/ApiError');
const { getPagination, getPagingData } = require('../../utils/pagination');
const { generateSequenceNumber, toDecimal } = require('../../utils/helpers');

const DETAIL_INCLUDES = [
  { association: 'guest' },
  { association: 'company' },
  { association: 'bookingRooms', include: ['room', 'roomType'] },
  { association: 'bookingGuests', include: ['guest'] },
  { association: 'stays', include: ['room'] },
  { association: 'statusHistory', include: ['changedByUser'] },
];

const computeNights = (checkIn, checkOut) => {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.max(1, Math.round((new Date(checkOut) - new Date(checkIn)) / msPerDay));
};

const bookingService = {
  async list(query) {
    const { page, limit, offset } = getPagination(query);
    const where = {};
    if (query.status) where.status = query.status;
    if (query.payment_status) where.payment_status = query.payment_status;
    if (query.source) where.booking_source = query.source;
    if (query.from_date && query.to_date) {
      where[Op.and] = [{ check_in_date: { [Op.lte]: query.to_date } }, { check_out_date: { [Op.gte]: query.from_date } }];
    } else if (query.from_date) {
      where.check_in_date = { [Op.gte]: query.from_date };
    }

    const include = [{ association: 'guest' }];
    if (query.search) {
      const like = `%${query.search}%`;
      where[Op.and] = [
        ...(where[Op.and] || []),
        {
          [Op.or]: [
            { booking_number: { [Op.like]: like } },
            { '$guest.first_name$': { [Op.like]: like } },
            { '$guest.last_name$': { [Op.like]: like } },
            { '$guest.mobile$': { [Op.like]: like } },
          ],
        },
      ];
    }

    const { count, rows } = await Booking.findAndCountAll({
      where,
      include,
      distinct: true,
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });
    return getPagingData({ count, rows }, page, limit);
  },

  async getById(id) {
    const booking = await Booking.findByPk(id, { include: DETAIL_INCLUDES });
    if (!booking) throw ApiError.notFound('Booking not found');
    return booking;
  },

  async getByNumber(number) {
    const booking = await Booking.findOne({ where: { booking_number: number }, include: DETAIL_INCLUDES });
    if (!booking) throw ApiError.notFound('Booking not found');
    return booking;
  },

  async create(data, user) {
    if (!data.check_in_date || !data.check_out_date) {
      throw ApiError.badRequest('check_in_date and check_out_date are required');
    }
    if (new Date(data.check_out_date) <= new Date(data.check_in_date)) {
      throw ApiError.badRequest('check_out_date must be after check_in_date');
    }

    const nights = computeNights(data.check_in_date, data.check_out_date);
    const roomIds = (data.room_ids || []).map(Number).filter(Boolean);
    if (roomIds.length === 0) throw ApiError.badRequest('At least one room is required');

    const rooms = await Room.findAll({
      where: { room_id: { [Op.in]: roomIds } },
      include: [{ association: 'roomType', attributes: ['room_type_id', 'base_rate'] }],
    });
    if (rooms.length !== roomIds.length) throw ApiError.badRequest('One or more rooms do not exist');

    const count = await Booking.count();
    const bookingNumber = generateSequenceNumber('BK', count);

    const result = await Booking.sequelize.transaction(async (t) => {
      let subtotal = 0;
      const bookingsRooms = rooms.map((room) => {
        const roomRate = Number(data.rate || (room.roomType && room.roomType.base_rate)) || 0;
        const roomAmount = toDecimal(roomRate * nights);
        subtotal += roomAmount;
        return {
          room_id: room.room_id,
          room_type_id: room.room_type_id,
          room_rate: roomRate,
          check_in_date: data.check_in_date,
          check_out_date: data.check_out_date,
        };
      });

      const taxAmount = toDecimal(subtotal * (Number(data.tax_percent || 0) / 100));
      const discountAmount = toDecimal(Number(data.discount_amount || 0));
      const totalAmount = toDecimal(subtotal + taxAmount - discountAmount);

      const booking = await Booking.create(
        {
          booking_number: bookingNumber,
          guest_id: data.guest_id,
          company_id: data.company_id || null,
          property_id: data.property_id || null,
          check_in_date: data.check_in_date,
          check_out_date: data.check_out_date,
          adults: data.adults || 1,
          children: data.children || 0,
          rate: subtotal,
          tax_amount: taxAmount,
          discount_amount: discountAmount,
          total_amount: totalAmount,
          tax_category: data.tax_category || 'standard',
          booking_source: data.booking_source || 'walk_in',
          special_requests: data.special_requests || null,
          status: BOOKING_STATUS.PENDING,
          created_by: user ? user.user_id : null,
        },
        { transaction: t }
      );

      await BookingRoom.bulkCreate(
        bookingsRooms.map((br) => ({ ...br, booking_id: booking.booking_id })),
        { transaction: t }
      );

      if (data.guest_ids && data.guest_ids.length) {
        await BookingGuest.bulkCreate(
          data.guest_ids.map((guestId, index) => ({
            booking_id: booking.booking_id,
            guest_id: guestId,
            is_primary: index === 0,
            guest_type: data.guest_types && data.guest_types[index] ? data.guest_types[index] : 'adult',
          })),
          { transaction: t }
        );
      } else {
        await BookingGuest.create(
          { booking_id: booking.booking_id, guest_id: data.guest_id, is_primary: true, guest_type: 'adult' },
          { transaction: t }
        );
      }

      await BookingStatusHistory.create(
        { booking_id: booking.booking_id, to_status: BOOKING_STATUS.PENDING, changed_by: user ? user.user_id : null },
        { transaction: t }
      );

      return booking;
    });

    return this.getById(result.booking_id);
  },

  async changeStatus(id, status, reason, user) {
    const validStatuses = Object.values(BOOKING_STATUS);
    if (!validStatuses.includes(status)) throw ApiError.badRequest('Invalid booking status');

    const booking = await this.getById(id);
    const previous = booking.status;

    const updates = { status, updated_by: user ? user.user_id : null };
    if (status === BOOKING_STATUS.CANCELLED) {
      const cancelledRoomIds = (booking.bookingRooms || []).map((br) => br.room_id);
      await Room.update({ status: ROOM_STATUS.AVAILABLE }, { where: { room_id: { [Op.in]: cancelledRoomIds }, status: ROOM_STATUS.RESERVED } });
      updates.payment_status = 'refunded';
    }

    await booking.update(updates);
    await BookingStatusHistory.create({
      booking_id: booking.booking_id,
      from_status: previous,
      to_status: status,
      changed_by: user ? user.user_id : null,
      reason,
    });
    return this.getById(id);
  },

  async checkIn(id, user) {
    const booking = await this.getById(id);
    if (booking.status !== BOOKING_STATUS.CONFIRMED && booking.status !== BOOKING_STATUS.PENDING) {
      throw ApiError.badRequest(`Booking cannot be checked in from status "${booking.status}"`);
    }

    await Booking.sequelize.transaction(async (t) => {
      const previous = booking.status;
      await booking.update({ status: BOOKING_STATUS.CHECKED_IN, checked_in_at: new Date(), updated_by: user ? user.user_id : null }, { transaction: t });

      await BookingStatusHistory.create(
        { booking_id: booking.booking_id, from_status: previous, to_status: BOOKING_STATUS.CHECKED_IN, changed_by: user ? user.user_id : null },
        { transaction: t }
      );

      for (const br of booking.bookingRooms) {
        await BookingRoom.update({ status: 'checked_in' }, { where: { booking_room_id: br.booking_room_id }, transaction: t });
        await Room.update({ status: ROOM_STATUS.OCCUPIED }, { where: { room_id: br.room_id }, transaction: t });
        await GuestStay.create(
          {
            booking_id: booking.booking_id,
            guest_id: booking.guest_id,
            room_id: br.room_id,
            check_in_at: new Date(),
            status: 'in_house',
          },
          { transaction: t }
        );
      }
    });

    return this.getById(id);
  },

  async checkOut(id, user) {
    const booking = await this.getById(id);
    if (booking.status !== BOOKING_STATUS.CHECKED_IN) {
      throw ApiError.badRequest(`Booking cannot be checked out from status "${booking.status}"`);
    }

    await Booking.sequelize.transaction(async (t) => {
      const previous = booking.status;
      await booking.update({ status: BOOKING_STATUS.CHECKED_OUT, checked_out_at: new Date(), updated_by: user ? user.user_id : null }, { transaction: t });

      await BookingStatusHistory.create(
        { booking_id: booking.booking_id, from_status: previous, to_status: BOOKING_STATUS.CHECKED_OUT, changed_by: user ? user.user_id : null },
        { transaction: t }
      );

      for (const br of booking.bookingRooms) {
        await BookingRoom.update({ status: 'checked_out' }, { where: { booking_room_id: br.booking_room_id }, transaction: t });
        await Room.update({ status: ROOM_STATUS.HOUSEKEEPING_PENDING }, { where: { room_id: br.room_id }, transaction: t });
        await GuestStay.update(
          { check_out_at: new Date(), status: 'checked_out' },
          { where: { booking_id: booking.booking_id, room_id: br.room_id, status: 'in_house' }, transaction: t }
        );
      }
    });

    return this.getById(id);
  },

  async addBookingRoom(id, roomId, roomRate, user) {
    const booking = await this.getById(id);
    if (!['pending', 'confirmed'].includes(booking.status)) {
      throw ApiError.badRequest(`Rooms cannot be added to a "${booking.status}" booking`);
    }
    const room = await Room.findByPk(roomId);
    if (!room) throw ApiError.notFound('Room not found');

    const nights = computeNights(booking.check_in_date, booking.check_out_date);
    const nightRate = Number(roomRate) || Number(room.roomType && room.roomType.base_rate) || 0;

    await BookingRoom.create({
      booking_id: booking.booking_id,
      room_id: room.room_id,
      room_type_id: room.room_type_id,
      room_rate: rate,
      check_in_date: booking.check_in_date,
      check_out_date: booking.check_out_date,
    });

    const newRate = toDecimal(Number(booking.rate) + rate * nights);
    const taxAmount = toDecimal(Number(booking.tax_amount));
    await booking.update({ rate: newRate, total_amount: toDecimal(newRate + taxAmount - Number(booking.discount_amount)), updated_by: user ? user.user_id : null });
    return this.getById(id);
  },
};

module.exports = bookingService;