import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  description: string;
  duration_days: number;
  price: number;
  is_active: boolean;
}

export default function AdminPlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [form, setForm] = useState({ name: "", description: "", duration_days: 30, price: 0 });
  const { toast } = useToast();

  const load = async () => {
    const { data } = await supabase.from("membership_plans").select("*").order("price");
    setPlans((data as Plan[]) ?? []);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm({ name: "", description: "", duration_days: 30, price: 0 }); setOpen(true); };
  const openEdit = (p: Plan) => { setEditing(p); setForm({ name: p.name, description: p.description, duration_days: p.duration_days, price: p.price }); setOpen(true); };

  const handleSave = async () => {
    if (editing) {
      await supabase.from("membership_plans").update(form).eq("id", editing.id);
      toast({ title: "Plan updated" });
    } else {
      await supabase.from("membership_plans").insert(form);
      toast({ title: "Plan created" });
    }
    setOpen(false);
    load();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("membership_plans").delete().eq("id", id);
    toast({ title: "Plan deleted" });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold">Membership Plans</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" />Add Plan</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Plan" : "New Plan"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Duration (days)</Label><Input type="number" value={form.duration_days} onChange={e => setForm({ ...form, duration_days: +e.target.value })} /></div>
                <div><Label>Price ($)</Label><Input type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: +e.target.value })} /></div>
              </div>
              <Button onClick={handleSave} className="w-full">Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} className="animate-fade-in">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="font-display">{plan.name}</CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(plan)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(plan.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{plan.description}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-display font-bold">${plan.price}</span>
                <span className="text-sm text-muted-foreground">/ {plan.duration_days} days</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
