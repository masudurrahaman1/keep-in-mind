import { type ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  Search,
  Users,
  ShieldCheck,
  FileText,
  Settings,
  Menu,
  X,
  LogOut,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

const NAV_ITEMS = [
  { name: "Insights", href: "/", icon: LayoutDashboard },
  { name: "Search", href: "/search", icon: Search },
  { name: "Users", href: "/users", icon: Users },
  { name: "Security", href: "/security", icon: ShieldCheck },
  { name: "Logs", href: "/logs", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Layout({ children }: { children: ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-surface text-on-surface font-sans">
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex flex-col w-72 bg-surface-container-lowest border-r border-outline-variant z-40 relative shadow-2xl">
        <div className="px-8 py-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <ShieldCheck className="w-6 h-6 text-on-primary" />
          </div>
          <span className="text-h2 font-bold tracking-tight gradient-text">Keep In Mind</span>
        </div>
        
        <div className="flex-1 py-4 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-4 opacity-50">Main Menu</p>
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.href || (item.href !== "/" && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "group flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 font-medium",
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                )}
              >
                <div className="flex items-center gap-3">
                   <item.icon className={cn("w-5 h-5 transition-transform duration-300", isActive ? "scale-110" : "group-hover:scale-110")} />
                   <span>{item.name}</span>
                </div>
                {isActive && (
                  <motion.div layoutId="active-pill" className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)]" />
                )}
                {!isActive && <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />}
              </Link>
            );
          })}

          <div className="pt-8">
            <p className="px-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-4 opacity-50">Links</p>
            <a
              href="https://keepinmind.in"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 text-on-surface-variant hover:bg-surface-container hover:text-primary"
            >
              <ExternalLink className="w-5 h-5" />
              <span className="font-medium">View Main Site</span>
            </a>
          </div>
        </div>

        <div className="p-6 mt-auto">
           <button
            onClick={() => {
              localStorage.removeItem("admin_token");
              window.location.href = "/login";
            }}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 bg-error/10 text-error hover:bg-error hover:text-on-error font-bold shadow-lg shadow-error/5"
          >
            <LogOut className="w-5 h-5" />
            Logout Session
          </button>
        </div>

        <div className="p-6 border-t border-outline-variant bg-surface-container-low/50">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop"
                alt="Admin"
                className="w-11 h-11 rounded-xl border-2 border-outline-variant object-cover shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-secondary rounded-full border-2 border-surface shadow-sm" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-on-surface leading-tight">System Admin</span>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider opacity-60">Super User</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-accent-purple/5 rounded-full blur-[100px] -ml-32 -mb-32 pointer-events-none" />

        {/* Top Header */}
        <header className="flex-shrink-0 h-20 glass border-b border-outline-variant flex items-center justify-between px-6 md:px-10 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2.5 rounded-xl hover:bg-surface-container text-on-surface transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden md:block">
               <h1 className="text-xl font-bold tracking-tight">Executive Dashboard</h1>
               <p className="text-[11px] font-medium text-on-surface-variant uppercase tracking-widest opacity-60">Control Center v1.2</p>
            </div>
            <h1 className="text-lg font-bold gradient-text md:hidden">Executive Admin</h1>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="hidden sm:flex items-center bg-surface-container rounded-full px-4 py-1.5 border border-outline-variant shadow-inner">
                <div className="w-2 h-2 rounded-full bg-secondary animate-pulse mr-2" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Live System: Stable</span>
             </div>
             <Link to="/help" className="text-sm text-primary hover:text-accent-purple transition-colors hidden sm:block font-bold">Help Center</Link>
             <div className="h-8 w-px bg-outline-variant hidden sm:block" />
             <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop"
                alt="Profile"
                className="w-10 h-10 rounded-xl border border-outline-variant object-cover md:hidden shadow-lg"
              />
          </div>
        </header>

        {/* Main Scrollable Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 md:p-10 pb-24 md:pb-10 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Mobile Slide-Out Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative flex-1 flex flex-col max-w-xs w-full glass-dark border-r border-outline-variant text-on-surface shadow-2xl"
            >
              <div className="px-8 py-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-on-primary" />
                  </div>
                  <span className="text-h2 font-bold tracking-tight gradient-text">Admin</span>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl hover:bg-surface-container text-on-surface transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex-1 py-4 px-4 space-y-2 overflow-y-auto">
                {NAV_ITEMS.map((item) => {
                  const isActive = location.pathname === item.href || (item.href !== "/" && location.pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-300 font-medium",
                        isActive
                          ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                          : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                      )}
                    >
                      <item.icon className="w-6 h-6" />
                      <span className="text-base">{item.name}</span>
                    </Link>
                  );
                })}

                <div className="pt-6 border-t border-outline-variant/30 mt-6">
                  <a
                    href="https://keepinmind.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all text-on-surface-variant hover:text-primary"
                  >
                    <ExternalLink className="w-6 h-6" />
                    <span className="font-medium text-base">Main Website</span>
                  </a>
                </div>
              </div>

              <div className="p-6 border-t border-outline-variant/30">
                <button
                  onClick={() => {
                    localStorage.removeItem("admin_token");
                    window.location.href = '/login';
                  }}
                  className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-xl transition-all bg-error/10 text-error font-bold"
                >
                  <LogOut className="w-6 h-6" />
                  Logout
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 z-50 h-16 glass border border-outline-variant rounded-2xl shadow-2xl flex justify-around items-center px-2">
        {[
          { name: "Insights", href: "/", icon: LayoutDashboard },
          { name: "Search", href: "/search", icon: Search },
          { name: "Users", href: "/users", icon: Users },
          { name: "Settings", href: "/settings", icon: Settings },
        ].map((item) => {
          const isActive = location.pathname === item.href || (item.href !== "/" && location.pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center p-2 min-w-[64px] transition-all duration-300",
                isActive ? "text-primary" : "text-on-surface-variant"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-bg"
                  className="absolute inset-0 bg-primary/10 rounded-xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <item.icon className={cn("w-6 h-6 relative z-10", isActive && "scale-110")} />
              <span className={cn("text-[10px] font-bold uppercase tracking-wider relative z-10 mt-0.5", isActive ? "opacity-100" : "opacity-0 h-0 overflow-hidden")}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

