import { Search as SearchIcon, X, User, AlertTriangle, StickyNote, Info } from "lucide-react";
import { useState } from "react";
import { cn } from "../lib/utils";

const TABS = ["All Results", "Users", "Notes", "System Logs"];

export default function Search() {
  const [activeTab, setActiveTab] = useState(TABS[0]);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Search Input Bar (large) */}
      <div className="relative flex items-center bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-secondary transition-all shadow-sm">
        <SearchIcon className="w-6 h-6 text-outline ml-4" />
        <input
          type="text"
          className="w-full bg-transparent border-none focus:ring-0 text-body-lg font-body-lg text-on-surface placeholder-outline-variant px-4 py-4 focus:outline-none"
          placeholder="Global Search..."
          defaultValue="user authentication"
        />
        <button className="mr-4 text-outline hover:text-on-surface">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="flex overflow-x-auto hide-scrollbar border-b border-outline-variant">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-6 py-3 font-button text-button whitespace-nowrap transition-colors border-b-2",
                  activeTab === tab
                    ? "text-primary border-primary"
                    : "text-on-surface-variant border-transparent hover:text-primary hover:bg-surface-container-low"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Results */}
          <div className="bg-surface-container-lowest rounded-lg border border-outline-variant flex flex-col">
            <div className="p-6 border-b border-outline-variant hover:bg-surface-container-low transition-colors cursor-pointer flex gap-4 items-start sm:items-center">
               <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
                 <User className="w-6 h-6 text-on-secondary-container" />
               </div>
               <div className="flex-1">
                 <h4 className="text-h2 font-h2 text-on-surface mb-1">Sarah Jenkins</h4>
                 <p className="text-body-sm font-body-sm text-on-surface-variant">s.jenkins@company.com • Last active: 2 hours ago</p>
               </div>
               <span className="px-2 py-1 rounded bg-surface-container-high text-on-surface text-label-caps font-label-caps">Admin</span>
            </div>

            <div className="p-6 border-b border-outline-variant hover:bg-surface-container-low transition-colors cursor-pointer flex gap-4 items-start sm:items-center">
               <div className="w-12 h-12 rounded-lg bg-error-container flex items-center justify-center shrink-0">
                 <AlertTriangle className="w-6 h-6 text-on-error-container" />
               </div>
               <div className="flex-1">
                 <h4 className="text-h2 font-h2 text-on-surface mb-1">Authentication Failure Spike</h4>
                 <p className="text-body-sm font-body-sm text-on-surface-variant">Service: AuthGateway • 45 failed attempts in 5 minutes</p>
               </div>
               <div className="flex flex-col items-end gap-1">
                 <span className="px-2 py-1 rounded bg-error-container text-on-error-container text-label-caps font-label-caps">CRITICAL</span>
                 <span className="text-body-sm font-body-sm text-outline">Oct 24, 14:32</span>
               </div>
            </div>

            <div className="p-6 border-b border-outline-variant hover:bg-surface-container-low transition-colors cursor-pointer flex gap-4 items-start sm:items-center">
               <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0">
                 <StickyNote className="w-6 h-6 text-on-surface" />
               </div>
               <div className="flex-1">
                 <h4 className="text-h2 font-h2 text-on-surface mb-1">Q3 Security Audit Notes</h4>
                 <p className="text-body-sm font-body-sm text-on-surface-variant truncate">Reviewing the recent user authentication protocols to ensure compliance...</p>
               </div>
               <div className="flex flex-col items-end gap-1">
                  <span className="text-body-sm text-outline">Oct 22, 09:15</span>
               </div>
            </div>

             <div className="p-6 hover:bg-surface-container-low transition-colors cursor-pointer flex gap-4 items-start sm:items-center">
               <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0">
                 <Info className="w-6 h-6 text-on-surface" />
               </div>
               <div className="flex-1">
                 <h4 className="text-h2 font-h2 text-on-surface mb-1">User Role Updated</h4>
                 <p className="text-body-sm font-body-sm text-on-surface-variant">Target: m.davis@company.com • Role changed from 'Editor' to 'Admin'</p>
               </div>
               <div className="flex flex-col items-end gap-1">
                 <span className="px-2 py-1 rounded bg-surface-container-high text-on-surface text-label-caps font-label-caps">INFO</span>
                 <span className="text-body-sm font-body-sm text-outline">Oct 21, 11:04</span>
               </div>
            </div>
          </div>
          
          <div className="flex justify-center pt-4">
             <button className="px-6 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface font-button text-button rounded-lg transition-colors border border-outline-variant">
               Load More Results
             </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-6">
            <h3 className="text-h2 font-h2 text-on-surface mb-4">Recent Searches</h3>
            <div className="flex flex-wrap gap-2">
              {["failed login attempts", "user:jdoe@company.com", "api rate limit error"].map(term => (
                <span key={term} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface-container text-on-surface font-body-sm border border-outline-variant hover:bg-surface-container-highest cursor-pointer transition-colors max-w-full">
                  <span className="truncate">{term}</span>
                  <X className="w-4 h-4 text-outline hover:text-on-surface shrink-0" />
                </span>
              ))}
            </div>
          </div>

           <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-6">
            <h3 className="text-h2 font-h2 text-on-surface mb-4">Trending</h3>
            <ul className="space-y-4 font-body-sm text-on-surface-variant">
              {["System health check", "Active sessions", "Database backups"].map(term => (
                 <li key={term} className="flex items-center justify-between cursor-pointer hover:text-primary transition-colors">
                   <span>{term}</span>
                   <SearchIcon className="w-4 h-4 text-outline" />
                 </li>
              ))}
            </ul>
           </div>
        </div>
      </div>
    </div>
  );
}
