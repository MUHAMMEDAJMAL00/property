const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const roomService = require('./room.service');

const roomController = {
  listRooms: catchAsync(async (req, res) => {
    const data = await roomService.list(req.query);
    res.json(ApiResponse.success('Rooms fetched', data));
  }),

  getRoom: catchAsync(async (req, res) => {
    const data = await roomService.getById(req.params.id);
    res.json(ApiResponse.success('Room fetched', data));
  }),

  createRoom: catchAsync(async (req, res) => {
    const data = await roomService.create(req.body);
    res.status(201).json(ApiResponse.success('Room created', data));
  }),

  updateRoom: catchAsync(async (req, res) => {
    const data = await roomService.update(req.params.id, req.body, req.user);
    res.json(ApiResponse.success('Room updated', data));
  }),

  changeRoomStatus: catchAsync(async (req, res) => {
    const { status, reason } = req.body;
    const data = await roomService.changeStatus(req.params.id, status, reason, req.user);
    res.json(ApiResponse.success('Room status changed', data));
  }),

  getRoomHistory: catchAsync(async (req, res) => {
    const data = await roomService.getStatusHistory(req.params.id);
    res.json(ApiResponse.success('Room status history fetched', data));
  }),

  getAvailableRooms: catchAsync(async (req, res) => {
    const { from_date: fromDate, to_date: toDate } = req.query;
    const data = await roomService.getAvailable(fromDate, toDate);
    res.json(ApiResponse.success('Available rooms fetched', data));
  }),
};

module.exports = roomController;