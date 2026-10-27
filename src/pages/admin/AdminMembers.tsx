import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Profile { id: string; full_name: string; email: string; phone: string; created_at: string; }

export default function AdminMembers() {
  const [members, setMembers] = useState<Profile[]>([]);

  useEffect(() => {
    supabase.from("profiles").select("*").order("created_at", { ascending: false }).then(({ data }) => setMembers((data as Profile[]) ?? []));
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-bold">Members</h2>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-medium">{m.full_name || "—"}</TableCell>
                <TableCell>{m.email}</TableCell>
                <TableCell>{m.phone || "—"}</TableCell>
                <TableCell>{format(new Date(m.created_at), "MMM d, yyyy")}</TableCell>
              </TableRow>
            ))}
            {members.length === 0 && (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No members yet</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
