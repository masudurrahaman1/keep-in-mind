import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, updateProfile } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, User, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { loginWithFirebaseToken } from '../services/authService';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [otpCode, setOtpCode] = useState('');
  const [is2FAMode, setIs2FAMode] = useState(false);

  const [tfState, setTfState] = useState<{
    pendingToken: string;
    userName: string;
    googleToken: string;
  } | null>(null);

  const from = location.state?.from?.pathname || '/notes';

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      if (mode === 'login') {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        if (!userCredential.user.emailVerified) {
          // If not verified, throw an error to the catch block
          throw { unverified: true, message: 'Please verify your email address by clicking the link sent to your inbox.' };
        }

        const idToken = await userCredential.user.getIdToken();
        const data = await loginWithFirebaseToken(idToken);
        
        if (data.twoFactorRequired) {
          setTfState({
            pendingToken: data.pendingToken,
            userName: data.user?.name?.split(' ')[0] || 'there',
            googleToken: '',
          });
          setIs2FAMode(true);
          return;
        }
        
        login(data.user, data.token, '');
        navigate(from, { replace: true });
      } else {
        // Sign Up Mode
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Update user profile with their name
        await updateProfile(userCredential.user, { displayName: name });
        
        // Send Firebase verification link
        await sendEmailVerification(userCredential.user);
        
        setMode('login');
        setError('Account created! Please check your email for the verification link before logging in.');
        
        // Log out the unverified user immediately so they must verify and log in again
        await auth.signOut();
      }
    } catch (err: any) {
      if (err.unverified) {
        setError(err.message);
      } else if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password.');
      } else {
        setError(err.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSign = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const googleAccessToken = credential?.accessToken;
      if (!googleAccessToken) throw new Error('Failed to obtain Google access token.');

      const idToken = await result.user.getIdToken();
      const data = await loginWithFirebaseToken(idToken);

      if (data.twoFactorRequired) {
        setTfState({
          pendingToken: data.pendingToken,
          userName: data.user?.name?.split(' ')[0] || 'there',
          googleToken: googleAccessToken,
        });
        setIs2FAMode(true);
        return;
      }

      login(data.user, data.token, googleAccessToken);
      navigate(from, { replace: true });
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user') return;
      setError(err.message || 'Google sign-in failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      // Import sendPasswordResetEmail from firebase/auth
      const { sendPasswordResetEmail } = await import('firebase/auth');
      await sendPasswordResetEmail(auth, email);
      setError('Password reset link sent! Check your inbox.');
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email.');
      } else {
        setError(err.message || 'Failed to send password reset email.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (otpCode.length < 6) { setError('Enter the full 6-digit code.'); return; }
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/auth/2fa/login-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pendingToken: tfState!.pendingToken, code: otpCode }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }

      login(data.user, data.token, tfState!.googleToken || '');
      navigate(from, { replace: true });
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-[#0a0c12] text-white relative overflow-hidden font-sans">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#5142E6]/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[420px] relative z-10">
        
        {/* Animated Brand Logo */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center justify-center gap-4 mb-8"
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="w-16 h-16 bg-[#5142E6]/10 rounded-2xl flex items-center justify-center border border-[#5142E6]/20 relative shadow-[0_0_30px_rgba(81,66,230,0.2)]"
          >
             <div className="absolute inset-0 bg-[#5142E6]/20 blur-md rounded-2xl" />
             <ShieldCheck className="w-8 h-8 text-[#5142E6] relative z-10" />
          </motion.div>
          <h1 className="text-3xl font-bold tracking-tight text-white text-center">
            {is2FAMode ? 'Verify Identity' : 'Keep In Mind'}
          </h1>
          <p className="text-sm font-medium text-white/60 text-center">
             {is2FAMode 
                ? `Enter the code to verify it's you, ${tfState?.userName}.` 
                : 'The most elegant way to capture your thoughts.'}
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#12141c]/80 backdrop-blur-xl border border-white/5 p-8 rounded-[32px] shadow-2xl relative"
        >
          <AnimatePresence mode="wait">
            {is2FAMode ? (
              <motion.div key="otp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-6">
                {error && (
                  <div className={`border text-xs font-bold py-3 px-4 rounded-xl text-center ${error.includes('sent') ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                    {error}
                  </div>
                )}
                <input
                  type="number"
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value.slice(0, 6))}
                  placeholder="000000"
                  className="w-full text-center tracking-[0.5em] text-3xl font-mono font-bold py-4 rounded-2xl border border-white/10 bg-[#1a1c26] focus:border-[#5142E6] outline-none transition-all text-white"
                  autoFocus
                />
                <button 
                  onClick={handleVerify2FA} 
                  disabled={isLoading || otpCode.length < 6} 
                  className="w-full py-4 rounded-xl bg-[#5142E6] text-white font-bold transition-all disabled:opacity-50 hover:bg-[#5142E6]/90 shadow-lg shadow-[#5142E6]/20 flex items-center justify-center gap-2"
                >
                  {isLoading ? 'Verifying...' : 'Confirm'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            ) : (
              <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* Mode Toggle */}
                <div className="flex bg-[#1a1c26] rounded-xl p-1 mb-8 border border-white/5 relative">
                   <motion.div 
                      className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#5142E6] rounded-lg shadow-md"
                      animate={{ left: mode === "login" ? "4px" : "calc(50%)" }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                   />
                   <button
                      type="button"
                      onClick={() => { setMode("login"); setError(""); }}
                      className={`flex-1 py-2 text-sm font-bold rounded-lg relative z-10 transition-colors ${mode === "login" ? "text-white" : "text-white/60 hover:text-white"}`}
                   >
                      Sign In
                   </button>
                   <button
                      type="button"
                      onClick={() => { setMode("signup"); setError(""); }}
                      className={`flex-1 py-2 text-sm font-bold rounded-lg relative z-10 transition-colors ${mode === "signup" ? "text-white" : "text-white/60 hover:text-white"}`}
                   >
                      Sign Up
                   </button>
                </div>

                <form className="flex flex-col gap-5" onSubmit={handleEmailAuth}>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className={`border text-xs font-bold py-3 px-4 rounded-xl text-center overflow-hidden ${error.includes("Account created") ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}
                    >
                      {error}
                    </motion.div>
                  )}
                  
                  <AnimatePresence mode="popLayout">
                    {mode === "signup" && (
                      <motion.div 
                        initial={{ opacity: 0, x: -20, height: 0 }}
                        animate={{ opacity: 1, x: 0, height: 'auto' }}
                        exit={{ opacity: 0, x: -20, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col gap-2.5 overflow-hidden"
                      >
                        <label className="text-xs font-bold text-white/80 px-1" htmlFor="name">
                          Full Name
                        </label>
                        <div className="relative group">
                          <User className="w-5 h-5 text-white/40 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-white/80 transition-colors" />
                          <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-[#1a1c26] border border-white/5 rounded-xl text-sm font-medium text-white placeholder:text-white/20 pl-12 pr-4 py-3.5 focus:outline-none focus:border-[#5142E6] transition-all"
                            placeholder="John Doe"
                            required={mode === "signup"}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex flex-col gap-2.5">
                    <label className="text-xs font-bold text-white/80 px-1" htmlFor="email">
                      Email Address
                    </label>
                    <div className="relative group">
                      <Mail className="w-5 h-5 text-white/40 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-white/80 transition-colors" />
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#1a1c26] border border-white/5 rounded-xl text-sm font-medium text-white placeholder:text-white/20 pl-12 pr-4 py-3.5 focus:outline-none focus:border-[#5142E6] transition-all"
                        placeholder="name@company.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-xs font-bold text-white/80" htmlFor="password">
                        Password
                      </label>
                      {mode === "login" && (
                        <button 
                          type="button" 
                          onClick={handleForgotPassword}
                          className="text-xs font-bold text-[#5142E6] hover:text-[#5142E6]/80 transition-colors"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <div className="relative group">
                      <Lock className="w-5 h-5 text-white/40 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-white/80 transition-colors" />
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-[#1a1c26] border border-white/5 rounded-xl text-sm font-medium text-white placeholder:text-white/20 pl-12 pr-12 py-3.5 focus:outline-none focus:border-[#5142E6] transition-all"
                        placeholder="••••••••"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="mt-2 bg-[#5142E6] text-white font-bold text-sm rounded-xl py-4 w-full flex items-center justify-center gap-2 hover:bg-[#5142E6]/90 active:scale-[0.98] transition-all shadow-lg shadow-[#5142E6]/20 disabled:opacity-50"
                  >
                    {isLoading ? "Please wait..." : (mode === "login" ? "Log In" : "Create Account")}
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-4 my-2">
                     <div className="h-[1px] flex-1 bg-white/5" />
                     <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Or continue with</span>
                     <div className="h-[1px] flex-1 bg-white/5" />
                  </div>

                  <button 
                    type="button" 
                    onClick={handleGoogleSign}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-3 py-3.5 rounded-xl border border-white/10 text-sm font-bold text-white hover:bg-white/5 transition-colors bg-[#1a1c26] disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
