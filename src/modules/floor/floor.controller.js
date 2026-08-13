const createGenericController = require('../../utils/genericController');
const floorService = require('./floor.service');

module.exports = createGenericController(floorService);