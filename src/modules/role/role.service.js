const { Role, Permission } = require('./role.model');
const createCrudService = require('../../utils/genericCrud');
const ApiError = require('../../utils/ApiError');

const roleService = createCrudService(Role, {
  searchFields: ['name', 'description'],
  includes: ['permissions'],
});

roleService.allPermissions = async () => Permission.findAll({ order: [['name', 'ASC']] });

roleService.assignPermissions = async (roleId, permissionIds) => {
  const role = await roleService.getById(roleId);
  if (role.is_system) throw ApiError.badRequest('System roles cannot be modified');
  await role.setPermissions(permissionIds);
  return roleService.getById(roleId);
};

module.exports = roleService;