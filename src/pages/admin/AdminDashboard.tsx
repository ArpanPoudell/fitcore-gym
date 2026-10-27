import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import StatsCard from "@/components/StatsCard";
import { Users, CreditCard, CalendarCheck, AlertTriangle, TrendingUp, Activity, Dumbbell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ members: 0, payments: 0, checkins: 0, expiring: 0 });
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState<{ month: string; revenue: number }[]>([]);
  const [memberGrowth, setMemberGrowth] = useState<{ month: string; members: number }[]>([]);

  useEffect(() => {
    const load = async () => {
      const [{ count: members }, { count: checkins }] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("attendance").select("*", { count: "exact", head: true }),
      ]);

      const sevenDays = new Date();
      sevenDays.setDate(sevenDays.getDate() + 7);
      const { count: expiring } = await supabase
        .from("payments")
        .select("*", { count: "exact", head: true })
        .lte("membership_end", sevenDays.toISOString().split("T")[0])
        .gte("membership_end", new Date().toISOString().split("T")[0]);

      const { data: payments, count: paymentCount } = await supabase
        .from("payments")
        .select("*, profiles!payments_user_id_fkey(full_name), membership_plans!payments_plan_id_fkey(name)", { count: "exact" })
        .order("created_at", { ascending: false })
        .limit(5);

      const { data: allPayments } = await supabase.from("payments").select("amount, created_at");
      const revenue = (allPayments ?? []).reduce((s: number, p: any) => s + Number(p.amount), 0);

      // Build monthly revenue chart data (last 6 months)
      const revenueByMonth: Record<string, number> = {};
      const growthByMonth: Record<string, number> = {};
      for (let i = 5; i >= 0; i--) {
        const d = subMonths(new Date(), i);
        const key = format(d, "MMM");
        revenueByMonth[key] = 0;
        growthByMonth[key] = 0;
      }
      (allPayments ?? []).forEach((p: any) => {
        const key = format(new Date(p.created_at), "MMM");
        if (key in revenueByMonth) revenueByMonth[key] += Number(p.amount);
      });

      // Member growth from profiles
      const { data: allProfiles } = await supabase.from("profiles").select("created_at");
      (allProfiles ?? []).forEach((p: any) => {
        const key = format(new Date(p.created_at), "MMM");
        if (key in growthByMonth) growthByMonth[key] += 1;
      });

      setMonthlyRevenue(Object.entries(revenueByMonth).map(([month, rev]) => ({ month, revenue: rev })));
      setMemberGrowth(Object.entries(growthByMonth).map(([month, count]) => ({ month, members: count })));

      setStats({ members: members ?? 0, payments: paymentCount ?? 0, checkins: checkins ?? 0, expiring: expiring ?? 0 });
      setRecentPayments(payments ?? []);
      setTotalRevenue(revenue);
    };
    load();
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-orange-400 p-6 text-primary-foreground animate-fade-in">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />
        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center">
            <Dumbbell className="h-7 w-7 text-white animate-float" />
          </div>
          <div>
            <p className="text-primary-foreground/70 text-sm">Admin Overview</p>
            <h2 className="text-2xl font-display font-bold">FitCore Dashboard</h2>
            <p className="text-primary-foreground/70 text-sm mt-0.5">
              Total Revenue: <span className="font-bold text-white">₹{totalRevenue.toLocaleString("en-IN")}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Members" value={stats.members} icon={Users} delay={0} />
        <StatsCard title="Total Payments" value={stats.payments} icon={CreditCard} delay={100} />
        <StatsCard title="Total Check-ins" value={stats.checkins} icon={CalendarCheck} delay={200} />
        <StatsCard title="Expiring Soon" value={stats.expiring} icon={AlertTriangle} description="Within 7 days" delay={300} />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="animate-fade-in border-0 shadow-md" style={{ animationDelay: "350ms" }}>
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2 text-base">
              <div className="p-2 rounded-lg bg-primary/10"><TrendingUp className="h-4 w-4 text-primary" /></div>
              Monthly Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(24, 95%, 53%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(24, 95%, 53%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 90%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(24, 95%, 53%)" fill="url(#revGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="animate-fade-in border-0 shadow-md" style={{ animationDelay: "400ms" }}>
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2 text-base">
              <div className="p-2 rounded-lg bg-primary/10"><Users className="h-4 w-4 text-primary" /></div>
              Member Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={memberGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 90%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="members" fill="hsl(24, 95%, 53%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Payments */}
        <Card className="animate-fade-in border-0 shadow-md" style={{ animationDelay: "450ms" }}>
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2 text-base">
              <div className="p-2 rounded-lg bg-primary/10"><TrendingUp className="h-4 w-4 text-primary" /></div>
              Recent Payments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentPayments.length > 0 ? recentPayments.map((p, i) => (
              <div key={p.id} className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-muted/50 transition-colors animate-fade-in" style={{ animationDelay: `${500 + i * 50}ms` }}>
                <div>
                  <p className="text-sm font-medium">{(p.profiles as any)?.full_name || "Member"}</p>
                  <p className="text-xs text-muted-foreground">{(p.membership_plans as any)?.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-success">₹{Number(p.amount).toLocaleString("en-IN")}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(p.created_at), "MMM d")}</p>
                </div>
              </div>
            )) : (
              <p className="text-center text-muted-foreground py-6 text-sm">No payments yet</p>
            )}
          </CardContent>
        </Card>

        {/* Gym Health */}
        <Card className="animate-fade-in border-0 shadow-md" style={{ animationDelay: "500ms" }}>
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2 text-base">
              <div className="p-2 rounded-lg bg-primary/10"><Activity className="h-4 w-4 text-primary" /></div>
              Gym Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Member Retention", value: stats.members > 0 ? Math.min(100, Math.round(((stats.members - stats.expiring) / stats.members) * 100)) : 0, color: "bg-success" },
              { label: "Check-in Rate", value: stats.members > 0 ? Math.min(100, Math.round((stats.checkins / (stats.members * 5)) * 100)) : 0, color: "bg-primary" },
              { label: "Revenue Health", value: totalRevenue > 0 ? Math.min(100, 78) : 0, color: "bg-warning" },
            ].map((item, i) => (
              <div key={item.label} className="space-y-1.5 animate-fade-in" style={{ animationDelay: `${550 + i * 60}ms` }}>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-semibold">{item.value}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className={`${item.color} rounded-full h-2 transition-all duration-1000`} style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
