import { Link, useLocation } from 'react-router-dom';
import { FileText, CheckCircle2, Bell, User, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import { cn } from '../lib/utils';

export default function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();
  const { themeColor } = usePreferences();

  const themeMap = {
    yellow: { text: 'text-[#FFC107]', fill: 'fill-[#FFC107]/10', bg: 'bg-[#FFF9EA] dark:bg-amber-950/25', ring: 'ring-[#FFC107]' },
    blue: { text: 'text-[#007AFF]', fill: 'fill-[#007AFF]/10', bg: 'bg-[#F0F7FF] dark:bg-blue-950/25', ring: 'ring-[#007AFF]' },
    green: { text: 'text-[#34C759]', fill: 'fill-[#34C759]/10', bg: 'bg-[#F0FDF4] dark:bg-emerald-950/25', ring: 'ring-[#34C759]' },
    purple: { text: 'text-[#AF52DE]', fill: 'fill-[#AF52DE]/10', bg: 'bg-[#FAF5FF] dark:bg-purple-950/25', ring: 'ring-[#AF52DE]' },
    rose: { text: 'text-[#FF2D55]', fill: 'fill-[#FF2D55]/10', bg: 'bg-[#FFE5E9] dark:bg-rose-950/25', ring: 'ring-[#FF2D55]' },
    orange: { text: 'text-[#FF9500]', fill: 'fill-[#FF9500]/10', bg: 'bg-[#FFF0D4] dark:bg-orange-950/25', ring: 'ring-[#FF9500]' }
  };
  const activeTheme = themeMap[themeColor] || themeMap.yellow;

  // Hide BottomNav on settings pages
  if (location.pathname.startsWith('/settings')) {
    return null;
  }

  const links: { path: string; label: string; icon: any; isAvatar?: boolean; badge?: number }[] = [
    { path: '/notes', label: 'Notes', icon: FileText },
    { path: '/tasks', label: 'Tasks', icon: CheckCircle2 },
    { path: '/reminders', label: 'Reminders', icon: Bell },
    { path: '/gallery', label: 'Personal', icon: ImageIcon },
    { path: '/account', label: 'Profile', icon: User, isAvatar: true },
  ];

  return (
    <>

      {/* Floating iOS style Dock Navbar */}
      <nav className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-[380px] bg-white/75 dark:bg-black/60 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-[20px] py-1.5 px-3 z-50 shadow-[0_10px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition-all duration-300 hover:shadow-[0_14px_35px_rgba(0,0,0,0.08)] hover:scale-[1.01] active:scale-[0.99] flex items-center justify-between">
        <ul className="flex items-center justify-between w-full">
          {links.map((item) => {
            const active = location.pathname.startsWith(item.path) || 
                          (item.path === '/settings' && location.pathname === '/settings') ||
                          (item.isAvatar && location.pathname === '/account');

            const renderAvatar = () => {
              const borderClass = active 
                ? `ring-1.5 ${activeTheme.ring} ring-offset-1 dark:ring-offset-black scale-105` 
                : 'border border-gray-300/40 hover:border-gray-400 dark:border-white/20';
              if (user?.avatar) {
                return (
                  <img 
                    src={user.avatar} 
                    alt="Profile" 
                    className={`w-[18px] h-[18px] rounded-full object-cover transition-all duration-300 ${borderClass}`} 
                  />
                );
              }
              return (
                <div className={`w-[18px] h-[18px] rounded-full bg-gradient-to-br from-[#0088cc] to-[#00c6ff] flex items-center justify-center text-white text-[8px] font-black transition-all duration-300 ${borderClass}`}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : <User size={10} className="text-white" />}
                </div>
              );
            };

            const renderIcon = () => {
              if (item.isAvatar) {
                return renderAvatar();
              }
              const Icon = item.icon;
              return (
                <div className="relative flex items-center justify-center">
                  <Icon 
                    size={19} 
                    className={`transition-all duration-300 ${
                      active 
                        ? `${activeTheme.text} scale-110 ${activeTheme.fill}` 
                        : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400'
                    }`} 
                  />
                  {item.badge && (
                    <span className="absolute -top-1 -right-2 bg-[#FF3B30] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full min-w-[13px] h-[13px] flex items-center justify-center shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </div>
              );
            };

            return (
              <li key={item.label}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex flex-col items-center justify-center w-14 h-10 rounded-[14px] transition-all duration-300 active:opacity-75",
                    active 
                      ? `${activeTheme.bg} ${activeTheme.text}` 
                      : "text-gray-400 dark:text-gray-500"
                  )}
                >
                  {renderIcon()}
                  <span className={`text-[9px] mt-0.5 font-semibold tracking-wide transition-all duration-300 ${
                    active 
                      ? `${activeTheme.text} font-bold` 
                      : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
