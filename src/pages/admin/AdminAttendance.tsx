import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

interface AttendanceRecord {
  id: string; user_id: string; check_in: string; check_out: string | null;
  member_name?: string; member_email?: string;
}

export default function AdminAttendance() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: attendance }, { data: profiles }] = await Promise.all([
        supabase.from("attendance").select("*").order("check_in", { ascending: false }),
        supabase.from("profiles").select("id, full_name, email"),
      ]);
      const profileMap = new Map((profiles ?? []).map(p => [p.id, p]));
      setRecords((attendance ?? []).map(a => ({
        ...a,
        member_name: profileMap.get(a.user_id)?.full_name,
        member_email: profileMap.get(a.user_id)?.email,
      })));
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-bold">Attendance Reports</h2>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Check In</TableHead>
              <TableHead>Check Out</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.member_name || r.member_email || "—"}</TableCell>
                <TableCell>{format(new Date(r.check_in), "MMM d, yyyy h:mm a")}</TableCell>
                <TableCell>{r.check_out ? format(new Date(r.check_out), "h:mm a") : "—"}</TableCell>
              </TableRow>
            ))}
            {records.length === 0 && (
              <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">No attendance records</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
