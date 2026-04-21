import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, ShieldOff, X, Loader2, Copy, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

interface Props {
  mode: 'setup' | 'disable';
  onClose: () => void;
  onSuccess: (enabled: boolean) => void;
}

export default function TwoFactorModal({ mode, onClose, onSuccess }: Props) {
  const { token } = useAuth();
  const [step, setStep] = useState<'loading' | 'qr' | 'code' | 'done'>('loading');
  const [qrCode, setQrCode] = useState('');
  const [manualKey, setManualKey] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (mode === 'setup') {
      fetchQR();
    } else {
      setStep('code');
    }
  }, []);

  const fetchQR = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/2fa/setup`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setQrCode(data.qrCode);
      setManualKey(data.manualKey);
      setStep('qr');
    } catch (e: any) {
      console.error('Failed to generate QR code', e);
      onClose();
    }
  };

  const handleSubmit = async () => {
    if (code.length < 6) { setError('Enter the full 6-digit code.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const endpoint = mode === 'setup' ? '2fa/verify' : '2fa/disable';
      const res = await fetch(`${API_BASE}/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }

      setStep('done');
      setTimeout(() => {
        onSuccess(data.twoFactorEnabled);
        onClose();
      }, 1500);
    } catch {
      setError('Network error. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyKey = () => {
    navigator.clipboard.writeText(manualKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-sm bg-white dark:bg-surface rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className={`px-6 pt-6 pb-4 ${mode === 'disable' ? 'bg-red-50 dark:bg-error/10' : 'bg-primary/5'}`}>
          <div className="flex items-center justify-between mb-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${mode === 'disable' ? 'bg-red-100 dark:bg-error/20' : 'bg-primary/10'}`}>
              {mode === 'disable'
                ? <ShieldOff size={24} className="text-red-500" />
                : <ShieldCheck size={24} className="text-primary" />
              }
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-on-surface/10 transition-colors">
              <X size={20} className="text-on-surface-variant" />
            </button>
          </div>
          <h2 className="text-xl font-bold text-on-surface">
            {mode === 'setup' ? 'Set Up Two-Factor Auth' : 'Disable Two-Factor Auth'}
          </h2>
          <p className="text-sm text-on-surface-variant mt-1">
            {mode === 'setup'
              ? 'Scan the QR code with Google Authenticator or Authy.'
              : 'Enter your authenticator code to confirm.'}
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <AnimatePresence mode="wait">
            {/* Loading */}
            {step === 'loading' && (
              <motion.div key="loading" className="flex justify-center py-8">
                <Loader2 size={36} className="animate-spin text-primary" />
              </motion.div>
            )}

            {/* QR Code step */}
            {step === 'qr' && (
              <motion.div key="qr" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex justify-center mb-4">
                  <img src={qrCode} alt="2FA QR Code" className="w-48 h-48 rounded-2xl border-4 border-white shadow-lg" />
                </div>

                <p className="text-xs text-center text-on-surface-variant mb-2">Can't scan? Use this key:</p>
                <div className="flex items-center gap-2 bg-surface-container rounded-xl px-3 py-2 mb-4">
                  <code className="flex-1 text-xs text-on-surface font-mono break-all">{manualKey}</code>
                  <button onClick={copyKey} className="p-1 text-primary hover:text-primary/70 transition-colors shrink-0">
                    {copied ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
                  </button>
                </div>

                <button
                  onClick={() => setStep('code')}
                  className="w-full py-3 rounded-2xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-colors"
                >
                  I've scanned it — Continue
                </button>
              </motion.div>
            )}

            {/* Code entry step */}
            {step === 'code' && (
              <motion.div key="code" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p className="text-sm text-on-surface-variant mb-3 text-center">
                  Open your authenticator app and enter the <strong>6-digit code</strong>:
                </p>

                <input
                  type="number"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={e => { setCode(e.target.value.slice(0, 6)); setError(''); }}
                  placeholder="000000"
                  className="w-full text-center text-3xl font-mono font-bold tracking-[0.5em] py-4 rounded-2xl border-2 border-outline-variant/30 bg-surface-container focus:border-primary focus:outline-none transition-colors text-on-surface"
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                />

                {error && (
                  <motion.p
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-red-500 text-xs text-center mt-2"
                  >
                    {error}
                  </motion.p>
                )}

                <div className="flex gap-3 mt-4">
                  {mode === 'setup' && (
                    <button
                      onClick={() => setStep('qr')}
                      className="flex-1 py-3 rounded-2xl border border-outline-variant/40 text-on-surface-variant text-sm font-semibold hover:bg-surface-container transition-colors"
                    >
                      Back
                    </button>
                  )}
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || code.length < 6}
                    className={`flex-1 py-3 rounded-2xl font-bold text-sm text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50 ${mode === 'disable' ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'}`}
                  >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                    {mode === 'setup' ? 'Enable 2FA' : 'Disable 2FA'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Success */}
            {step === 'done' && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center py-6 gap-3"
              >
                <CheckCircle2 size={56} className={mode === 'disable' ? 'text-on-surface-variant' : 'text-green-500'} />
                <p className="font-bold text-on-surface text-lg">
                  {mode === 'setup' ? '2FA Enabled!' : '2FA Disabled'}
                </p>
                <p className="text-sm text-on-surface-variant text-center">
                  {mode === 'setup' ? 'Your account is now extra secure 🔒' : 'Two-factor authentication has been turned off.'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
