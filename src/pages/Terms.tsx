import { useNavigate } from "react-router-dom";
import { Dumbbell, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Terms() {
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
        <h1 className="font-display text-4xl font-bold">Terms of Service</h1>
        <p className="text-muted-foreground text-sm">Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>
        {[
          { t: "Acceptance of Terms", c: "By accessing and using FitCore, you agree to be bound by these Terms of Service. If you do not agree, please discontinue use of the platform immediately." },
          { t: "Service Description", c: "FitCore is a gym management platform that provides membership management, payment processing, attendance tracking, and analytics tools for fitness businesses." },
          { t: "User Accounts", c: "You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate and complete information during registration. Notify us immediately of any unauthorised use." },
          { t: "Payments & Billing", c: "All membership payments are processed securely through our platform. Prices are listed in Indian Rupees (₹). We reserve the right to change pricing with prior notice." },
          { t: "Limitation of Liability", c: "FitCore shall not be liable for any indirect, incidental, or consequential damages. Our total liability is limited to the amount paid by you in the preceding 12 months." },
          { t: "Governing Law", c: "These terms are governed by the laws of India. Any disputes shall be resolved in the courts of Mumbai, Maharashtra." },
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
