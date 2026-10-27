import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Shield, Clock } from "lucide-react";
import PaymentCheckout from "@/components/PaymentCheckout";
import { useToast } from "@/hooks/use-toast";

interface Plan { id: string; name: string; description: string; duration_days: number; price: number; }

export default function MemberPlans() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    supabase.from("membership_plans").select("*").eq("is_active", true).order("price").then(({ data }) => setPlans((data as Plan[]) ?? []));
  }, []);

  const handlePaymentSuccess = async () => {
    if (!selectedPlan || !user) return;
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + selectedPlan.duration_days);

    const { error } = await supabase.from("payments").insert({
      user_id: user.id,
      plan_id: selectedPlan.id,
      amount: selectedPlan.price,
      status: "completed",
      payment_method: "upi",
      membership_start: start.toISOString().split("T")[0],
      membership_end: end.toISOString().split("T")[0],
    });

    if (error) {
      toast({ title: "Error saving payment", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "🎉 Membership Activated!", description: `Your ${selectedPlan.name} plan is now active.` });
    }
    setSelectedPlan(null);
  };

  const planIcons = [Zap, Shield, Clock];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold">Membership Plans</h2>
        <p className="text-muted-foreground text-sm mt-1">Choose a plan and pay securely via UPI, Card, Net Banking, or Wallet</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan, i) => {
          const Icon = planIcons[i % planIcons.length];
          const isPopular = i === 1;
          return (
            <Card key={plan.id} className={`animate-fade-in relative overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 ${isPopular ? "border-primary shadow-lg" : ""}`}>
              {isPopular && (
                <div className="absolute top-0 right-0">
                  <Badge className="rounded-none rounded-bl-lg rounded-tr-lg bg-primary text-primary-foreground text-xs px-3 py-1">Most Popular</Badge>
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center mb-2">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="font-display text-lg">{plan.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-display font-bold">₹{plan.price.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground">/ {plan.duration_days} days</span>
                </div>
                <ul className="space-y-1.5 text-sm">
                  <li className="flex items-center gap-2 text-muted-foreground"><Check className="h-3.5 w-3.5 text-primary shrink-0" />Full gym access</li>
                  <li className="flex items-center gap-2 text-muted-foreground"><Check className="h-3.5 w-3.5 text-primary shrink-0" />Attendance tracking</li>
                  <li className="flex items-center gap-2 text-muted-foreground"><Check className="h-3.5 w-3.5 text-primary shrink-0" />{plan.duration_days >= 90 ? "Priority support" : "Standard support"}</li>
                </ul>
                <Button
                  className={`w-full ${isPopular ? "gradient-primary border-0 text-primary-foreground" : ""}`}
                  variant={isPopular ? "default" : "outline"}
                  onClick={() => setSelectedPlan(plan)}
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <PaymentCheckout
        plan={selectedPlan}
        onClose={() => setSelectedPlan(null)}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
