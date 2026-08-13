const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwt: jwtConfig } = require('../../config/env');
const { User } = require('../user/user.model');
const ApiError = require('../../utils/ApiError');

const authService = {
  async login(email, password) {
    const user = await User.findOne({
      where: { email },
      include: [{ association: 'role', include: ['permissions'] }],
    });
    if (!user) throw ApiError.unauthorized('Invalid email or password');
    if (!user.is_active) throw ApiError.unauthorized('Account is inactive');

    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) throw ApiError.unauthorized('Invalid email or password');

    user.last_login_at = new Date();
    await user.save();

    const token = jwt.sign({ sub: user.user_id, email: user.email, role: user.role.name }, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn,
    });

    return { token, user };
  },

  async me(userId) {
    const user = await User.findByPk(userId, {
      include: [{ association: 'role', include: ['permissions'] }],
    });
    if (!user) throw ApiError.notFound('User not found');
    return user;
  },

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findByPk(userId);
    if (!user) throw ApiError.notFound('User not found');
    if (!bcrypt.compareSync(currentPassword, user.password_hash)) {
      throw ApiError.badRequest('Current password is incorrect');
    }
    user.password_hash = bcrypt.hashSync(newPassword, 10);
    await user.save();
    return { message: 'Password changed successfully' };
  },
};

module.exports = authService;