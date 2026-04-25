const User = require('../models/User');
const Media = require('../models/Media');
const Activity = require('../models/Activity');
const generateToken = require('../utils/generateToken');

// @desc    Admin Login
// @route   POST /api/admin/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Hardcoded check as requested for the executive admin
    if (email === "masudurrahamanrm@gmail.com" && password === "masudur@8145") {
      const token = generateToken("admin_executive_root");
      res.json({
        success: true,
        token,
        admin: {
          name: "Executive Admin",
          email: "masudurrahamanrm@gmail.com",
          role: "ROOT"
        }
      });
    } else {
      res.status(401).json({ message: "Invalid administrative credentials. Access denied." });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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

// @desc    Get admin profile
// @route   GET /api/admin/profile
// @access  Private/Admin
const getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ email: /admin/i }) || await User.findOne({});
    if (!user) return res.status(404).json({ message: "No admin user found" });
    res.json(user);
  } catch (error) {
    console.error("[GetProfile Error]", error);
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { id, _id, name, email } = req.body;
    const userId = id || _id;
    
    console.log("[UpdateProfile Request]", { userId, name, email });

    if (!userId) {
      return res.status(400).json({ message: "User ID is required for update" });
    }

    const user = await User.findById(userId);
    
    if (user) {
      user.name = name || user.name;
      user.email = email || user.email;
      await user.save();
      
      await logActivity({
        title: "Admin Profile Updated",
        actor: user.email,
        type: "success",
        details: `Profile updated: ${user.name}`
      });

      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found in database' });
    }
  } catch (error) {
    console.error("[UpdateProfile Error]", error);
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};


module.exports = { login, getStats, getUsers, getActiveUsers, getActivities, getProfile, updateProfile };

