const Activity = require('../models/Activity');

const logActivity = async ({ title, actor, level = 'INFO', type = 'neutral', ip, details }) => {
  try {
    await Activity.create({ title, actor, level, type, ip, details });
  } catch (error) {
    console.error('[Activity Log Error]', error.message);
  }
};

module.exports = logActivity;
