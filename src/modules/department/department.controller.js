const createGenericController = require('../../utils/genericController');
const departmentService = require('./department.service');

module.exports = createGenericController(departmentService);