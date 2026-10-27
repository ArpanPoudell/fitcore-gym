import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  gradient?: string;
  delay?: number;
}

export default function StatsCard({ title, value, icon: Icon, description, gradient, delay = 0 }: StatsCardProps) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl p-6 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Glass background */}
      <div className="absolute inset-0 bg-card border border-border rounded-2xl transition-all duration-500 group-hover:border-primary/40 group-hover:shadow-[0_0_30px_hsl(var(--primary)/0.15)]" />

      {/* Gradient accent blob */}
      <div className={cn(
        "absolute -top-6 -right-6 w-28 h-28 rounded-full opacity-20 blur-2xl transition-all duration-500 group-hover:opacity-40 group-hover:scale-125",
        gradient || "bg-primary"
      )} />

      {/* Shimmer line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-4xl font-bold font-display text-foreground tracking-tight">{value}</p>
          {description && <p className="mt-1.5 text-xs text-muted-foreground">{description}</p>}
        </div>
        <div className={cn(
          "rounded-xl p-3 transition-all duration-300 group-hover:scale-110",
          "bg-primary/10 text-primary"
        )}>
          <Icon className="h-6 w-6" />
        </div>
      </div>

      {/* Bottom accent bar */}
      <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary/60 to-transparent w-0 group-hover:w-full transition-all duration-500 rounded-full" />
    </div>
  );
}
