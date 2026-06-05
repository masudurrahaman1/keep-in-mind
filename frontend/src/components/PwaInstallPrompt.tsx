import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Show the install prompt
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm"
        >
          <div className="bg-white dark:bg-neutral-900 border border-amber-200 dark:border-amber-900/50 shadow-xl rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white">Install KeepInMind</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Install for offline access and better performance.</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleInstallClick}
                className="bg-amber-500 hover:bg-amber-600 text-white p-2 rounded-xl shadow shadow-amber-500/20 active:scale-95 transition-all"
                title="Install App"
              >
                <Download size={18} />
              </button>
              <button
                onClick={() => setShowPrompt(false)}
                className="p-2 rounded-xl text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
