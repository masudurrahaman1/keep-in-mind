import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { FileText, Zap, Shield, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { loginWithGoogle } from '../services/authService';

const features = [
  { icon: Zap, label: 'Lightning Fast', desc: 'Capture thoughts instantly' },
  { icon: Shield, label: 'Private & Secure', desc: 'Your notes, only yours' },
];

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorCode, setErrorCode] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [is2FAMode, setIs2FAMode] = useState(false);

  const [tfState, setTfState] = useState<{
    pendingToken: string;
    userName: string;
    googleToken: string;
  } | null>(null);

  const from = location.state?.from?.pathname || '/notes';

  const handleGoogleSign = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setErrorCode('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const googleAccessToken = credential?.accessToken;
      if (!googleAccessToken) throw new Error('Failed to obtain Google access token.');

      const idToken = await result.user.getIdToken();
      const data = await loginWithGoogle(idToken);

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
      setErrorCode(err.message || 'Google sign-in failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (otpCode.length < 6) { setErrorCode('Enter the full 6-digit code.'); return; }
    setIsLoading(true);
    setErrorCode('');
    try {
      const res = await fetch(`${API_BASE}/auth/2fa/login-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pendingToken: tfState!.pendingToken, code: otpCode }),
      });
      const data = await res.json();
      if (!res.ok) { setErrorCode(data.message); return; }

      login(data.user, data.token, tfState!.googleToken || '');
      navigate(from, { replace: true });
    } catch {
      setErrorCode('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-surface bg-mesh flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
      {/* Background Ambient Orbs - Pulsing */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-5%] left-[-2%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[100px] pointer-events-none" 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.1, 0.15, 0.1]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[-5%] right-[-2%] w-[45%] h-[45%] bg-secondary/20 rounded-full blur-[120px] pointer-events-none" 
      />

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-2xl flex flex-col items-center gap-10 relative z-10 text-center"
      >
        
        {/* Top: Branding Tagline */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 12, delay: 0.2 }}
            className="w-14 h-14 bg-gradient-to-br from-primary to-secondary text-white rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20 mb-6"
          >
            <FileText size={28} strokeWidth={2.5} />
          </motion.div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-on-surface leading-tight tracking-tighter mb-4">
            Think it. <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-tertiary to-secondary">Write it.</span> Keep it.
          </h1>
          <p className="text-on-surface-variant text-base font-semibold opacity-60 max-w-md">
            The most elegant way to capture your thoughts securely and sync them across all devices.
          </p>
        </motion.div>

        {/* Middle: Sign-In Card */}
        <motion.div 
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
          className="w-full max-w-[420px]"
        >
          <div className="bg-white/70 dark:bg-on-surface/[0.04] backdrop-blur-2xl rounded-[3rem] p-10 md:p-14 border border-white/40 shadow-2xl shadow-primary/10 text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent group-hover:via-primary transition-all duration-700" />
            
            <AnimatePresence mode="wait">
              {!is2FAMode ? (
                <motion.div key="login" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="text-3xl font-black text-on-surface tracking-tighter mb-3">Sign In</h2>
                  <p className="text-on-surface-variant text-sm font-semibold opacity-60 mb-10 leading-relaxed">
                    Access your workspace securely with Google.
                  </p>

                  {errorCode && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: 'auto' }} 
                      className="mb-8 p-4 bg-error/10 border border-error/20 text-error text-xs font-bold rounded-2xl text-left flex items-center gap-3"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-error" />
                      {errorCode}
                    </motion.div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGoogleSign}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-4 px-8 py-5 bg-white dark:bg-on-surface/10 text-on-surface font-black rounded-2xl shadow-lg border border-outline-variant/30 hover:shadow-xl hover:border-primary/50 transition-all duration-300 disabled:opacity-50 min-h-[64px]"
                  >
                    <svg viewBox="0 0 24 24" className="w-6 h-6 shrink-0">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-lg">Continue with Google</span>
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div key="2fa" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <motion.div 
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8"
                  >
                    <ShieldCheck size={44} className="text-primary" />
                  </motion.div>
                  <h2 className="text-3xl font-black text-on-surface mb-3">Verify Access</h2>
                  <input
                    type="number"
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value.slice(0, 6))}
                    placeholder="000000"
                    className="w-full text-center text-4xl font-mono font-bold py-5 rounded-3xl border-2 border-outline-variant/30 bg-surface-container-low focus:border-primary outline-none transition-all text-on-surface mb-8"
                    autoFocus
                  />
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleVerify2FA} disabled={isLoading || otpCode.length < 6} className="w-full py-5 rounded-[2.2rem] bg-gradient-to-r from-primary to-secondary text-white font-black text-lg shadow-xl shadow-primary/20 transition-all disabled:opacity-50">Verify & Continue</motion.button>
                  <button onClick={() => { setIs2FAMode(false); setOtpCode(''); }} className="text-sm font-bold text-on-surface-variant hover:text-primary mt-8 transition-colors">← Back to Sign In</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Bottom: Features Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="flex flex-wrap items-center justify-center gap-10 md:gap-16"
        >
          {features.map(({ icon: Icon, label }, i) => (
            <motion.div 
              key={label} 
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
              className="flex items-center gap-3 opacity-50 hover:opacity-100 transition-opacity cursor-default group"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <Icon size={20} strokeWidth={2.5} />
              </div>
              <span className="text-base font-black text-on-surface tracking-tight">{label}</span>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </div>
  );
}
