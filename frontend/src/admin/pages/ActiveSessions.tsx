import { Laptop, Smartphone, Tablet, LogOut } from "lucide-react";

export default function ActiveSessions() {
  return (
    <div className="max-w-3xl mx-auto w-full pt-4 space-y-8 pb-16">
      <header>
        <h1 className="text-h1 font-h1 text-on-surface mb-6">Active Sessions</h1>
        <button className="w-full flex items-center justify-center gap-2 h-12 bg-primary-container text-on-primary rounded-lg font-button active:opacity-80 transition-opacity">
          <LogOut className="w-5 h-5" />
          Log out of all other sessions
        </button>
      </header>

      <section className="space-y-3">
        <h2 className="text-label-caps font-label-caps text-on-surface-variant uppercase">Current Session</h2>
        <div className="bg-primary-container/10 rounded-xl border border-primary-container/20 p-6 flex flex-col sm:flex-row gap-4 sm:items-start relative overflow-hidden shadow-sm">
          <div className="absolute top-0 left-0 w-1 h-full bg-secondary-container"></div>
          <div className="w-12 h-12 rounded-full bg-surface-container-lowest flex items-center justify-center shrink-0 border border-outline-variant shadow-sm z-10">
            <Laptop className="w-6 h-6 text-secondary-container" />
          </div>
          <div className="flex-1 space-y-1 z-10">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-h2 font-h2 text-on-surface">MacBook Pro - Chrome</h3>
              <span className="bg-secondary-container text-on-secondary-container text-label-caps font-label-caps px-2 py-0.5 rounded-sm">Active Now</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-on-surface-variant text-body-sm font-body-sm mt-2">
              <span className="flex items-center gap-1">San Francisco, CA</span>
              <span className="hidden sm:block w-1 h-1 rounded-full bg-outline-variant"></span>
              <span>192.168.1.42</span>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-label-caps font-label-caps text-on-surface-variant uppercase">Other Active Sessions</h2>
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 flex flex-col sm:flex-row gap-4 sm:items-center shadow-sm">
            <div className="flex gap-4 items-start flex-1">
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5 text-on-surface-variant" />
              </div>
              <div className="space-y-1">
                <h3 className="text-body-lg font-medium text-on-surface">iPhone 13 Pro - Safari</h3>
                <div className="flex flex-col text-on-surface-variant text-body-sm">
                  <span>New York, NY</span>
                  <span>Last active: 2 hours ago</span>
                </div>
              </div>
            </div>
            <button className="mt-2 sm:mt-0 h-11 px-4 rounded-lg border border-outline-variant text-on-surface font-button hover:bg-surface-container-low transition-colors w-full sm:w-auto">
              Revoke
            </button>
          </div>

          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 flex flex-col sm:flex-row gap-4 sm:items-center shadow-sm">
            <div className="flex gap-4 items-start flex-1">
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center shrink-0">
                <Tablet className="w-5 h-5 text-on-surface-variant" />
              </div>
              <div className="space-y-1">
                <h3 className="text-body-lg font-medium text-on-surface">iPad Air - App</h3>
                <div className="flex flex-col text-on-surface-variant text-body-sm">
                  <span>London, UK</span>
                  <span>Last active: Yesterday</span>
                </div>
              </div>
            </div>
            <button className="mt-2 sm:mt-0 h-11 px-4 rounded-lg border border-outline-variant text-on-surface font-button hover:bg-surface-container-low transition-colors w-full sm:w-auto">
              Revoke
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
