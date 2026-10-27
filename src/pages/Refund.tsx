import { useNavigate } from "react-router-dom";
import { Dumbbell, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Refund() {
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
        <h1 className="font-display text-4xl font-bold">Refund Policy</h1>
        <p className="text-muted-foreground text-sm">Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>
        {[
          { t: "Eligibility", c: "Refund requests must be made within 7 days of the payment date. Memberships that have been used for more than 3 days are not eligible for a full refund." },
          { t: "Process", c: "To request a refund, contact our support team at support@fitcore.in with your payment receipt. Refunds are processed within 5–7 business days to the original payment method." },
          { t: "Partial Refunds", c: "For memberships used between 3–7 days, a partial refund may be issued at our discretion, calculated on a pro-rata basis." },
          { t: "Non-Refundable", c: "Registration fees, personal training sessions already delivered, and any promotional or discounted memberships are non-refundable." },
          { t: "Contact", c: "For refund inquiries, email support@fitcore.in or call +91 98765 43210. Our team is available Monday to Saturday, 9 AM – 6 PM IST." },
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
