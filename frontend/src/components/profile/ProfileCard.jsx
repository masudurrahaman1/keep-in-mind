import React from 'react';
import { Mail, Phone, Edit2, MapPin } from 'lucide-react';
import { Button } from '../settings/SettingsUI';

export default function ProfileCard({ profile, onEditClick }) {
  return (
    <div className="glass-panel shrink-0 p-6 sm:p-10 rounded-[2.5rem] flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-10 relative overflow-hidden z-10 mb-8 mt-2">
      
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3"></div>

      <div className="w-28 h-28 sm:w-32 sm:h-32 shrink-0 rounded-full overflow-hidden border-4 border-surface shadow-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-4xl font-bold text-white relative group z-10">
        {profile.avatar ? (
          <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          profile.name.substring(0, 2).toUpperCase()
        )}
      </div>

      <div className="flex-1 text-center sm:text-left flex flex-col items-center sm:items-start z-10">
        <h2 className="text-3xl font-heading font-extrabold text-on-surface tracking-tight mb-1">{profile.name}</h2>
        <p className="text-on-surface-variant font-medium mb-4">{profile.bio || 'Keep in Mind enthusiast and daily organizer.'}</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 w-full max-w-lg mb-6">
          <div className="flex items-center justify-center sm:justify-start gap-3 text-sm text-on-surface">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
               <Mail size={14} />
            </div>
            <span className="truncate">{profile.email}</span>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-3 text-sm text-on-surface">
            <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
               <Phone size={14} />
            </div>
            <span>{profile.phone || 'Add phone number'}</span>
          </div>
        </div>

        <Button variant="secondary" icon={Edit2} onClick={onEditClick}>
          Edit Profile
        </Button>
      </div>
    </div>
  );
}
