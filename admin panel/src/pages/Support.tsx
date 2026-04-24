import { Mail, Phone, MessageSquare, LifeBuoy, ChevronRight, Search } from "lucide-react";
import { Link } from "react-router-dom";

export default function Support() {
  const faqs = [
    { q: "How do I reset my password?", a: "You can reset your password from the login screen by clicking 'Forgot Password' or through your Account Settings after logging in." },
    { q: "How do I add a new administrator?", a: "Navigate to the 'Users' section in the sidebar and click 'New User'. Ensure you assign the appropriate administrative role." },
    { q: "Where can I find audit logs?", a: "Audit logs are available under the 'Logs' section in the sidebar, providing a complete history of system actions." },
    { q: "Is my data secure?", a: "Yes, Keep In Mind uses industry-standard encryption and security protocols to ensure your data is always protected." },
  ];

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <header className="bg-primary text-on-primary py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <LifeBuoy className="w-12 h-12 mx-auto mb-6 opacity-80" />
          <h1 className="text-display-md font-h1 mb-4">How can we help?</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8 font-body-sm">
            Search our knowledge base or reach out to our dedicated support team.
          </p>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search for articles..." 
              className="w-full bg-white text-black py-4 pl-12 pr-4 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
            />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow text-center">
            <div className="w-12 h-12 bg-secondary-container text-on-secondary-container rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-h3 font-h2 mb-2">Email Support</h3>
            <p className="text-on-surface-variant mb-6 text-body-sm">Response within 24 hours</p>
            <a href="mailto:support@keepinmind.in" className="text-primary font-bold hover:underline">support@keepinmind.in</a>
          </div>

          <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow text-center">
            <div className="w-12 h-12 bg-primary-container text-on-primary-container rounded-2xl flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-h3 font-h2 mb-2">Live Chat</h3>
            <p className="text-on-surface-variant mb-6 text-body-sm">Available Mon-Fri, 9am-5pm</p>
            <button className="bg-primary text-on-primary px-6 py-2 rounded-full font-bold hover:opacity-90 transition-opacity">Start Chat</button>
          </div>

          <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow text-center">
            <div className="w-12 h-12 bg-surface-variant text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="text-h3 font-h2 mb-2">Phone Support</h3>
            <p className="text-on-surface-variant mb-6 text-body-sm">Priority for Enterprise</p>
            <a href="tel:+18005550199" className="text-primary font-bold hover:underline">+1 (800) 555-0199</a>
          </div>
        </div>

        <section className="mb-20">
          <h2 className="text-h2 font-h1 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant">
                <h4 className="text-button font-h2 text-primary mb-3 flex items-start gap-2">
                   <ChevronRight className="w-4 h-4 mt-1 shrink-0" />
                   {faq.q}
                </h4>
                <p className="text-body-md text-on-surface-variant pl-6">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="text-center bg-surface-container-lowest border border-outline-variant p-10 rounded-[2.5rem] shadow-sm">
          <h2 className="text-h2 font-h1 mb-4">Can't find what you're looking for?</h2>
          <p className="text-on-surface-variant mb-8 font-body-sm">Our support representatives are standing by to help you with any issues.</p>
          <div className="flex justify-center gap-4">
             <Link to="/login" className="bg-surface-variant text-on-surface-variant px-8 py-3 rounded-xl font-bold hover:bg-surface-container-high transition-colors">Back to Login</Link>
             <button className="bg-primary text-on-primary px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity">Submit a Ticket</button>
          </div>
        </div>
      </main>

      <footer className="py-12 border-t border-outline-variant text-center text-on-surface-variant text-sm">
        <p>© 2026 Keep In Mind Admin Console. All rights reserved.</p>
      </footer>
    </div>
  );
}
