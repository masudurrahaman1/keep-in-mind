import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { FileText, Sparkles, Shield, Zap, Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { loginWithGoogle, loginWithEmail, registerWithEmail, verifyEmailOTP } from '../services/authService';

const features = [
  { icon: Zap,    label: 'Lightning Fast',  desc: 'Capture thoughts instantly' },
  { icon: Shield, label: 'Private & Secure', desc: 'Your notes, only yours'    },
  { icon: Lock,   label: 'Encrypted Sync',   desc: 'Safe across all devices'   },
];

const API_BASE = import.meta.env.VITE_API_URL || '/api';

type AuthMode = 'login' | 'register' | 'verify' | 'google-2fa';

export default function Auth() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { login }  = useAuth();
  
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [errorCode, setErrorCode] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');

  // 2FA state for Google login
  const [tfState, setTfState] = useState<{
    pendingToken: string;
    userName: string;
    googleToken: string;
  } | null>(null);

  const from = location.state?.from?.pathname || '/notes';

  // ── Handlers ───────────────────────────────────────────────

  const handleGoogleSign = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setErrorCode('');
    try {
      const result          = await signInWithPopup(auth, googleProvider);
      const credential      = GoogleAuthProvider.credentialFromResult(result);
      const googleAccessToken = credential?.accessToken;
      if (!googleAccessToken) throw new Error('Failed to obtain Google access token.');

      const idToken = await result.user.getIdToken();
      const data    = await loginWithGoogle(idToken);

      if (data.twoFactorRequired) {
        setTfState({
          pendingToken: data.pendingToken,
          userName:     data.user?.name?.split(' ')[0] || 'there',
          googleToken:  googleAccessToken,
        });
        setAuthMode('google-2fa');
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

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    
    if (authMode === 'register' && (!name || !email || password.length < 6)) {
      setErrorCode('Please fill all fields. Password must be 6+ chars.');
      return;
    }
    if (authMode === 'login' && (!email || !password)) {
      setErrorCode('Please provide your email and password.');
      return;
    }

    setIsLoading(true);
    setErrorCode('');

    try {
      if (authMode === 'register') {
        await registerWithEmail(name, email, password);
        setAuthMode('verify');
      } else {
        const data = await loginWithEmail(email, password);
        if (data.twoFactorRequired) {
          setTfState({
            pendingToken: data.pendingToken,
            userName:     data.user?.name?.split(' ')[0] || 'there',
            googleToken:  '',
          });
          setAuthMode('google-2fa');
          return;
        }
        login(data.user, data.token);
        localStorage.setItem('keep-in-mind-auto-sync', 'true');
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      if (err.unverified) {
        setAuthMode('verify');
        setErrorCode(err.message);
      } else {
        setErrorCode(err.message || 'Authentication failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (otpCode.length < 6) { setErrorCode('Enter the full 6-digit code.'); return; }
    setIsLoading(true);
    setErrorCode('');
    try {
      const data = await verifyEmailOTP(email, otpCode);
      login(data.user, data.token);
      localStorage.setItem('keep-in-mind-auto-sync', 'true');
      navigate(from, { replace: true });
    } catch (err: any) {
      setErrorCode(err.message || 'Verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (otpCode.length < 6) { setErrorCode('Enter the full 6-digit code.'); return; }
    setIsLoading(true);
    setErrorCode('');
    try {
      const res  = await fetch(`${API_BASE}/auth/2fa/login-verify`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ pendingToken: tfState!.pendingToken, code: otpCode }),
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

  // ── JSX ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-surface bg-mesh flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] bg-secondary/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-tertiary/10 rounded-full blur-[80px] pointer-events-none" />

      <AnimatePresence mode="wait">

        {/* ── 2FA & Email Verification Screen ── */}
        {(authMode === 'verify' || authMode === 'google-2fa') ? (
          <motion.div
            key="verify"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{    opacity: 0, scale: 0.95, y: 20  }}
            className="w-full max-w-sm relative z-10"
          >
            <div className="glass-panel rounded-[2.5rem] p-8 md:p-10 text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                {authMode === 'verify' ? <Mail size={36} className="text-primary" /> : <Shield size={36} className="text-primary"/>}
              </div>

              <h2 className="text-2xl font-heading font-extrabold text-on-surface mb-1">
                {authMode === 'google-2fa' ? 'Two-Step Verification' : 'Verify your email'}
              </h2>
              <p className="text-sm text-on-surface-variant mb-2">
                {authMode === 'google-2fa' 
                  ? `Welcome back, ${tfState?.userName}!` 
                  : `We sent a code to ${email}`
                }
              </p>
              <p className="text-sm text-on-surface-variant mb-8">
                {authMode === 'google-2fa' 
                  ? 'Enter the 6-digit code from your authenticator app to continue.'
                  : 'Enter the 6-digit verification code below.'
                }
              </p>

              <input
                type="number"
                inputMode="numeric"
                value={otpCode}
                onChange={e => { setOtpCode(e.target.value.slice(0, 6)); setErrorCode(''); }}
                placeholder="000000"
                className="w-full text-center text-4xl font-mono font-bold tracking-[0.4em] py-5 rounded-2xl border-2 border-outline-variant/30 bg-surface-container focus:border-primary focus:outline-none transition-colors text-on-surface mb-3"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && (authMode === 'verify' ? handleVerifyEmail() : handleVerify2FA())}
              />

              {errorCode && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-sm mb-3">
                  {errorCode}
                </motion.p>
              )}

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={authMode === 'verify' ? handleVerifyEmail : handleVerify2FA}
                disabled={isLoading || otpCode.length < 6}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-base shadow-lg shadow-primary/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mb-6 min-h-[44px]"
              >
                {isLoading ? 'Verifying…' : (authMode === 'verify' ? 'Confirm Email' : 'Verify')}
              </motion.button>

              <button
                onClick={() => { setAuthMode('login'); setOtpCode(''); setErrorCode(''); }}
                className="text-sm text-on-surface-variant hover:text-primary transition-colors min-h-[44px] flex items-center justify-center mx-auto"
              >
                ← Back to Login
              </button>
            </div>
          </motion.div>
        ) : (

          /* ── Main Login / Register Card ── */
          <motion.div
            key="login-reg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{    opacity: 0 }}
            className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10"
          >
            {/* Left: Branding */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0  }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="hidden lg:flex flex-col"
            >
              <div className="flex items-center gap-3 mb-12">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
                  <FileText size={24} />
                </div>
                <span className="text-2xl font-heading font-extrabold text-on-surface tracking-tight">Keep In Mind</span>
              </div>

              <h1 className="text-5xl xl:text-6xl font-heading font-extrabold text-on-surface leading-tight tracking-tight mb-6">
                Think it.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-tertiary">Write it.</span><br />
                Keep it.
              </h1>
              <p className="text-on-surface-variant text-lg mb-12 leading-relaxed max-w-sm">
                A premium notes experience crafted for clarity. Sign in to sync your thoughts across every device.
              </p>
              <div className="space-y-4">
                {features.map(({ icon: Icon, label, desc }, i) => (
                  <motion.div key={label} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0  }} transition={{ delay: 0.2 + i * 0.1 }} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0"><Icon size={20} /></div>
                    <div>
                      <p className="font-bold text-on-surface text-sm">{label}</p>
                      <p className="text-on-surface-variant text-xs">{desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right: Auth Card */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0,  scale: 1    }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
            >
              <div className="glass-panel rounded-[2.5rem] p-6 sm:p-8 md:p-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

                {/* Mobile logo */}
                <div className="flex items-center justify-center gap-2 mb-6 lg:hidden">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary text-white rounded-xl flex items-center justify-center shadow-lg"><FileText size={16} /></div>
                  <span className="text-xl font-heading font-extrabold text-on-surface">Keep In Mind</span>
                </div>

                {/* Heading */}
                <div className="mb-8 relative z-10 text-center lg:text-left">
                  <h2 className="text-3xl sm:text-4xl font-heading font-black text-on-surface tracking-tight mb-3">
                    Sign In
                  </h2>
                  <p className="text-on-surface-variant text-base font-medium">
                    Please use your Google account to access your workspace.
                  </p>
                </div>

                {errorCode && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl">
                    {errorCode}
                  </div>
                )}

                {/* Google Button */}
                <div className="relative z-10 mt-8">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleGoogleSign}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-4 px-6 py-5 bg-white dark:bg-on-surface/[0.05] text-gray-800 dark:text-on-surface font-black rounded-[2rem] shadow-xl shadow-primary/10 border border-on-surface/10 transition-all disabled:opacity-60 group min-h-[56px]"
                  >
                    <svg viewBox="0 0 24 24" className="w-6 h-6 shrink-0">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-lg">Continue with Google</span>
                  </motion.button>
                </div>

                {/* Google Button */}
                <div className="relative z-10">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleGoogleSign}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white dark:bg-on-surface/[0.05] text-gray-800 dark:text-on-surface font-bold rounded-2xl shadow-sm border border-on-surface/10 transition-all disabled:opacity-60 group min-h-[44px]"
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-base">Google</span>
                  </motion.button>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
