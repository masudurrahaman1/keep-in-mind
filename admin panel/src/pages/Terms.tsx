import { Shield, FileText, Lock, Globe, Scale, Link as LinkIcon } from "lucide-react";
import { Link } from "react-router-dom";

export default function Terms() {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      icon: Scale,
      content: "By accessing or using the Keep In Mind Admin Console, you agree to be bound by these Terms of Service. If you do not agree to all of the terms and conditions, you are prohibited from using the application."
    },
    {
      title: "2. User Accounts",
      icon: Lock,
      content: "You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account or password."
    },
    {
      title: "3. Data Privacy",
      icon: Shield,
      content: "Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your personal data when you use our services."
    },
    {
      title: "4. Intellectual Property",
      icon: Globe,
      content: "The Service and its original content, features, and functionality are and will remain the exclusive property of Keep In Mind and its licensors."
    },
    {
        title: "5. Limitation of Liability",
        icon: FileText,
        content: "In no event shall Keep In Mind, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages."
    }
  ];

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <nav className="max-w-5xl mx-auto px-4 py-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <span className="text-xl font-h2 text-primary">Keep In Mind</span>
        </div>
        <Link to="/login" className="text-body-sm font-medium hover:text-primary transition-colors">Back to Login</Link>
      </nav>

      <header className="py-20 px-4 text-center bg-surface-container-low border-y border-outline-variant">
        <h1 className="text-display-sm font-h1 mb-4">Terms and Conditions</h1>
        <p className="text-on-surface-variant max-w-2xl mx-auto font-body-sm">
          Last updated: April 24, 2026. Please read these terms carefully before using our service.
        </p>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-20">
        <div className="space-y-16">
          {sections.map((section, i) => (
            <section key={i} className="flex gap-6 group">
              <div className="w-12 h-12 bg-surface-container-high rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-on-primary transition-all duration-300">
                <section.icon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-h2 font-h2 mb-4 text-on-surface">{section.title}</h2>
                <p className="text-body-lg text-on-surface-variant leading-relaxed">
                  {section.content}
                </p>
              </div>
            </section>
          ))}
        </div>

        <div className="mt-24 p-10 bg-primary-container text-on-primary-container rounded-[2rem] text-center">
            <LinkIcon className="w-10 h-10 mx-auto mb-6 opacity-40" />
            <h2 className="text-h2 font-h1 mb-4">Questions about our Terms?</h2>
            <p className="mb-8 opacity-90">If you have any questions about these Terms, please contact us at legal@keepinmind.in.</p>
            <div className="flex justify-center gap-4">
                <Link to="/support" className="bg-on-primary-container text-primary-container px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity">Contact Support</Link>
            </div>
        </div>
      </main>

      <footer className="py-12 border-t border-outline-variant text-center text-on-surface-variant text-sm">
        <div className="flex justify-center gap-6 mb-4">
            <Link to="/support" className="hover:text-primary">Support</Link>
            <Link to="/privacy" className="hover:text-primary">Privacy Policy</Link>
            <Link to="/cookies" className="hover:text-primary">Cookie Policy</Link>
        </div>
        <p>© 2026 Keep In Mind. Professional Admin Solutions.</p>
      </footer>
    </div>
  );
}
