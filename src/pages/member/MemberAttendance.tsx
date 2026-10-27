import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInMinutes } from "date-fns";
import { LogIn, LogOut, CalendarCheck, Clock, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function MemberAttendance() {
  const { user } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<any>(null);
  const { toast } = useToast();

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("attendance")
      .select("*")
      .eq("user_id", user.id)
      .order("check_in", { ascending: false });
    setRecords(data ?? []);
    const open = data?.find(r => !r.check_out);
    setActiveSession(open ?? null);
  };

  useEffect(() => { load(); }, [user]);

  const checkIn = async () => {
    if (!user) return;
    await supabase.from("attendance").insert({ user_id: user.id });
    toast({ title: "💪 Checked in! Let's crush it!" });
    load();
  };

  const checkOut = async () => {
    if (!activeSession) return;
    await supabase.from("attendance").update({ check_out: new Date().toISOString() }).eq("id", activeSession.id);
    toast({ title: "🏃 Great session! See you soon!" });
    load();
  };

  const totalSessions = records.length;
  const totalMinutes = records
    .filter(r => r.check_out)
    .reduce((sum, r) => sum + differenceInMinutes(new Date(r.check_out), new Date(r.check_in)), 0);
  const totalHours = Math.floor(totalMinutes / 60);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <h2 className="text-2xl font-display font-bold">Attendance</h2>
        {activeSession ? (
          <Button
            onClick={checkOut}
            variant="secondary"
            className="gap-2 bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20"
          >
            <LogOut className="h-4 w-4" /> Check Out
          </Button>
        ) : (
          <Button onClick={checkIn} className="gap-2 shadow-[0_0_20px_hsl(var(--primary)/0.4)]">
            <LogIn className="h-4 w-4" /> Check In
          </Button>
        )}
      </div>

      {/* Live session banner */}
      {activeSession && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-success/20 to-success/5 border border-success/30 p-5 animate-scale-in">
          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-success font-semibold">LIVE SESSION</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
              <Zap className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="font-semibold">You're currently at the gym! 🔥</p>
              <p className="text-sm text-muted-foreground">
                Checked in at {format(new Date(activeSession.check_in), "h:mm a")} ·{" "}
                {differenceInMinutes(new Date(), new Date(activeSession.check_in))} mins
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 animate-fade-in" style={{ animationDelay: "100ms" }}>
        <div className="rounded-2xl p-5 bg-card border border-border hover:border-primary/30 transition-all group">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <CalendarCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Sessions</p>
              <p className="text-2xl font-bold font-display">{totalSessions}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl p-5 bg-card border border-border hover:border-primary/30 transition-all group">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Hours</p>
              <p className="text-2xl font-bold font-display">{totalHours}h</p>
            </div>
          </div>
        </div>
      </div>

      {/* Records table */}
      <div className="rounded-2xl border bg-card overflow-hidden shadow-sm animate-fade-in" style={{ animationDelay: "200ms" }}>
        <div className="px-6 py-4 border-b bg-muted/30 flex items-center gap-2">
          <CalendarCheck className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">Session History</span>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Date</TableHead>
              <TableHead>Check In</TableHead>
              <TableHead>Check Out</TableHead>
              <TableHead>Duration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((r, i) => (
              <TableRow
                key={r.id}
                className="animate-fade-in hover:bg-accent/30 transition-colors"
                style={{ animationDelay: `${300 + i * 40}ms` }}
              >
                <TableCell className="font-medium">{format(new Date(r.check_in), "MMM d, yyyy")}</TableCell>
                <TableCell>{format(new Date(r.check_in), "h:mm a")}</TableCell>
                <TableCell>
                  {r.check_out
                    ? format(new Date(r.check_out), "h:mm a")
                    : <Badge className="bg-success/10 text-success border-success/20">🔴 Active</Badge>
                  }
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {r.check_out
                    ? `${differenceInMinutes(new Date(r.check_out), new Date(r.check_in))} min`
                    : `${differenceInMinutes(new Date(), new Date(r.check_in))} min (ongoing)`
                  }
                </TableCell>
              </TableRow>
            ))}
            {records.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-12">
                  <CalendarCheck className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>No attendance records yet</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
