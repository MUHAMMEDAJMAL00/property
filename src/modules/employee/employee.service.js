const { Employee } = require('./employee.model');
const createCrudService = require('../../utils/genericCrud');

module.exports = createCrudService(Employee, {
  searchFields: ['first_name', 'last_name', 'email', 'mobile', 'employee_code'],
  filterFields: ['department_id', 'status', 'employment_category'],
  includes: ['department'],
});