const { Floor } = require('./floor.model');
const createCrudService = require('../../utils/genericCrud');

module.exports = createCrudService(Floor, {
  searchFields: ['name'],
  filterFields: ['status'],
});