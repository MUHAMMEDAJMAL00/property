const { db } = require('./env');

const base = {
  host: db.host,
  port: db.port,
  database: db.name,
  username: db.user,
  password: db.password,
  dialect: db.dialect,
  logging: db.logging,
  define: { underscored: true },
};

module.exports = {
  development: base,
  test: { ...base, database: `${db.name}_test` },
  production: { ...base, logging: false },
};