const createGenericController = require('../../utils/genericController');
const employeeService = require('./employee.service');

module.exports = createGenericController(employeeService);