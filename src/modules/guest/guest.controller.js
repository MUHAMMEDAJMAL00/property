const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const guestService = require('./guest.service');

const guestController = {
  listGuests: catchAsync(async (req, res) => {
    const data = await guestService.list(req.query);
    res.json(ApiResponse.success('Guests fetched', data));
  }),

  getGuest: catchAsync(async (req, res) => {
    const data = await guestService.getById(req.params.id);
    res.json(ApiResponse.success('Guest fetched', data));
  }),

  getGuestHistory: catchAsync(async (req, res) => {
    const data = await guestService.getHistory(req.params.id);
    res.json(ApiResponse.success('Guest history fetched', data));
  }),

  createGuest: catchAsync(async (req, res) => {
    const data = await guestService.create(req.body);
    res.status(201).json(ApiResponse.success('Guest created', data));
  }),

  updateGuest: catchAsync(async (req, res) => {
    const data = await guestService.update(req.params.id, req.body, req.user);
    res.json(ApiResponse.success('Guest updated', data));
  }),

  removeGuest: catchAsync(async (req, res) => {
    const data = await guestService.remove(req.params.id);
    res.json(ApiResponse.success('Guest removed', data));
  }),
};

module.exports = guestController;