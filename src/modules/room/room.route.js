const express = require('express');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const roomController = require('./room.controller');

const router = express.Router();

router.use(authenticate);

router.get('/available', authorize(), roomController.getAvailableRooms);

router
  .route('/')
  .get(authorize(), roomController.listRooms)
  .post(authorize('super_admin', 'front_office'), roomController.createRoom);

router
  .route('/:id')
  .get(authorize(), roomController.getRoom)
  .patch(authorize('super_admin', 'front_office'), roomController.updateRoom);

router.patch('/:id/status', authorize('super_admin', 'front_office', 'housekeeping'), roomController.changeRoomStatus);
router.get('/:id/history', authorize(), roomController.getRoomHistory);

module.exports = router;