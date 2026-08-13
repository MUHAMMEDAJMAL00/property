const { RoomType } = require('./roomType.model');
const createCrudService = require('../../utils/genericCrud');

module.exports = createCrudService(RoomType, {
  searchFields: ['name'],
  filterFields: ['status'],
  includes: ['amenities'],
});