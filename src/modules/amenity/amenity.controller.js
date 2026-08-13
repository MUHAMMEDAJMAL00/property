const createGenericController = require('../../utils/genericController');
const amenityService = require('./amenity.service');

module.exports = createGenericController(amenityService);