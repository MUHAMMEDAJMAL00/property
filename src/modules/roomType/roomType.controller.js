const createGenericController = require('../../utils/genericController');
const roomTypeService = require('./roomType.service');

module.exports = createGenericController(roomTypeService);