const express = require('express');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const bookingController = require('./booking.controller');

const router = express.Router();

router.use(authenticate);

router
  .route('/')
  .get(authorize(), bookingController.listBookings)
  .post(authorize('super_admin', 'front_office'), bookingController.createBooking);

router
  .route('/:id')
  .get(authorize(), bookingController.getBooking);

router.post('/:id/status', authorize('super_admin', 'front_office'), bookingController.changeBookingStatus);
router.post('/:id/check-in', authorize('super_admin', 'front_office'), bookingController.checkInBooking);
router.post('/:id/check-out', authorize('super_admin', 'front_office'), bookingController.checkOutBooking);
router.post('/:id/rooms', authorize('super_admin', 'front_office'), bookingController.addRoomToBooking);

module.exports = router;