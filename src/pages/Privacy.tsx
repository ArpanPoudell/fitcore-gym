import { useNavigate } from "react-router-dom";
import { Dumbbell, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Privacy() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
            <Dumbbell className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold">FitCore</span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate("/")}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-16 space-y-8 animate-fade-in">
        <h1 className="font-display text-4xl font-bold">Privacy Policy</h1>
        <p className="text-muted-foreground text-sm">Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>
        {[
          { t: "Information We Collect", c: "We collect personal information such as your name, email address, phone number, and payment details when you register for an account or purchase a membership. We also collect usage data including attendance records, login times, and interaction patterns." },
          { t: "How We Use Your Information", c: "Your information is used to provide and maintain our service, notify you about changes, provide customer support, gather usage data to improve the platform, and process payments securely." },
          { t: "Data Security", c: "We implement industry-standard security measures to protect your personal data. All data transmissions are encrypted using SSL/TLS protocols. Your payment information is processed through secure, PCI-compliant payment gateways." },
          { t: "Data Sharing", c: "We do not sell or rent your personal data to third parties. We may share data with service providers who assist us in operating the platform, subject to strict confidentiality agreements." },
          { t: "Your Rights", c: "You have the right to access, correct, or delete your personal data at any time. You can update your profile information directly through the platform or contact our support team for assistance." },
          { t: "Contact Us", c: "If you have any questions about this Privacy Policy, please contact us at support@fitcore.in or call us at +91 98765 43210." },
        ].map(s => (
          <section key={s.t} className="space-y-3">
            <h2 className="font-display text-xl font-semibold">{s.t}</h2>
            <p className="text-muted-foreground leading-relaxed">{s.c}</p>
          </section>
        ))}
      </main>
    </div>
  );
}
