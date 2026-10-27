import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, differenceInDays } from "date-fns";

interface ExpiringMember {
  id: string; user_id: string; membership_end: string; plan_id: string | null;
  member_name?: string; member_email?: string; plan_name?: string;
}

export default function AdminExpiring() {
  const [records, setRecords] = useState<ExpiringMember[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const future = new Date();
      future.setDate(future.getDate() + 14);
      const [{ data: pays }, { data: profiles }, { data: plans }] = await Promise.all([
        supabase.from("payments").select("*")
          .lte("membership_end", future.toISOString().split("T")[0])
          .gte("membership_end", new Date().toISOString().split("T")[0])
          .order("membership_end"),
        supabase.from("profiles").select("id, full_name, email"),
        supabase.from("membership_plans").select("id, name"),
      ]);
      const profileMap = new Map((profiles ?? []).map(p => [p.id, p]));
      const planMap = new Map((plans ?? []).map(p => [p.id, p]));
      setRecords((pays ?? []).map(p => ({
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
      <h2 className="text-2xl font-display font-bold">Expiring Memberships</h2>
      <p className="text-muted-foreground">Members whose memberships expire within 14 days</p>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Days Left</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((r) => {
              const daysLeft = differenceInDays(new Date(r.membership_end), new Date());
              return (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.member_name || r.member_email || "—"}</TableCell>
                  <TableCell>{r.plan_name || "—"}</TableCell>
                  <TableCell>{format(new Date(r.membership_end), "MMM d, yyyy")}</TableCell>
                  <TableCell>
                    <Badge variant={daysLeft <= 3 ? "destructive" : "secondary"}>
                      {daysLeft} day{daysLeft !== 1 ? "s" : ""}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
            {records.length === 0 && (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No expiring memberships</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
