const { sync } = require('./index');

(async () => {
  try {
    await sync({ alter: process.argv.includes('--alter') });
    console.log('[sync] All tables are in sync.');
    process.exit(0);
  } catch (error) {
    console.error('[sync] Failed:', error);
    process.exit(1);
  }
})();