const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const authService = require('./auth.service');

const authController = {
  login: catchAsync(async (req, res) => {
    const { email, password } = req.body;
    const data = await authService.login(email, password);
    res.json(ApiResponse.success('Login successful', data));
  }),

  me: catchAsync(async (req, res) => {
    const data = await authService.me(req.user.user_id);
    res.json(ApiResponse.success('Profile fetched', data));
  }),

  changePassword: catchAsync(async (req, res) => {
    const { current_password, new_password } = req.body;
    const data = await authService.changePassword(req.user.user_id, current_password, new_password);
    res.json(ApiResponse.success('Password changed', data));
  }),
};

module.exports = authController;