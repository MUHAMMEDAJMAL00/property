const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const createGenericController = require('../../utils/genericController');

const roleService = require('./role.service');

const rc = createGenericController(roleService);

module.exports = {
  ...rc,
  allPermissions: catchAsync(async (req, res) => {
    const data = await roleService.allPermissions();
    res.json(ApiResponse.success('Permissions fetched', data));
  }),
  assignPermissions: catchAsync(async (req, res) => {
    const data = await roleService.assignPermissions(req.params.id, req.body.permission_ids);
    res.json(ApiResponse.success('Permissions assigned', data));
  }),
};