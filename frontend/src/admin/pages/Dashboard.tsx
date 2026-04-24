import { TrendingUp, AlertTriangle, Laptop, Smartphone, FileText, UserCog, History, Users, Activity, ShieldCheck } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { cn } from "../lib/utils";
import { adminService } from "../lib/api";

const chartData = [
  { name: "Oct 1", pv: 15 },
  { name: "Oct 5", pv: 30 },
  { name: "Oct 10", pv: 25 },
  { name: "Oct 15", pv: 40 },
  { name: "Oct 20", pv: 70 },
  { name: "Oct 25", pv: 85 },
  { name: "Oct 30", pv: 100 },
];

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
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Dashboard() {
  const [activities, setActivities] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    googleUsers: 0,
    localUsers: 0,
    totalMedia: 0,
    activeNow: 0,
    growth: 0
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData, activitiesData] = await Promise.all([
          adminService.getStats(),
          adminService.getActivities()
        ]);
        setStats(statsData);
        setActivities(activitiesData);
      } catch (err) {
        console.error("Failed to load admin data:", err);
      }
    };

    loadData();
    const interval = setInterval(loadData, 15000); // Refresh every 15 seconds

    return () => clearInterval(interval);
  }, []);

  const statCards = [
    { label: "Total Users", value: stats.totalUsers.toLocaleString(), trend: `+${stats.growth}%`, icon: Users, color: "text-primary", bg: "bg-primary/10" },
    { label: "Storage Assets", value: stats.totalMedia.toLocaleString(), trend: "Sync", icon: FileText, color: "text-secondary", bg: "bg-secondary/10" },
    { label: "Active Now", value: stats.activeNow.toLocaleString(), trend: "Live", icon: Activity, color: "text-accent-purple", bg: "bg-accent-purple/10" },
  ];


  return (
    <div className="flex flex-col gap-10 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-display-metrics gradient-text mb-2"
          >
            Insights
          </motion.h2>
          <p className="text-body-lg text-on-surface-variant font-medium opacity-70">Real-time system metrics and overview.</p>
        </div>
        <div className="flex items-center gap-3 bg-surface-container rounded-2xl p-1.5 border border-outline-variant shadow-inner">
           <button className="px-4 py-2 bg-primary text-on-primary rounded-xl text-sm font-bold shadow-lg shadow-primary/20 transition-all active:scale-95">Daily</button>
           <button className="px-4 py-2 text-on-surface-variant hover:text-on-surface rounded-xl text-sm font-bold transition-all">Weekly</button>
           <button className="px-4 py-2 text-on-surface-variant hover:text-on-surface rounded-xl text-sm font-bold transition-all">Monthly</button>
        </div>
      </header>

      <motion.section 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {statCards.map((stat, idx) => {
          const isLink = stat.label === "Active Now" || stat.label === "Total Users";
          const CardWrapper = isLink ? Link : "div";
          const wrapperProps = isLink ? { to: stat.label === "Active Now" ? "/active-users" : "/users" } : {};

          return (
            <motion.div 
              key={stat.label}
              variants={item}
              className="flex"
            >
              <CardWrapper 
                {...wrapperProps}
                className={cn(
                  "glass p-8 rounded-[32px] flex flex-col justify-between card-hover relative overflow-hidden group w-full",
                  isLink ? "cursor-pointer" : "cursor-default"
                )}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
                <div className="flex justify-between items-start mb-6">
                   <div className={stat.bg + " p-4 rounded-2xl " + stat.color}>
                      <stat.icon className="w-6 h-6" />
                   </div>
                   <span className="text-secondary text-sm font-bold px-3 py-1 bg-secondary/10 rounded-full">{stat.trend}</span>
                </div>
                <div>
                  <h3 className="text-label-caps text-on-surface-variant mb-2 opacity-60">{stat.label}</h3>
                  <p className="text-h1 font-bold text-on-surface">{stat.value}</p>
                </div>
              </CardWrapper>
            </motion.div>
          );
        })}


      </motion.section>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 glass p-8 rounded-[32px] flex flex-col h-[450px]"
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-h2 font-bold text-on-surface">User Growth</h3>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest opacity-50">Last 30 Days</p>
            </div>
            <div className="flex items-center gap-2 text-primary font-bold text-sm bg-primary/5 px-4 py-2 rounded-xl">
               <TrendingUp className="w-4 h-4" />
               <span>High Performance</span>
            </div>
          </div>
          <div className="flex-1 w-full h-full min-h-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis 
                   dataKey="name" 
                   hide={true}
                />
                <YAxis hide={true} />
                <Tooltip 
                   contentStyle={{ 
                     backgroundColor: 'rgba(13, 17, 23, 0.8)', 
                     borderRadius: '16px', 
                     border: '1px solid rgba(255,255,255,0.1)',
                     backdropFilter: 'blur(12px)',
                     boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                   }}
                   itemStyle={{ color: 'var(--color-primary)', fontWeight: 700 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="pv" 
                  stroke="var(--color-primary)" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorPv)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between mt-6 text-label-caps font-bold text-on-surface-variant opacity-40">
            <span>Oct 01</span>
            <span>Oct 15</span>
            <span>Oct 30</span>
          </div>
        </motion.section>

        <div className="flex flex-col gap-8">
          {/* Categories */}
          <motion.section 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="glass p-8 rounded-[32px] flex flex-col justify-between h-full"
          >
            <h3 className="text-h2 font-bold text-on-surface mb-8">Resource Allocation</h3>
            <div className="space-y-8">
              {[
                { name: "Database", val: "65%", color: "bg-primary", glow: "shadow-primary/40" },
                { name: "Compute", val: "22%", color: "bg-secondary", glow: "shadow-secondary/40" },
                { name: "Storage", val: "13%", color: "bg-accent-purple", glow: "shadow-accent-purple/40" },
              ].map((item) => (
                <div key={item.name} className="group">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-bold text-on-surface opacity-80 group-hover:opacity-100 transition-opacity">{item.name}</span>
                    <span className="text-label-caps font-bold text-primary">{item.val}</span>
                  </div>
                  <div className="h-3 w-full bg-surface-container rounded-full overflow-hidden shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: item.val }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`${item.color} h-full rounded-full shadow-lg ${item.glow}`}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 p-4 bg-primary/5 rounded-2xl border border-primary/10">
               <p className="text-[10px] font-bold text-primary uppercase tracking-widest text-center">Optimized Performance</p>
            </div>
          </motion.section>
        </div>
      </div>

      {/* Recent Activity */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
             <div className="w-1.5 h-6 bg-primary rounded-full" />
             <h2 className="text-h2 font-bold text-on-surface">System Activity</h2>
          </div>
          <Link to="/logs" className="text-sm font-bold text-primary hover:text-accent-purple transition-all px-4 py-2 bg-primary/5 rounded-xl border border-primary/10">View Audit Logs</Link>
        </div>
        <div className="glass rounded-[32px] overflow-hidden">
          <ul className="divide-y divide-outline-variant">
            {activities.map((activity: any) => (
              <li key={activity.id} className="p-6 flex items-center justify-between hover:bg-surface-container/50 transition-colors group cursor-default">
                <div className="flex items-center gap-5">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-300 shadow-lg",
                    activity.type === 'error' ? 'bg-error/20 text-error' : 'bg-primary/20 text-primary'
                  )}>
                    {activity.type === 'success' ? <UserCog className="w-6 h-6" /> : <Laptop className="w-6 h-6" />}
                  </div>
                  <div>
                    <p className="text-base font-bold text-on-surface">{activity.action}</p>
                    <p className="text-xs font-medium text-on-surface-variant opacity-60">{activity.user} • {activity.time}</p>
                  </div>
                </div>
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl shadow-sm",
                  activity.type === 'error' ? 'text-error bg-error/10 border border-error/20' : 'text-secondary bg-secondary/10 border border-secondary/20'
                )}>
                  {activity.type === 'error' ? 'Failed' : 'Success'}
                </span>
              </li>
            ))}

          </ul>
        </div>
      </motion.section>

       {/* System Alerts */}
       <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-error/10 rounded-[32px] p-8 border border-error/20 flex items-start gap-6 relative overflow-hidden group hover:bg-error/[0.15] transition-colors"
        >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
           <ShieldCheck className="w-24 h-24 text-error" />
        </div>
        <div className="bg-error text-on-error p-3 rounded-2xl shadow-xl shadow-error/20 relative z-10">
           <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="relative z-10">
          <h4 className="text-lg font-bold text-error mb-2">Security Advisory</h4>
          <p className="text-sm font-medium text-on-surface-variant opacity-80 leading-relaxed max-w-2xl">
            Database load is unusually high (88%). We recommend initiating a secondary node synchronization within the next 48 hours to maintain sub-100ms latency across the EU-West region.
          </p>
        </div>
      </motion.section>
    </div>
  );
}

