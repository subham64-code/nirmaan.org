const mongoose = require("mongoose");
const env = require("./env");

async function connectDb() {
  await mongoose.connect(env.mongoUri, {
    autoIndex: env.nodeEnv !== "production",
  });
  // eslint-disable-next-line no-console
  console.log("MongoDB connected");
}

module.exports = connectDb;
