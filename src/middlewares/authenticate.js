const jwt = require('jsonwebtoken');
const { jwt: jwtConfig } = require('../config/env');
const { User } = require('../modules/user/user.model');
const ApiError = require('../utils/ApiError');

const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw ApiError.unauthorized();

    let payload;
    try {
      payload = jwt.verify(token, jwtConfig.secret);
    } catch (error) {
      throw ApiError.unauthorized('Invalid or expired token');
    }

    const user = await User.findByPk(payload.sub, {
      include: [{ association: 'role', include: ['permissions'] }],
    });
    if (!user || !user.is_active) throw ApiError.unauthorized('Account is inactive or not found');

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authenticate;