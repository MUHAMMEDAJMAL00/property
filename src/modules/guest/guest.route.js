const express = require('express');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const guestController = require('./guest.controller');

const router = express.Router();

router.use(authenticate);

router
  .route('/')
  .get(authorize(), guestController.listGuests)
  .post(authorize('super_admin', 'front_office'), guestController.createGuest);

router
  .route('/:id')
  .get(authorize(), guestController.getGuest)
  .patch(authorize('super_admin', 'front_office'), guestController.updateGuest)
  .delete(authorize('super_admin'), guestController.removeGuest);

router.get('/:id/history', authorize(), guestController.getGuestHistory);

module.exports = router;