const AdminLog = require("../models/AdminLog");

async function logAction(actor, action, payload = {}) {
  if (!actor) return;
  await AdminLog.create({ actor, action, payload });
}

module.exports = logAction;
