import { Link, useLocation } from 'react-router-dom';
import { FileText, Tag, PlusCircle, Inbox, User } from 'lucide-react';
import { cn } from './Sidebar';

export default function BottomNav() {
  const location = useLocation();

  const links = [
    { path: '/notes', label: 'Notes', icon: FileText },
    { path: '/labels', label: 'Labels', icon: Tag },
    { path: '/gallery', label: 'Spaces', icon: Inbox },
    { path: '/account', label: 'Profile', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-surface-variant px-4 py-2 z-50 safe-area-bottom">
      <ul className="flex items-center justify-between">
        {links.map((item) => {
          const isProfile = item.path === '/account';
          const active = location.pathname.startsWith(item.path) || (isProfile && location.pathname === '/settings');
          const Icon = item.icon;
          
          if (item.isMain) {
            return (
              <li key={item.label} className="relative -top-5">
                <Link
                  to={item.path}
                  className="w-14 h-14 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all active:scale-95"
                >
                  <Icon size={30} strokeWidth={1.5} />
                </Link>
              </li>
            );
          }
          
          return (
            <li key={item.label}>
              <Link
                to={item.path}
                className={cn(
                  'flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-colors',
                  active 
                    ? 'text-primary bg-primary-container/30' 
                    : 'text-on-surface-variant hover:bg-surface-container'
                )}
              >
                <Icon size={24} className={active ? 'fill-primary/20' : ''} />
                <span className="text-[10px] mt-1 font-medium">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
