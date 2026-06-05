const Folder = require('../models/Folder');

const DEFAULT_FOLDERS = [
  { name: 'Government ID', iconName: 'CreditCard', colorClass: 'bg-blue-50 text-blue-500 dark:bg-blue-500/10 dark:text-blue-400' },
  { name: 'Bank & Finance', iconName: 'Landmark', colorClass: 'bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400' },
  { name: 'Insurance', iconName: 'ShieldCheck', colorClass: 'bg-violet-50 text-violet-500 dark:bg-violet-500/10 dark:text-violet-400' },
  { name: 'Education', iconName: 'GraduationCap', colorClass: 'bg-amber-50 text-amber-500 dark:bg-amber-500/10 dark:text-amber-400' },
  { name: 'Health', iconName: 'Activity', colorClass: 'bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400' },
  { name: 'Other', iconName: 'Folder', colorClass: 'bg-neutral-50 text-neutral-500 dark:bg-neutral-500/10 dark:text-neutral-400' }
];

/**
 * Seeds the default folders for a newly registered user
 */
const seedDefaultFolders = async (userId) => {
  try {
    for (const folderConfig of DEFAULT_FOLDERS) {
      const existing = await Folder.findOne({ user: userId, name: folderConfig.name });
      if (!existing) {
        await Folder.create({
          user: userId,
          name: folderConfig.name,
          iconName: folderConfig.iconName,
          colorClass: folderConfig.colorClass,
          path: `/documents/${folderConfig.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
          isSystem: true
        });
      }
    }
    console.log(`[FolderService] Seeded default folders for user ${userId}`);
  } catch (error) {
    console.error(`[FolderService] Error seeding default folders for user ${userId}:`, error.message);
  }
};

module.exports = {
  DEFAULT_FOLDERS,
  seedDefaultFolders
};
