const app = require("./app");
const connectDb = require("./config/db");
const env = require("./config/env");

async function connectDbWithRetry({ retries = 6, initialDelayMs = 1000 } = {}) {
  let attempt = 0;
  let delayMs = initialDelayMs;

  while (attempt <= retries) {
    try {
      attempt += 1;
      await connectDb();
      return;
    } catch (error) {
      const isLast = attempt > retries;
      // eslint-disable-next-line no-console
      console.error(`Mongo connection failed (attempt ${attempt}/${retries + 1}).`, error?.message || error);
      if (isLast) throw error;

      // eslint-disable-next-line no-console
      console.warn(`Retrying Mongo connection in ${delayMs}ms...`);
      await new Promise((r) => setTimeout(r, delayMs));
      delayMs *= 2;
    }
  }
}

async function start() {
  await connectDbWithRetry();

  const server = app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Nirmaan backend running on port ${env.port}`);
  });

  // Node-level safety nets (prevents nodemon from immediate hard-crash on unhandled errors)
  process.on('uncaughtException', (err) => {
    // eslint-disable-next-line no-console
    console.error('Uncaught exception:', err);
  });

  process.on('unhandledRejection', (reason) => {
    // eslint-disable-next-line no-console
    console.error('Unhandled rejection:', reason);
  });

  return server;
}

start().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server", error);
  process.exit(1);
});

