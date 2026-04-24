const User = require('../models/User');
const Media = require('../models/Media');
const Activity = require('../models/Activity');

// @desc    Get system-wide stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const googleUsers = await User.countDocuments({ authProvider: 'google' });
    const localUsers = await User.countDocuments({ authProvider: 'local' });
    const totalMedia = await Media.countDocuments();

    // Active Now: Users with lastActive in the last 10 minutes (via heartbeat)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    let activeNow = await User.countDocuments({ lastActive: { $gte: tenMinutesAgo } });
    
    if (activeNow === 0 && totalUsers > 0) activeNow = 1;

    // Calculate growth (mocked logic for "this month")
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const usersThisMonth = await User.countDocuments({ createdAt: { $gte: oneMonthAgo } });
    const growth = totalUsers > 0 ? ((usersThisMonth / totalUsers) * 100).toFixed(1) : 0;

    res.json({
      totalUsers,
      googleUsers,
      localUsers,
      totalMedia,
      activeNow,
      growth: parseFloat(growth)
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get only active users
// @route   GET /api/admin/users/active
// @access  Private/Admin
const getActiveUsers = async (req, res) => {
  try {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const users = await User.find({ lastActive: { $gte: tenMinutesAgo } }).sort({ lastActive: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get recent system activities
// @route   GET /api/admin/activities
// @access  Private/Admin
const getActivities = async (req, res) => {
  try {
    const activities = await Activity.find({}).sort({ createdAt: -1 }).limit(50);
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getStats, getUsers, getActiveUsers, getActivities };
