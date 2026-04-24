import { Rocket, ShieldAlert, CreditCard, Users, FileText, ChevronRight, Headset } from "lucide-react";
import { Link } from "react-router-dom";

export default function HelpCenter() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
      {/* Intro & Search */}
      <div className="bg-primary-container text-on-primary-container p-8 rounded-xl shadow-sm relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <h1 className="font-h1 text-on-primary text-2xl font-bold">How can we help?</h1>
          <div className="relative max-w-2xl">
            <input 
              type="text" 
              placeholder="Search for help, articles, or tutorials..." 
              className="w-full pl-4 pr-10 py-3 rounded-lg bg-surface-container-lowest border-none text-on-surface focus:ring-2 focus:ring-secondary focus:outline-none font-body-lg shadow-sm placeholder:text-outline-variant"
            />
          </div>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none w-64 h-64 bg-on-primary rounded-tl-full translate-x-16 translate-y-16"></div>
      </div>

      <section>
        <h3 className="font-h2 text-h2 text-on-surface mb-4">Quick Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-surface-container-lowest p-6 rounded-lg border border-outline-variant hover:shadow-md transition-shadow cursor-pointer flex items-start gap-4">
             <div className="p-3 bg-surface-container-low rounded-lg text-primary-container">
               <Rocket className="w-5 h-5" />
             </div>
             <div>
               <h4 className="font-button text-button text-on-surface mb-1">Getting Started</h4>
               <p className="font-body-sm text-body-sm text-on-surface-variant">Onboarding and basics.</p>
             </div>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-lg border border-outline-variant hover:shadow-md transition-shadow cursor-pointer flex items-start gap-4">
             <div className="p-3 bg-surface-container-low rounded-lg text-primary-container">
               <ShieldAlert className="w-5 h-5" />
             </div>
             <div>
               <h4 className="font-button text-button text-on-surface mb-1">Security</h4>
               <p className="font-body-sm text-body-sm text-on-surface-variant">MFA, permissions, and API keys.</p>
             </div>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-lg border border-outline-variant hover:shadow-md transition-shadow cursor-pointer flex items-start gap-4">
             <div className="p-3 bg-surface-container-low rounded-lg text-primary-container">
               <CreditCard className="w-5 h-5" />
             </div>
             <div>
               <h4 className="font-button text-button text-on-surface mb-1">Billing</h4>
               <p className="font-body-sm text-body-sm text-on-surface-variant">Plans, invoices, and payments.</p>
             </div>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-lg border border-outline-variant hover:shadow-md transition-shadow cursor-pointer flex items-start gap-4">
             <div className="p-3 bg-surface-container-low rounded-lg text-primary-container">
               <Users className="w-5 h-5" />
             </div>
             <div>
               <h4 className="font-button text-button text-on-surface mb-1">User Management</h4>
               <p className="font-body-sm text-body-sm text-on-surface-variant">Roles, invites, and activity.</p>
             </div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="font-h2 text-h2 text-on-surface mb-4">Popular Articles</h3>
        <div className="bg-surface-container-lowest rounded-lg border border-outline-variant overflow-hidden shadow-sm">
          {[
            "How to rotate API keys",
            "Setting up multi-factor authentication",
            "Understanding user roles and permissions",
          ].map((article, i) => (
             <Link key={i} to="#" className="flex items-center justify-between p-4 hover:bg-surface-container-low border-b border-outline-variant last:border-b-0 transition-colors">
               <div className="flex items-center gap-3">
                 <FileText className="w-5 h-5 text-outline-variant" />
                 <span className="font-body-sm text-on-surface font-medium">{article}</span>
               </div>
               <ChevronRight className="w-5 h-5 text-outline-variant" />
             </Link>
          ))}
        </div>
      </section>

      <section className="bg-surface-container-lowest border border-outline-variant rounded-lg p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left shadow-sm">
        <div>
          <h3 className="font-h2 text-h2 text-on-surface mb-1">Still need help?</h3>
          <p className="font-body-sm text-on-surface-variant">Our support team is available 24/7 to assist you.</p>
        </div>
        <Link to="/support" className="bg-primary-container text-on-primary px-6 h-12 rounded-lg font-button hover:opacity-90 transition-opacity flex items-center gap-2 shrink-0">
          <Headset className="w-5 h-5" />
          Contact Support
        </Link>
      </section>

      <footer className="pt-8 border-t border-outline-variant flex flex-col md:flex-row justify-between items-center gap-4 text-on-surface-variant text-xs font-medium">
        <p>© 2026 Keep In Mind Admin Console</p>
        <div className="flex gap-6">
          <Link to="/support" className="hover:text-primary transition-colors">Support</Link>
          <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
          <a href="#" className="hover:text-primary transition-colors">Privacy</a>
        </div>
      </footer>
    </div>
  );
}
