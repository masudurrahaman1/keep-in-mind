import { Link, useLocation } from 'react-router-dom';
import { FileText, Compass, Inbox, User } from 'lucide-react';
import { cn } from './Sidebar';

export default function BottomNav() {
  const location = useLocation();

  const links = [
    { path: '/notes', label: 'Notes', icon: FileText },
    { path: '/explore', label: 'Explore', icon: Compass },
    { path: '/gallery', label: 'Spaces', icon: Inbox },
    { path: '/account', label: 'Profile', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/80 backdrop-blur-2xl border-t border-white/5 px-4 py-2 z-50 safe-area-bottom shadow-[0_-8px_30px_rgba(0,0,0,0.05)]">
      <ul className="flex items-center justify-between">
        {links.map((item) => {
          const isProfile = item.path === '/account';
          const active = location.pathname.startsWith(item.path) || (isProfile && location.pathname === '/settings');
          const Icon = item.icon;
          

          
          return (
            <li key={item.label}>
              <Link
                to={item.path}
                className={cn(
                  'flex flex-col items-center justify-center w-16 h-12 rounded-2xl transition-all duration-300',
                  active 
                    ? 'text-primary bg-primary/10 shadow-sm' 
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
