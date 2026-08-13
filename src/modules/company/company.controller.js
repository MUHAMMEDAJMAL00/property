const createGenericController = require('../../utils/genericController');
const companyService = require('./company.service');

module.exports = createGenericController(companyService);