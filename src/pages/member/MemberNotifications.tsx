import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Check, BellOff, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface Notification { id: string; title: string; message: string; is_read: boolean; created_at: string; }

export default function MemberNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setNotifications((data as Notification[]) ?? []);
  };

  useEffect(() => { load(); }, [user]);

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    load();
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    await Promise.all(unread.map(n => supabase.from("notifications").update({ is_read: true }).eq("id", n.id)));
    load();
  };

  const unread = notifications.filter(n => !n.is_read);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h2 className="text-2xl font-display font-bold">Notifications</h2>
          {unread.length > 0 && (
            <p className="text-sm text-muted-foreground mt-0.5">{unread.length} unread message{unread.length > 1 ? "s" : ""}</p>
          )}
        </div>
        {unread.length > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} className="gap-2">
            <Check className="h-4 w-4" /> Mark all read
          </Button>
        )}
      </div>

      {/* Unread */}
      {unread.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">New</p>
          {unread.map((n, i) => (
            <div
              key={n.id}
              className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 to-transparent p-4 flex items-start gap-4 animate-fade-in group hover:border-primary/40 transition-all"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-primary rounded-l-2xl" />
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <BellRing className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{n.title}</p>
                <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
                <p className="text-xs text-muted-foreground mt-2">{format(new Date(n.created_at), "MMM d, yyyy 'at' h:mm a")}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markRead(n.id)}
                className="shrink-0 hover:bg-success/10 hover:text-success"
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Read */}
      {notifications.filter(n => n.is_read).length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Earlier</p>
          {notifications.filter(n => n.is_read).map((n, i) => (
            <div
              key={n.id}
              className="rounded-2xl border border-border bg-card p-4 flex items-start gap-4 animate-fade-in opacity-70 hover:opacity-100 transition-opacity"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                <Bell className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-muted-foreground">{n.title}</p>
                <p className="text-sm text-muted-foreground/70 mt-0.5">{n.message}</p>
                <p className="text-xs text-muted-foreground/50 mt-2">{format(new Date(n.created_at), "MMM d, yyyy 'at' h:mm a")}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {notifications.length === 0 && (
        <div className="text-center py-16 animate-fade-in">
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BellOff className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <p className="font-medium text-muted-foreground">No notifications yet</p>
          <p className="text-sm text-muted-foreground/60 mt-1">You're all caught up!</p>
        </div>
      )}
    </div>
  );
}
