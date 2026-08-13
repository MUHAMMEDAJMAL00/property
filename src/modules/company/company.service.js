const { Company } = require('./company.model');
const createCrudService = require('../../utils/genericCrud');

module.exports = createCrudService(Company, {
  searchFields: ['company_name', 'contact_person', 'mobile', 'email'],
  filterFields: ['company_type', 'status'],
});