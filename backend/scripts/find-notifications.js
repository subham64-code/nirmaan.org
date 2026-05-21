const mongoose = require('mongoose');
const env = require('../src/config/env');
const Notification = require('../src/models/Notification');

async function run() {
  await mongoose.connect(env.mongoUri, { maxPoolSize: 10 });
  const results = await Notification.find({ message: /Demo Redington Batch Test/i }).limit(100);
  console.log('Found', results.length, 'notifications');
  results.forEach(n => {
    console.log({ id: n._id.toString(), userId: n.userId?.toString(), title: n.title, message: n.message });
  });
  await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });