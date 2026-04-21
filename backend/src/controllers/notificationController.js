const Notification = require('../models/Notification');

/**
 * @desc    Get all notifications for the logged-in user
 * @route   GET /api/notifications
 */
const getNotifications = async (req, res) => {
  try {
    console.log(`[Notification Controller] Fetching for user: ${req.user?._id}`);
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (err) {
    console.error('[Notification Controller Error]', err);
    res.status(500).json({ 
      message: 'Failed to fetch notifications',
      debug: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  }
};

/**
 * @desc    Mark a notification as read
 * @route   PATCH /api/notifications/:id/read
 */
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json(notification);
  } catch (err) {
    console.error('Mark As Read Error:', err);
    res.status(500).json({ message: 'Failed to update notification' });
  }
};

/**
 * @desc    Mark all notifications as read
 * @route   PATCH /api/notifications/read-all
 */
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error('Mark All As Read Error:', err);
    res.status(500).json({ message: 'Failed to update notifications' });
  }
};

/**
 * @desc    Delete a notification
 * @route   DELETE /api/notifications/:id
 */
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    console.error('Delete Notification Error:', err);
    res.status(500).json({ message: 'Failed to delete notification' });
  }
};

/**
 * @desc    Clear all notifications
 * @route   DELETE /api/notifications
 */
const clearAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.user._id });
    res.json({ message: 'All notifications cleared' });
  } catch (err) {
    console.error('Clear All Error:', err);
    res.status(500).json({ message: 'Failed to clear notifications' });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications
};
