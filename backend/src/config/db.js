const mongoose = require("mongoose");
const env = require("./env");

async function connectDb() {
  await mongoose.connect(env.mongoUri, {
    autoIndex: env.nodeEnv !== "production",
    maxPoolSize: 100, // Handle up to 100 concurrent students rapidly querying database
  });
  // eslint-disable-next-line no-console
  console.log("MongoDB connected with pool size 100");
}

module.exports = connectDb;
