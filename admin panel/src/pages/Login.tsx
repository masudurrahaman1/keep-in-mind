import { ArrowRight, ShieldCheck, Mail, Lock, Eye, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useState } from "react";
import { adminService } from "../lib/api";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-surface text-on-surface relative overflow-hidden font-sans">
      {/* Decorative Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-purple/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-[440px] glass p-10 rounded-[32px] shadow-2xl relative z-10"
      >
        <Link 
          to="https://keepinmind.in" 
          className="inline-flex items-center gap-2 text-xs font-bold text-on-surface-variant hover:text-primary transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Website
        </Link>

        <header className="flex flex-col items-center text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 bg-primary text-on-primary rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-primary/30"
          >
            <ShieldCheck className="w-10 h-10" />
          </motion.div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text mb-2">Admin Portal</h1>
          <p className="text-sm font-medium text-on-surface-variant opacity-70">
            Securely authenticate to access control center
          </p>
        </header>

        <form
          className="flex flex-col gap-6"
          onSubmit={async (e) => {
            e.preventDefault();
            setIsLoading(true);
            setError("");
            try {
              const data = await adminService.login({ email, password });
              localStorage.setItem("admin_token", data.token);
              navigate("/");
            } catch (err: any) {
              setError(err.message || "Invalid credentials. Only authorized administrators can access this portal.");
            } finally {
              setIsLoading(false);
            }
          }}
        >
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-error/10 border border-error/20 text-error text-[11px] font-bold py-3 px-4 rounded-xl text-center"
            >
              {error}
            </motion.div>
          )}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] px-1" htmlFor="email">
              Identity
            </label>
            <div className="relative flex items-center bg-surface-container/50 border border-outline-variant rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary transition-all duration-300">
              <Mail className="w-5 h-5 text-on-surface-variant absolute left-5 opacity-50" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-none text-base font-medium text-on-surface placeholder:text-on-surface-variant/30 px-6 pl-14 py-4 focus:outline-none"
                placeholder="Enter your identity"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]" htmlFor="password">
                Secret Key
              </label>
              <a href="#" className="text-xs font-bold text-primary hover:text-accent-purple transition-colors">
                Recover?
              </a>
            </div>
            <div className="relative flex items-center bg-surface-container/50 border border-outline-variant rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary transition-all duration-300">
              <Lock className="w-5 h-5 text-on-surface-variant absolute left-5 opacity-50" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-none text-base font-medium text-on-surface placeholder:text-on-surface-variant/30 px-6 pl-14 py-4 focus:outline-none"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 text-on-surface-variant hover:text-on-surface transition-colors opacity-50 hover:opacity-100"
              >
                <Eye className="w-5 h-5" />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-6 bg-primary text-on-primary font-bold text-base rounded-2xl py-4 w-full flex items-center justify-center gap-3 hover:opacity-90 active:scale-[0.98] transition-all shadow-xl shadow-primary/20 group disabled:opacity-50"
          >
            {isLoading ? "Verifying..." : "Authorize Session"}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <footer className="mt-10 pt-8 border-t border-outline-variant/30 flex justify-center gap-8">
          <Link to="/support" className="text-xs font-bold text-on-surface-variant hover:text-primary transition-colors uppercase tracking-widest opacity-60">
            Support
          </Link>
          <Link to="/terms" className="text-xs font-bold text-on-surface-variant hover:text-primary transition-colors uppercase tracking-widest opacity-60">
            Policy
          </Link>
        </footer>
      </motion.div>
      
      <p className="mt-8 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.3em] opacity-40">
        © 2026 Keep In Mind Ecosystem
      </p>
    </div>
  );
}

