const bcrypt = require('bcryptjs');
const { User } = require('./user.model');
const createCrudService = require('../../utils/genericCrud');
const ApiError = require('../../utils/ApiError');

const userService = createCrudService(User, {
  searchFields: ['first_name', 'last_name', 'email', 'mobile'],
  filterFields: ['role_id', 'is_active'],
  includes: ['role'],
});

userService.resetPassword = async (id, newPassword) => {
  const user = await userService.getById(id);
  user.password_hash = bcrypt.hashSync(newPassword, 10);
  await user.save();
  return user;
};

userService.activate = async (id, isActive) => {
  const user = await userService.getById(id);
  user.is_active = Boolean(isActive);
  await user.save();
  return user;
};

userService.create = async (data, currentUser) => {
  if (!data.password) throw ApiError.badRequest('password is required');
  const record = await User.create({
    ...data,
    password_hash: bcrypt.hashSync(data.password, 10),
    created_by: currentUser ? currentUser.user_id : null,
  });
  return userService.getById(record.user_id);
};

module.exports = userService;