import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Lock } from 'lucide-react';

export default function Locker() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface flex flex-col pb-24 md:pb-6 relative animate-in fade-in duration-500">
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 md:px-6 md:py-4 backdrop-blur-xl bg-surface/50 border-b border-on-surface/5">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-on-surface/5 rounded-full transition-all text-on-surface/60 hover:text-on-surface"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1 text-center">
          <h1 className="text-lg font-bold text-on-surface">Locker</h1>
        </div>
        <div className="w-10"></div> {/* Spacer for alignment */}
      </header>

      {/* ── Content ── */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <Lock size={48} className="text-primary" />
        </div>
        <h2 className="text-2xl font-black text-on-surface mb-2">Secure Locker</h2>
        <p className="text-on-surface/60 max-w-md">
          This area is locked. You can store your sensitive notes and files here safely.
        </p>
      </main>
    </div>
  );
}
