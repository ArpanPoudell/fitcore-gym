import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Dumbbell, LayoutDashboard, Users, CreditCard, CalendarCheck,
  Bell, ClipboardList, LogOut, Menu, X, ChevronRight, UserCircle, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";

const adminLinks = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/plans", icon: ClipboardList, label: "Plans" },
  { to: "/admin/members", icon: Users, label: "Members" },
  { to: "/admin/payments", icon: CreditCard, label: "Payments" },
  { to: "/admin/attendance", icon: CalendarCheck, label: "Attendance" },
  { to: "/admin/expiring", icon: Bell, label: "Expiring" },
];

const memberLinks = [
  { to: "/member", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/member/plans", icon: ClipboardList, label: "Plans" },
  { to: "/member/payments", icon: CreditCard, label: "Payments" },
  { to: "/member/attendance", icon: CalendarCheck, label: "Attendance" },
  { to: "/member/notifications", icon: Bell, label: "Notifications" },
  { to: "/member/profile", icon: User, label: "Profile" },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { role, signOut, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<{ full_name: string; avatar_url?: string | null } | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const links = role === "admin" ? adminLinks : memberLinks;

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name,avatar_url").eq("id", user.id).maybeSingle()
      .then(({ data }) => setProfile(data));
    supabase.from("notifications").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("is_read", false)
      .then(({ count }) => setUnreadCount(count ?? 0));
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 md:relative md:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Decorative gradient at top of sidebar */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

        <div className="relative flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="relative">
              <Dumbbell className="h-8 w-8 text-primary animate-float" />
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-md" />
            </div>
            <span className="font-display text-xl font-bold text-sidebar-primary-foreground">FitCore</span>
          </Link>
          <button className="ml-auto md:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {links.map((link, idx) => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 group",
                  active
                    ? "bg-primary text-primary-foreground shadow-[0_4px_20px_hsl(var(--primary)/0.4)]"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:translate-x-1"
                )}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {active && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary to-primary/70 -z-10" />
                )}
                <link.icon className="h-4 w-4 shrink-0" />
                {link.label}
                {link.label === "Notifications" && unreadCount > 0 && (
                  <span className="ml-auto text-xs bg-destructive text-destructive-foreground rounded-full px-1.5 py-0.5 font-bold animate-pulse">
                    {unreadCount}
                  </span>
                )}
                {active && <ChevronRight className="ml-auto h-4 w-4" />}
              </Link>
            );
          })}
        </nav>

        {/* User info at bottom */}
        <div className="border-t border-sidebar-border p-4 space-y-3">
          <div className="flex items-center gap-3">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-9 h-9 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
                {initials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-primary-foreground truncate">
                {profile?.full_name || "Member"}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center gap-4 border-b bg-card/80 backdrop-blur-sm px-6 py-3 sticky top-0 z-30">
          <button className="md:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2">
            <h1 className="font-display text-lg font-semibold capitalize">
              {links.find(l => l.to === location.pathname)?.label || "Dashboard"}
            </h1>
          </div>

          {/* Breadcrumb path */}
          <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>FitCore</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground capitalize">
              {links.find(l => l.to === location.pathname)?.label || "Dashboard"}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />

            {/* Role badge */}
            <span className="text-xs font-semibold uppercase tracking-wider rounded-full px-3 py-1 bg-primary/10 text-primary border border-primary/20">
              {role}
            </span>

            {/* Notification bell */}
            {role === "member" && (
              <Button variant="ghost" size="icon" className="relative" onClick={() => navigate("/member/notifications")}>
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full animate-pulse" />
                )}
              </Button>
            )}

            {/* Profile dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold text-xs">
                      {initials}
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2 flex items-center gap-3">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold">
                      {initials}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold">{profile?.full_name || "Member"}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                {role === "member" && (
                  <DropdownMenuItem onClick={() => navigate("/member/profile")}>
                    <UserCircle className="mr-2 h-4 w-4" />
                    My Profile
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
