import { Bell, Palette, Shield as SecurityIcon, HelpCircle, ChevronRight, Edit3, User, Mail, Globe, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { useState, useEffect } from "react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

export default function Settings() {
  const [theme, setTheme] = useState(localStorage.getItem("admin_theme") || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("admin_theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-24 font-sans">
      <header>
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-display-metrics gradient-text mb-2"
        >
          System Settings
        </motion.h1>
        <p className="text-body-lg text-on-surface-variant font-medium opacity-70">Manage your administrative profile and ecosystem preferences.</p>
      </header>

      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-10 rounded-[32px] shadow-xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
        <h2 className="text-h2 font-bold mb-8 text-on-surface flex items-center gap-3">
          <div className="w-1.5 h-6 bg-primary rounded-full" />
          Administrative Profile
        </h2>
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-10">
          <div className="relative shrink-0 group">
            <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-xl group-hover:bg-primary/40 transition-all duration-500 opacity-0 group-hover:opacity-100" />
            <img
              alt="Profile Picture"
              className="w-32 h-32 rounded-3xl object-cover border-2 border-outline-variant relative z-10 shadow-2xl"
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop"
            />
            <button className="absolute -bottom-2 -right-2 bg-primary text-on-primary rounded-xl p-2.5 shadow-xl hover:scale-110 active:scale-95 transition-all z-20">
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 space-y-6 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] px-1">
                   <User className="w-3 h-3" />
                   Official Name
                </label>
                <div className="relative group">
                  <input
                    className="w-full glass border-outline-variant rounded-2xl px-5 py-4 text-base font-bold text-on-surface focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                    type="text"
                    defaultValue="System Admin"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] px-1">
                   <Mail className="w-3 h-3" />
                   Communication
                </label>
                <div className="relative group">
                  <input
                    className="w-full glass border-outline-variant rounded-2xl px-5 py-4 text-base font-bold text-on-surface focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                    type="email"
                    defaultValue="admin@keepinmind.in"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <button className="h-14 bg-primary text-on-primary font-bold px-8 rounded-2xl hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-primary/20">
                Update Identity
              </button>
              <button className="h-14 glass text-on-surface font-bold px-8 rounded-2xl hover:bg-surface-container transition-all active:scale-95">
                Change Master Key
              </button>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        <motion.section variants={item} className="glass p-8 rounded-[32px] shadow-lg border border-outline-variant/30">
          <h2 className="text-h2 font-bold mb-8 flex items-center gap-4 text-on-surface">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
               <Bell className="w-6 h-6 text-primary" />
            </div>
            Global Alerts
          </h2>
          <ul className="space-y-6">
            <li className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-base font-bold text-on-surface">Critical System Alerts</span>
                <span className="text-xs text-on-surface-variant opacity-60">Immediate notification of hardware failure</span>
              </div>
              <Switch defaultChecked />
            </li>
            <li className="flex items-center justify-between pt-4 border-t border-outline-variant/30">
              <div className="flex flex-col">
                <span className="text-base font-bold text-on-surface">Provisioning Activity</span>
                <span className="text-xs text-on-surface-variant opacity-60">When new identities are created</span>
              </div>
              <Switch />
            </li>
            <li className="flex items-center justify-between pt-4 border-t border-outline-variant/30">
              <div className="flex flex-col">
                <span className="text-base font-bold text-error">Security Breaches</span>
                <span className="text-xs text-on-surface-variant opacity-60">High priority unauthorized attempts</span>
              </div>
              <Switch defaultChecked />
            </li>
          </ul>
        </motion.section>

        <motion.section variants={item} className="glass p-8 rounded-[32px] shadow-lg border border-outline-variant/30">
          <h2 className="text-h2 font-bold mb-8 flex items-center gap-4 text-on-surface">
            <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center">
               <Palette className="w-6 h-6 text-secondary" />
            </div>
            Visual Ecosystem
          </h2>
          <div className="space-y-8">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] px-1">
                 <Globe className="w-3 h-3" />
                 Global Dialect
              </label>
              <select className="w-full glass border-outline-variant rounded-2xl px-5 py-4 text-base font-bold focus:outline-none focus:border-primary transition-all cursor-pointer h-14">
                <option>English (India)</option>
              </select>
            </div>
            <li className="flex items-center justify-between pt-4 border-t border-outline-variant/30 list-none">
              <div className="flex flex-col">
                <span className="text-base font-bold text-on-surface">Dark Mode</span>
                <span className="text-xs text-on-surface-variant opacity-60">Enable deep charcoal and primary blue theme</span>
              </div>
              <Switch checked={theme === "dark"} onChange={toggleTheme} />
            </li>
            <li className="flex items-center justify-between pt-4 border-t border-outline-variant/30 list-none">
              <div className="flex flex-col">
                <span className="text-base font-bold text-on-surface">Pure AMOLED Mode</span>
                <span className="text-xs text-on-surface-variant opacity-60">Optimized for high-contrast OLEDs</span>
              </div>
              <Switch defaultChecked />
            </li>
          </div>
        </motion.section>

        <motion.section variants={item} className="glass p-8 rounded-[32px] shadow-lg border border-outline-variant/30">
          <h2 className="text-h2 font-bold mb-8 flex items-center gap-4 text-on-surface">
            <div className="w-12 h-12 rounded-2xl bg-accent-purple/10 flex items-center justify-center">
               <SecurityIcon className="w-6 h-6 text-accent-purple" />
            </div>
            Access Architecture
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-5 glass rounded-2xl border-primary/20 bg-primary/5">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-on-surface">MFA Protocols</span>
                <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Active Protection</span>
              </div>
              <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_var(--color-secondary)]" />
            </div>
            <Link to="/security/sessions" className="flex items-center justify-between p-5 glass rounded-2xl hover:bg-surface-container transition-all group">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-on-surface/5 rounded-lg">
                  <Lock className="w-4 h-4 text-on-surface-variant" />
                </div>
                <span className="text-sm font-bold text-on-surface">Active Sessions</span>
              </div>
              <ChevronRight className="w-5 h-5 text-on-surface-variant group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.section>

        <motion.section variants={item} className="glass p-8 rounded-[32px] shadow-lg border border-outline-variant/30">
          <h2 className="text-h2 font-bold mb-8 flex items-center gap-4 text-on-surface">
            <div className="w-12 h-12 rounded-2xl bg-on-surface-variant/10 flex items-center justify-center">
               <HelpCircle className="w-6 h-6 text-on-surface-variant" />
            </div>
            Support Systems
          </h2>
          <div className="space-y-3">
            <Link to="/help" className="flex items-center justify-between p-5 glass rounded-2xl hover:bg-surface-container transition-all group">
              <span className="text-sm font-bold text-on-surface">Knowledge Core</span>
              <ChevronRight className="w-5 h-5 text-on-surface-variant group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/terms" className="flex items-center justify-between p-5 glass rounded-2xl hover:bg-surface-container transition-all group">
              <span className="text-sm font-bold text-on-surface">Ecosystem Protocols</span>
              <ChevronRight className="w-5 h-5 text-on-surface-variant group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="flex items-center justify-between p-5 glass rounded-2xl border-outline-variant/30 opacity-60">
              <span className="text-xs font-bold uppercase tracking-widest">Control Center Version</span>
              <span className="text-xs font-bold text-primary">V 1.2.4.0</span>
            </div>
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
}

function Switch({ checked, onChange, defaultChecked = false }: { checked?: boolean, onChange?: () => void, defaultChecked?: boolean }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer group">
      <input 
        type="checkbox" 
        className="sr-only peer" 
        checked={checked}
        onChange={onChange}
        defaultChecked={defaultChecked} 
      />
      <div className="w-14 h-7 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-7 peer-checked:after:bg-on-primary after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-on-surface-variant after:rounded-full after:h-[20px] after:w-[20px] after:transition-all peer-checked:bg-primary shadow-inner"></div>
    </label>
  );
}

