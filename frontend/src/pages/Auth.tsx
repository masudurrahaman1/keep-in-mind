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
      localStorage.setItem('keep-in-mind-auto-sync', 'true');
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
      localStorage.setItem('keep-in-mind-auto-sync', 'true');
      navigate(from, { replace: true });
    } catch {
      setErrorCode('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-surface bg-mesh flex flex-col relative overflow-x-hidden overflow-y-auto lg:overflow-hidden">
      {/* Background Ambient Orbs - Subtle */}
      <div className="absolute top-[-5%] left-[-2%] w-[35%] h-[35%] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-5%] right-[-2%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Left Branding - Fixed Position */}
      <div className="absolute top-10 left-10 flex items-center gap-4 z-50">
        <div className="w-11 h-11 bg-gradient-to-br from-primary to-secondary text-white rounded-xl flex items-center justify-center shadow-lg">
          <FileText size={22} strokeWidth={2.5} />
        </div>
        <span className="text-2xl font-heading font-black text-on-surface tracking-tighter">Keep In Mind</span>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-20 w-full max-w-[1200px] mx-auto p-6 pt-32 lg:pt-0 relative z-10">
        
        {/* Left Hero Section */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left"
        >
          <h1 className="text-4xl md:text-5xl xl:text-6xl font-heading font-black text-on-surface leading-[1.15] tracking-tighter mb-6">
            Think it.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Write it.</span><br />
            Keep it.
          </h1>
          
          <p className="text-on-surface-variant text-lg md:text-xl mb-10 leading-relaxed font-medium opacity-80 max-w-md">
            The most elegant way to capture your thoughts and sync them across all your devices securely.
          </p>

          <div className="grid grid-cols-1 gap-5 w-full max-w-sm">
            {features.map(({ icon: Icon, label, desc }, i) => (
              <motion.div 
                key={label} 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: 0.4 + i * 0.1 }} 
                className="flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-2xl bg-primary/5 text-primary flex items-center justify-center shrink-0 border border-primary/10">
                  <Icon size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="font-black text-on-surface text-base tracking-tight">{label}</p>
                  <p className="text-on-surface-variant text-sm font-medium opacity-70">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Auth Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-[460px] flex shrink-0"
        >
          <div className="w-full bg-white/60 dark:bg-on-surface/[0.03] backdrop-blur-xl rounded-[3rem] p-10 md:p-12 border border-white/30 shadow-xl text-center">
            <AnimatePresence mode="wait">
              {!is2FAMode ? (
                <motion.div 
                  key="login"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="mb-10">
                    <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <FileText size={28} className="text-primary" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-heading font-black text-on-surface tracking-tighter mb-4">
                      Sign In
                    </h2>
                    <p className="text-on-surface-variant text-sm font-semibold opacity-70 leading-relaxed">
                      Access your Keep in Mind workspace with your Google account.
                    </p>
                  </div>

                  {errorCode && (
                    <div className="mb-8 p-4 bg-error/10 border border-error/20 text-error text-xs font-bold rounded-2xl text-left flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-error" />
                      {errorCode}
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleGoogleSign}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white dark:bg-on-surface/10 text-on-surface font-black rounded-2xl shadow-lg border border-outline-variant/30 hover:bg-gray-50 dark:hover:bg-on-surface/20 transition-all duration-300 disabled:opacity-50 min-h-[60px]"
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="whitespace-nowrap">Continue with Google</span>
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div 
                  key="2fa"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
                    <ShieldCheck size={44} className="text-primary" />
                  </div>
                  <h2 className="text-3xl font-black text-on-surface mb-3 tracking-tight">Verify Identity</h2>
                  <p className="text-sm text-on-surface-variant font-medium mb-10 opacity-70">
                    Enter the verification code from your authenticator app.
                  </p>

                  <input
                    type="number"
                    value={otpCode}
                    onChange={e => { setOtpCode(e.target.value.slice(0, 6)); setErrorCode(''); }}
                    placeholder="000000"
                    className="w-full text-center text-4xl font-mono font-bold py-5 rounded-3xl border-2 border-outline-variant/30 bg-surface-container-low focus:border-primary outline-none transition-all text-on-surface mb-8"
                    autoFocus
                  />

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleVerify2FA}
                    disabled={isLoading || otpCode.length < 6}
                    className="w-full py-5 rounded-[2rem] bg-gradient-to-r from-primary to-secondary text-white font-black text-lg shadow-xl shadow-primary/20 transition-all disabled:opacity-50 mb-8"
                  >
                    {isLoading ? 'Verifying…' : 'Verify & Continue'}
                  </motion.button>

                  <button
                    onClick={() => { setIs2FAMode(false); setOtpCode(''); setErrorCode(''); }}
                    className="text-sm font-bold text-on-surface-variant hover:text-primary transition-colors"
                  >
                    ← Back
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
