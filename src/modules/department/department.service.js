const { Department } = require('./department.model');
const createCrudService = require('../../utils/genericCrud');

module.exports = createCrudService(Department, {
  searchFields: ['name', 'code'],
  filterFields: ['status'],
});