import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Payment {
  id: string; user_id: string; amount: number; status: string; payment_method: string;
  membership_start: string; membership_end: string; created_at: string;
  plan_id: string | null;
  member_name?: string; member_email?: string; plan_name?: string;
}

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: pays }, { data: profiles }, { data: plans }] = await Promise.all([
        supabase.from("payments").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("id, full_name, email"),
        supabase.from("membership_plans").select("id, name"),
      ]);
      const profileMap = new Map((profiles ?? []).map(p => [p.id, p]));
      const planMap = new Map((plans ?? []).map(p => [p.id, p]));
      setPayments((pays ?? []).map(p => ({
        ...p,
        member_name: profileMap.get(p.user_id)?.full_name,
        member_email: profileMap.get(p.user_id)?.email,
        plan_name: p.plan_id ? planMap.get(p.plan_id)?.name : undefined,
      })));
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-bold">Payments</h2>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.member_name || p.member_email || "—"}</TableCell>
                <TableCell>{p.plan_name || "—"}</TableCell>
                <TableCell>${Number(p.amount).toFixed(2)}</TableCell>
                <TableCell><Badge variant={p.status === "completed" ? "default" : "secondary"}>{p.status}</Badge></TableCell>
                <TableCell className="text-sm">{p.membership_start} → {p.membership_end}</TableCell>
                <TableCell>{format(new Date(p.created_at), "MMM d, yyyy")}</TableCell>
              </TableRow>
            ))}
            {payments.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No payments yet</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
