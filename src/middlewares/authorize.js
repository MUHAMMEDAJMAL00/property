const ApiError = require('../utils/ApiError');

/**
 * Role-based access control.
 * Usage: router.get('/', authorize('front_office'), controller.list);
 * super_admin always passes.
 */
const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) return next(ApiError.unauthorized());

  const roleName = req.user.role ? req.user.role.name : null;
  if (roleName === 'super_admin' || (allowedRoles.length === 0 ? roleName : allowedRoles.includes(roleName))) {
    return next();
  }

  return next(ApiError.forbidden());
};

module.exports = authorize;