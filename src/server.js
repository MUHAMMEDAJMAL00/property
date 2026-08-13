const app = require('./app');
const { port, env } = require('./config/env');
const { connect } = require('./database');

(async () => {
  try {
    await connect();
    const server = app.listen(port, () => {
      console.log(`[server] Running in ${env} mode on http://localhost:${port}`);
    });

    const shutdown = (signal) => {
      console.log(`[server] ${signal} received, shutting down gracefully...`);
      server.close(() => process.exit(0));
      setTimeout(() => process.exit(1), 10000).unref();
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('[server] Failed to start:', error);
    process.exit(1);
  }
})();