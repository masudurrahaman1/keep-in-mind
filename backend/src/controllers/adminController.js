const User = require('../models/User');
const Media = require('../models/Media');
const Activity = require('../models/Activity');
const Session = require('../models/Session');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');

// @desc    Admin Login
// @route   POST /api/admin/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Hardcoded check as requested for the executive admin
    if (email === "masudurrahamanrm@gmail.com" && password === "masudur@8145") {
      const token = generateToken("admin_executive_root");
      
      // Track session info
      const ua = req.headers['user-agent'] || '';
      let os = "Other";
      if (ua.includes("Windows")) os = "Windows";
      else if (ua.includes("Macintosh")) os = "Mac OS";
      else if (ua.includes("iPhone")) os = "iPhone";
      else if (ua.includes("Android")) os = "Android";
      
      let device = "Desktop";
      if (ua.includes("Mobi")) device = "Phone";
      else if (ua.includes("Tablet")) device = "Tablet";

      await Session.create({
        userId: "admin_executive_root",
        device,
        os,
        browser: ua.includes("Chrome") ? "Chrome" : ua.includes("Safari") ? "Safari" : "Firefox",
        ip: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
        lastActive: new Date()
      });

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

// @desc    Get all active admin sessions
// @route   GET /api/admin/sessions
// @access  Private/Admin
const getSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ userId: "admin_executive_root" }).sort({ lastActive: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Revoke a session
// @route   DELETE /api/admin/sessions/:id
// @access  Private/Admin
const revokeSession = async (req, res) => {
  try {
    await Session.findByIdAndDelete(req.params.id);
    res.json({ message: "Session revoked successfully" });
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
    
    // Time-based user growth
    const now = new Date();
    const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));
    const startOfWeek = new Date(new Date().setDate(new Date().getDate() - 7));
    const startOfMonth = new Date(new Date().setMonth(new Date().getMonth() - 1));

    const usersToday = await User.countDocuments({ createdAt: { $gte: startOfToday } });
    const usersWeek = await User.countDocuments({ createdAt: { $gte: startOfWeek } });
    const usersMonth = await User.countDocuments({ createdAt: { $gte: startOfMonth } });

    // Active Now (10 min heartbeat)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const activeNow = await User.countDocuments({ lastActive: { $gte: tenMinutesAgo } }) || 1;
    
    // Growth (last 7 days vs previous 7)
    const prevStartOfWeek = new Date(new Date().setDate(new Date().getDate() - 14));
    const usersPrevWeek = await User.countDocuments({ 
      createdAt: { $gte: prevStartOfWeek, $lt: startOfWeek } 
    });
    
    let growth = 0;
    if (usersPrevWeek > 0) {
      growth = ((usersWeek - usersPrevWeek) / usersPrevWeek) * 100;
    } else if (usersWeek > 0) {
      growth = 100;
    }

    // Chart Data (Last 7 days)
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const nextD = new Date(d);
      nextD.setDate(nextD.getDate() + 1);
      const count = await User.countDocuments({ createdAt: { $gte: d, $lt: nextD } });
      chartData.push({
        name: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        pv: count
      });
    }

    res.json({
      totalUsers,
      googleUsers,
      localUsers,
      totalMedia,
      usersToday,
      usersWeek,
      usersMonth,
      activeNow,
      growth: growth.toFixed(1),
      chartData,
      notesCreated: totalMedia * 3 // Mocked multiplier for "notes" vs "media"
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
    console.log("[Admin API] Fetching all users...");
    const users = await User.find({}).sort({ createdAt: -1 });
    console.log(`[Admin API] Found ${users.length} users.`);
    res.json(users);
  } catch (error) {
    console.error("[Admin API] Error fetching users:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Seed sample users for testing
// @route   POST /api/admin/seed
// @access  Private/Admin
const seedUsers = async (req, res) => {
  try {
    const count = await User.countDocuments();
    if (count > 0) return res.status(400).json({ message: "Database already has data. Seeding cancelled." });

    const samples = [
      { name: "Sarah Jenkins", email: "sarah.j@keepinmind.in", isVerified: true, authProvider: 'local' },
      { name: "Michael Chen", email: "m.chen@keepinmind.in", isVerified: true, authProvider: 'google' },
      { name: "Emily Wright", email: "emily.w@keepinmind.in", isVerified: false, authProvider: 'local' }
    ];

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash("Admin123!", salt);

    const created = await User.insertMany(samples.map(s => ({ ...s, password })));
    res.json({ message: "System seeded with sample identities", count: created.length });
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


// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    await user.deleteOne();
    res.json({ message: "User identity purged from system" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Provision (Create) a new user
// @route   POST /api/admin/users
// @access  Private/Admin
const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "Identity already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || "ChangeMe123!", salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isVerified: true,
      authProvider: 'local'
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { login, getSessions, revokeSession, getStats, getUsers, getActiveUsers, getActivities, getProfile, updateProfile, deleteUser, createUser, seedUsers };

