import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import StatsCard from "@/components/StatsCard";
import { CreditCard, CalendarCheck, Bell, Clock, TrendingUp, Zap, ChevronRight, Trophy, Flame, ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { format, differenceInDays } from "date-fns";
import { Progress } from "@/components/ui/progress";

export default function MemberDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ payments: 0, checkins: 0, notifications: 0 });
  const [activeMembership, setActiveMembership] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [recentAttendance, setRecentAttendance] = useState<any[]>([]);
  const [greeting, setGreeting] = useState("Hello");

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting("Good Morning");
    else if (h < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [{ count: payments }, { count: checkins }, { count: notifications }, { data: prof }, { data: attendance }] = await Promise.all([
        supabase.from("payments").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("attendance").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("notifications").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("is_read", false),
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("attendance").select("*").eq("user_id", user.id).order("check_in", { ascending: false }).limit(5),
      ]);

      const { data: membership } = await supabase.from("payments")
        .select("*, membership_plans!payments_plan_id_fkey(name, duration_days)")
        .eq("user_id", user.id)
        .gte("membership_end", new Date().toISOString().split("T")[0])
        .order("membership_end", { ascending: false })
        .limit(1)
        .maybeSingle();

      setStats({ payments: payments ?? 0, checkins: checkins ?? 0, notifications: notifications ?? 0 });
      setActiveMembership(membership);
      setProfile(prof);
      setRecentAttendance(attendance ?? []);
    };
    load();
  }, [user]);

  const daysLeft = activeMembership
    ? differenceInDays(new Date(activeMembership.membership_end), new Date())
    : 0;
  const totalDays = activeMembership?.membership_plans?.duration_days || 30;
  const usedDays = totalDays - daysLeft;
  const progressPercent = Math.min(100, Math.round((usedDays / totalDays) * 100));

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-orange-400 p-6 text-primary-foreground animate-fade-in">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-primary-foreground/80 text-sm font-medium flex items-center gap-1.5">
              <Flame className="h-4 w-4" /> {greeting}!
            </p>
            <h2 className="text-3xl font-display font-bold mt-1">
              {profile?.full_name || user?.email?.split("@")[0] || "Member"} 👋
            </h2>
            <p className="text-primary-foreground/70 text-sm mt-1">
              {activeMembership
                ? `Your ${activeMembership.membership_plans?.name} plan is active`
                : "No active membership. Get started today!"}
            </p>
          </div>
          <div className="hidden md:flex w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm items-center justify-center text-2xl font-bold border border-white/30">
            {initials}
          </div>
        </div>

        {activeMembership && (
          <div className="relative mt-4 pt-4 border-t border-white/20">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-primary-foreground/80">Membership Progress</span>
              <span className="font-semibold">{daysLeft} days left</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-white rounded-full h-2 transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard title="Total Payments" value={stats.payments} icon={CreditCard} delay={0} />
        <StatsCard title="Total Check-ins" value={stats.checkins} icon={CalendarCheck} delay={100} />
        <StatsCard title="Unread Alerts" value={stats.notifications} icon={Bell} delay={200} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Active Membership Card */}
        <Card className="relative overflow-hidden animate-fade-in border-0 shadow-md" style={{ animationDelay: "300ms" }}>
          <div className="absolute inset-0 bg-gradient-to-br from-card to-accent/10" />
          <CardHeader className="relative">
            <CardTitle className="font-display flex items-center gap-2 text-base">
              <div className="p-2 rounded-lg bg-primary/10">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              Active Membership
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            {activeMembership ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xl font-bold font-display">{activeMembership.membership_plans?.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Valid until {format(new Date(activeMembership.membership_end), "MMMM d, yyyy")}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${daysLeft <= 7 ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"}`}>
                    {daysLeft <= 7 ? "⚠️ Expiring Soon" : "✅ Active"}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{usedDays} days used</span>
                    <span>{daysLeft} days remaining</span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-center py-4">
                <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <Zap className="h-7 w-7 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">No active membership</p>
                  <p className="text-sm text-muted-foreground">Unlock all gym features</p>
                </div>
                <Button onClick={() => navigate("/member/plans")} className="w-full">
                  Browse Plans <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="relative overflow-hidden animate-fade-in border-0 shadow-md" style={{ animationDelay: "400ms" }}>
          <div className="absolute inset-0 bg-gradient-to-br from-card to-accent/10" />
          <CardHeader className="relative">
            <CardTitle className="font-display flex items-center gap-2 text-base">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              Recent Gym Visits
            </CardTitle>
          </CardHeader>
          <CardContent className="relative space-y-2">
            {recentAttendance.length > 0 ? recentAttendance.map((r, i) => (
              <div
                key={r.id}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors animate-fade-in"
                style={{ animationDelay: `${500 + i * 60}ms` }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success" />
                  <span className="text-sm font-medium">{format(new Date(r.check_in), "MMM d")}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(r.check_in), "h:mm a")}
                  {r.check_out && ` – ${format(new Date(r.check_out), "h:mm a")}`}
                </span>
              </div>
            )) : (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarCheck className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No gym visits yet</p>
                <Button variant="ghost" size="sm" className="mt-2" onClick={() => navigate("/member/attendance")}>
                  Check In Now
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="animate-fade-in" style={{ animationDelay: "500ms" }}>
        <h3 className="font-display font-semibold text-lg mb-3 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" /> Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Browse Plans", icon: ClipboardList, path: "/member/plans" },
            { label: "Payments", icon: CreditCard, path: "/member/payments" },
            { label: "Attendance", icon: CalendarCheck, path: "/member/attendance" },
            { label: "My Profile", icon: Trophy, path: "/member/profile" },
          ].map((item, i) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border hover:border-primary/40 hover:shadow-[0_0_20px_hsl(var(--primary)/0.15)] transition-all duration-300 hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${600 + i * 60}ms` }}
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs font-medium text-center leading-tight">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
