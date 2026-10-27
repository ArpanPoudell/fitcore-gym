import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, Phone, Mail, Shield, Camera, Save, Edit3, CheckCircle, Upload, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function MemberProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "" });
  const [activeMembership, setActiveMembership] = useState<any>(null);

  const load = async () => {
    if (!user) return;
    const [{ data: prof }, { data: membership }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("payments")
        .select("*, membership_plans!payments_plan_id_fkey(name, duration_days)")
        .eq("user_id", user.id)
        .gte("membership_end", new Date().toISOString().split("T")[0])
        .order("membership_end", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);
    setProfile(prof);
    setForm({ full_name: prof?.full_name || "", phone: prof?.phone || "" });
    setActiveMembership(membership);
  };

  useEffect(() => { load(); }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please select an image file.", variant: "destructive" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 2MB allowed.", variant: "destructive" });
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    const avatarUrl = `${publicUrl}?t=${Date.now()}`;

    await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("id", user.id);
    toast({ title: "Avatar updated! 🎉" });
    setUploading(false);
    load();
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: form.full_name,
      phone: form.phone,
      email: user.email || "",
    });
    setSaving(false);
    if (error) {
      toast({ title: "Error saving", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated! ✅", description: "Your details have been saved." });
      setEditing(false);
      load();
    }
  };

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />

      {/* Profile Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-orange-400 p-8 text-primary-foreground animate-fade-in">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-24 translate-x-24" />
        <div className="flex items-center gap-6">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="w-20 h-20 rounded-2xl object-cover border-2 border-white/40 shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center text-3xl font-bold shadow-lg">
                {initials}
              </div>
            )}
            <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {uploading ? (
                <Loader2 className="h-5 w-5 text-white animate-spin" />
              ) : (
                <Camera className="h-5 w-5 text-white" />
              )}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold">
              {profile?.full_name || "Your Profile"}
            </h2>
            <p className="text-primary-foreground/70 text-sm mt-1">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full font-medium border border-white/30">
                🏋️ Gym Member
              </span>
              {activeMembership && (
                <span className="text-xs bg-success/80 px-2 py-0.5 rounded-full font-medium">
                  ✅ Active Plan
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <Card className="animate-fade-in border-0 shadow-md" style={{ animationDelay: "100ms" }}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-display flex items-center gap-2 text-base">
            <div className="p-2 rounded-lg bg-primary/10">
              <User className="h-4 w-4 text-primary" />
            </div>
            Personal Information
          </CardTitle>
          {!editing ? (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="gap-2">
              <Edit3 className="h-4 w-4" /> Edit
            </Button>
          ) : (
            <Button size="sm" onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
                <User className="h-3.5 w-3.5 text-muted-foreground" /> Full Name
              </Label>
              <Input id="name" value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} disabled={!editing} placeholder="Enter your full name" className={editing ? "border-primary/40 focus:ring-primary/20" : "bg-muted/30"} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" /> Phone Number
              </Label>
              <Input id="phone" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} disabled={!editing} placeholder="+91 98765 43210" className={editing ? "border-primary/40 focus:ring-primary/20" : "bg-muted/30"} />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Email Address
              </Label>
              <div className="flex items-center gap-2">
                <Input value={user?.email || ""} disabled className="bg-muted/30 flex-1" />
                <span className="text-xs text-success flex items-center gap-1 whitespace-nowrap">
                  <CheckCircle className="h-3.5 w-3.5" /> Verified
                </span>
              </div>
            </div>
          </div>
          {editing && (
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} disabled={saving} className="flex-1">{saving ? "Saving..." : "Save Changes"}</Button>
              <Button variant="outline" onClick={() => { setEditing(false); setForm({ full_name: profile?.full_name || "", phone: profile?.phone || "" }); }}>Cancel</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Membership Info */}
      <Card className="animate-fade-in border-0 shadow-md" style={{ animationDelay: "200ms" }}>
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2 text-base">
            <div className="p-2 rounded-lg bg-primary/10"><Shield className="h-4 w-4 text-primary" /></div>
            Membership Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeMembership ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-success/5 border border-success/20">
                <span className="text-sm text-muted-foreground">Plan</span>
                <span className="font-semibold text-sm">{activeMembership.membership_plans?.name}</span>
              </div>
              <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-muted/30">
                <span className="text-sm text-muted-foreground">Start Date</span>
                <span className="font-medium text-sm">{format(new Date(activeMembership.membership_start), "MMM d, yyyy")}</span>
              </div>
              <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-muted/30">
                <span className="text-sm text-muted-foreground">Expiry Date</span>
                <span className="font-medium text-sm">{format(new Date(activeMembership.membership_end), "MMM d, yyyy")}</span>
              </div>
              <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-muted/30">
                <span className="text-sm text-muted-foreground">Amount Paid</span>
                <span className="font-semibold text-sm">₹{Number(activeMembership.amount).toLocaleString("en-IN")}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <Shield className="h-10 w-10 mx-auto mb-2 text-muted-foreground/40" />
              <p className="text-muted-foreground text-sm">No active membership</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card className="animate-fade-in border-0 shadow-md" style={{ animationDelay: "300ms" }}>
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2 text-base">
            <div className="p-2 rounded-lg bg-primary/10"><Shield className="h-4 w-4 text-primary" /></div>
            Account Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-muted/30">
            <span className="text-sm text-muted-foreground">Account created</span>
            <span className="text-sm font-medium">{profile?.created_at ? format(new Date(profile.created_at), "MMM d, yyyy") : "—"}</span>
          </div>
          <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-success/5 border border-success/20">
            <span className="text-sm text-muted-foreground">Account status</span>
            <span className="text-sm font-semibold text-success flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" /> Active</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
