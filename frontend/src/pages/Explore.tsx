import { Compass } from 'lucide-react';

export default function Explore() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-on-surface-variant min-h-[400px]">
      <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mb-6">
        <Compass size={40} className="opacity-50" />
      </div>
      <h2 className="text-xl font-medium text-on-surface mb-2">Explore Ideas</h2>
      <p className="max-w-xs text-center text-sm">Discover templates and inspirations for your notes.</p>
    </div>
  );
}
