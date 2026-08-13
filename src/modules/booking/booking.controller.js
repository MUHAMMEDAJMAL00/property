const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const bookingService = require('./booking.service');

const bookingController = {
  listBookings: catchAsync(async (req, res) => {
    const data = await bookingService.list(req.query);
    res.json(ApiResponse.success('Bookings fetched', data));
  }),

  getBooking: catchAsync(async (req, res) => {
    const data = await bookingService.getById(req.params.id);
    res.json(ApiResponse.success('Booking fetched', data));
  }),

  createBooking: catchAsync(async (req, res) => {
    const data = await bookingService.create(req.body, req.user);
    res.status(201).json(ApiResponse.success('Booking created', data));
  }),

  changeBookingStatus: catchAsync(async (req, res) => {
    const { status, reason } = req.body;
    const data = await bookingService.changeStatus(req.params.id, status, reason, req.user);
    res.json(ApiResponse.success('Booking status changed', data));
  }),

  checkInBooking: catchAsync(async (req, res) => {
    const data = await bookingService.checkIn(req.params.id, req.user);
    res.json(ApiResponse.success('Booking checked in', data));
  }),

  checkOutBooking: catchAsync(async (req, res) => {
    const data = await bookingService.checkOut(req.params.id, req.user);
    res.json(ApiResponse.success('Booking checked out', data));
  }),

  addRoomToBooking: catchAsync(async (req, res) => {
    const data = await bookingService.addBookingRoom(req.params.id, req.body.room_id, req.body.room_rate, req.user);
    res.status(201).json(ApiResponse.success('Room added to booking', data));
  }),
};

module.exports = bookingController;