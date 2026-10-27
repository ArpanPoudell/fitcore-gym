import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CreditCard, IndianRupee, TrendingUp } from "lucide-react";

export default function MemberPayments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!user) return;
    supabase.from("payments")
      .select("*, membership_plans!payments_plan_id_fkey(name)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setPayments(data ?? []);
        setTotal((data ?? []).reduce((sum: number, p: any) => sum + Number(p.amount), 0));
      });
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-in">
        <h2 className="text-2xl font-display font-bold">Payment History</h2>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 animate-fade-in" style={{ animationDelay: "100ms" }}>
        <div className="relative overflow-hidden rounded-2xl p-5 bg-card border border-border group hover:border-primary/40 hover:shadow-[0_0_30px_hsl(var(--primary)/0.1)] transition-all duration-300">
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/10 rounded-full blur-xl" />
          <div className="flex items-center gap-3 relative">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Transactions</p>
              <p className="text-2xl font-bold font-display">{payments.length}</p>
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-2xl p-5 bg-card border border-border group hover:border-primary/40 hover:shadow-[0_0_30px_hsl(var(--primary)/0.1)] transition-all duration-300">
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-success/10 rounded-full blur-xl" />
          <div className="flex items-center gap-3 relative">
            <div className="p-2.5 rounded-xl bg-success/10">
              <IndianRupee className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Spent</p>
              <p className="text-2xl font-bold font-display">₹{total.toLocaleString("en-IN")}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-card overflow-hidden animate-fade-in shadow-sm" style={{ animationDelay: "200ms" }}>
        <div className="px-6 py-4 border-b bg-muted/30 flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">Transactions</span>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Plan</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((p, i) => (
              <TableRow
                key={p.id}
                className="animate-fade-in hover:bg-accent/30 transition-colors"
                style={{ animationDelay: `${300 + i * 50}ms` }}
              >
                <TableCell className="font-medium">{p.membership_plans?.name || "—"}</TableCell>
                <TableCell>
                  <span className="font-semibold text-success">₹{Number(p.amount).toLocaleString("en-IN")}</span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={p.status === "completed" ? "default" : "secondary"}
                    className={p.status === "completed" ? "bg-success/10 text-success border-success/20 hover:bg-success/20" : ""}
                  >
                    {p.status === "completed" ? "✅ " : ""}{p.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{p.membership_start} → {p.membership_end}</TableCell>
                <TableCell className="text-sm">{format(new Date(p.created_at), "MMM d, yyyy")}</TableCell>
              </TableRow>
            ))}
            {payments.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                  <CreditCard className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>No payments yet</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
