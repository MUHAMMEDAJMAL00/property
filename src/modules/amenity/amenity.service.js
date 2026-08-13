const { Amenity } = require('./amenity.model');
const createCrudService = require('../../utils/genericCrud');

module.exports = createCrudService(Amenity, {
  searchFields: ['name'],
  filterFields: ['status'],
});