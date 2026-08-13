const sequelize = require('./sequelize');
const associations = require('./associations');

const connect = async () => {
  await sequelize.authenticate();
  console.log('[database] Connection established successfully.');
  return sequelize;
};

const sync = async (options = {}) => {
  await connect();
  await sequelize.sync(options);
  return sequelize;
};

module.exports = { sequelize, connect, sync, models: associations.models };