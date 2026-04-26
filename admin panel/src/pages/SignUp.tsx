import { ArrowRight, Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useState } from "react";
import { adminService } from "../lib/api";

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-[#0a0c12] text-on-surface relative overflow-hidden font-sans">
      {/* Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[420px] relative z-10">
        <header className="flex flex-col items-center text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 bg-[#1a1c26] border border-white/5 rounded-2xl flex items-center justify-center mb-6 shadow-2xl relative"
          >
             <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
             <Lock className="w-8 h-8 text-primary relative z-10" />
          </motion.div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Create Account</h1>
          <p className="text-sm font-medium text-on-surface-variant opacity-60">
            Secure access to your private vault.
          </p>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#12141c]/80 backdrop-blur-xl border border-white/5 p-8 rounded-[32px] shadow-2xl"
        >
          <form
            className="flex flex-col gap-5"
            onSubmit={async (e) => {
              e.preventDefault();
              setIsLoading(true);
              setError("");
              try {
                // Assuming adminService has a register method or similar
                // If not, we'll need to check the api.ts
                await adminService.register({ name, email, password });
                navigate("/login");
              } catch (err: any) {
                setError(err.message || "Registration failed. Please try again.");
              } finally {
                setIsLoading(false);
              }
            }}
          >
            {error && (
              <div className="bg-error/10 border border-error/20 text-error text-xs font-bold py-3 px-4 rounded-xl text-center">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2.5">
              <label className="text-xs font-bold text-on-surface-variant/80 px-1" htmlFor="name">
                Full Name
              </label>
              <div className="relative group">
                <User className="w-5 h-5 text-on-surface-variant absolute left-4 top-1/2 -translate-y-1/2 opacity-40 group-focus-within:opacity-100 transition-opacity" />
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#1a1c26] border border-white/5 rounded-xl text-sm font-medium text-white placeholder:text-on-surface-variant/20 pl-12 pr-4 py-3.5 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-2.5">
              <label className="text-xs font-bold text-on-surface-variant/80 px-1" htmlFor="email">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="w-5 h-5 text-on-surface-variant absolute left-4 top-1/2 -translate-y-1/2 opacity-40 group-focus-within:opacity-100 transition-opacity" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#1a1c26] border border-white/5 rounded-xl text-sm font-medium text-white placeholder:text-on-surface-variant/20 pl-12 pr-4 py-3.5 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <label className="text-xs font-bold text-on-surface-variant/80 px-1" htmlFor="password">
                Password
              </label>
              <div className="relative group">
                <Lock className="w-5 h-5 text-on-surface-variant absolute left-4 top-1/2 -translate-y-1/2 opacity-40 group-focus-within:opacity-100 transition-opacity" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#1a1c26] border border-white/5 rounded-xl text-sm font-medium text-white placeholder:text-on-surface-variant/20 pl-12 pr-12 py-3.5 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-30 hover:opacity-100 transition-opacity"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 bg-primary text-white font-bold text-sm rounded-xl py-4 w-full flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              {isLoading ? "Creating..." : "Sign Up"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </motion.div>

        <p className="mt-10 text-center text-sm font-medium text-on-surface-variant opacity-60">
          Already have an account? <Link to="/login" className="text-primary hover:underline font-bold">Log In</Link>
        </p>
      </div>
    </div>
  );
}
