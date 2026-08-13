const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const createGenericController = require('../../utils/genericController');

const userService = require('./user.service');

const rc = createGenericController(userService, { exclude: ['remove'] });

module.exports = {
  ...rc,
  resetPassword: catchAsync(async (req, res) => {
    const data = await userService.resetPassword(req.params.id, req.body.password);
    res.json(ApiResponse.success('Password reset', data));
  }),
  activate: catchAsync(async (req, res) => {
    const data = await userService.activate(req.params.id, req.body.is_active);
    res.json(ApiResponse.success('User status updated', data));
  }),
};