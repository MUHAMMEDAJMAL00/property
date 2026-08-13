const { Op } = require('sequelize');
const ApiError = require('./ApiError');
const { getPagination, getPagingData } = require('./pagination');

/**
 * Factory that builds a standard CRUD service for a Sequelize model.
 * Every module in src/modules uses this so behaviour stays consistent.
 *
 * options:
 *   searchFields: string[]          -> columns matched with LIKE when ?search= is passed
 *   filterFields: string[]          -> columns matched exactly when present in query
 *   includes:     (string|object)[] -> Sequelize include definitions (association aliases)
 *   defaultOrder: [string, string]  -> order for list queries
 */
const createCrudService = (Model, options = {}) => {
  const { searchFields = [], filterFields = [], includes = [], defaultOrder = ['created_at', 'DESC'] } = options;

  const buildInclude = () => includes.map((inc) => (typeof inc === 'string' ? { association: inc } : inc));

  const searchWhere = (search) => {
    if (!search || searchFields.length === 0) return {};
    return {
      [Op.or]: searchFields.map((field) => ({ [field]: { [Op.like]: `%${search}%` } })),
    };
  };

  const filterWhere = (query) => {
    const where = {};
    filterFields.forEach((field) => {
      if (query[field] !== undefined && query[field] !== '') where[field] = query[field];
    });
    return where;
  };

  const sanitize = (data) => {
    const allowed = {};
    Object.keys(Model.rawAttributes).forEach((key) => {
      if (data[key] !== undefined) allowed[key] = data[key];
    });
    return allowed;
  };

  return {
    async list(query) {
      const { page, limit, offset } = getPagination(query);
      const { count, rows } = await Model.findAndCountAll({
        where: { ...searchWhere(query.search), ...filterWhere(query) },
        include: buildInclude(),
        distinct: true,
        limit,
        offset,
        order: [defaultOrder],
      });
      return getPagingData({ count, rows }, page, limit);
    },

    async getById(id) {
      const record = await Model.findByPk(id, { include: buildInclude() });
      if (!record) throw ApiError.notFound(`${Model.name} not found`);
      return record;
    },

    async create(data, user) {
      return Model.create(sanitize({ ...data, created_by: user ? user.user_id : null }));
    },

    async update(id, data, user) {
      const record = await this.getById(id);
      await record.update(sanitize({ ...data, updated_by: user ? user.user_id : null }));
      return this.getById(id);
    },

    async remove(id) {
      const record = await this.getById(id);
      await record.destroy();
      return record;
    },
  };
};

module.exports = createCrudService;