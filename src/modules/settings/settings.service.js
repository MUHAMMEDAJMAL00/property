const { Setting } = require('./settings.model');
const ApiError = require('../../utils/ApiError');
const { getPagination, getPagingData } = require('../../utils/pagination');

const settingsService = {
  async list(query) {
    const { page, limit, offset } = getPagination(query);
    const where = {};
    if (query.section) where.section = query.section;
    const { count, rows } = await Setting.findAndCountAll({ where, distinct: true, limit, offset, order: [['section', 'ASC'], ['key', 'ASC']] });
    return getPagingData({ count, rows }, page, limit);
  },

  async getByKey(key) {
    const setting = await Setting.findOne({ where: { key } });
    if (!setting) throw ApiError.notFound('Setting not found');
    return setting;
  },

  async upsert(data, user) {
    if (!data.key) throw ApiError.badRequest('key is required');
    const [setting] = await Setting.findOrCreate({
      where: { key: data.key },
      defaults: { section: data.section || 'system', value: data.value, description: data.description, updated_by: user ? user.user_id : null },
    });
    await setting.update({ section: data.section || setting.section, value: data.value, description: data.description, updated_by: user ? user.user_id : null });
    return setting;
  },

  async remove(key) {
    const setting = await this.getByKey(key);
    await setting.destroy();
    return setting;
  },
};

module.exports = settingsService;