import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import {
  Dumbbell, ArrowRight, Shield, Users, CreditCard, CalendarCheck,
  Star, TrendingUp, Clock, ChevronDown, Zap, CheckCircle2,
  Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin,
  Monitor, Heart, Award, Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

/* ---------- Scroll-reveal hook ---------- */
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ---------- Parallax hook ---------- */
function useParallax() {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const handler = () => setOffset(window.scrollY);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);
  return offset;
}

/* ---------- Animated counter ---------- */
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const { ref, visible } = useReveal(0.3);
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = Math.ceil(to / 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= to) { setCount(to); clearInterval(timer); }
      else setCount(start);
    }, 20);
    return () => clearInterval(timer);
  }, [visible, to]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ---------- Data ---------- */
const features = [
  { icon: Users, title: "Member Management", desc: "Track all members, their profiles, and membership history from one dashboard." },
  { icon: CreditCard, title: "Payment Tracking", desc: "UPI, card, wallets — collect and monitor payments with full billing history." },
  { icon: CalendarCheck, title: "Attendance System", desc: "Instant check-in / check-out with real-time attendance tracking." },
  { icon: Shield, title: "Admin Controls", desc: "Role-based access so admins see everything and members see their own data." },
  { icon: TrendingUp, title: "Analytics", desc: "Visualise revenue trends, membership growth, and expiring plans." },
  { icon: Clock, title: "Expiry Alerts", desc: "Automatic notifications for memberships expiring in the next 14 days." },
];

const reviews = [
  { name: "Aarav Sharma", location: "Mumbai, Maharashtra", stars: 5, text: "FitCore completely transformed how we manage our gym. Payment tracking is seamless and members love the UPI checkout. Highly recommend!", role: "Gym Owner", avatar: "AS" },
  { name: "Priya Nair", location: "Kochi, Kerala", stars: 5, text: "The attendance system is a game-changer. No more manual registers — check-in takes two seconds and everything syncs instantly.", role: "Fitness Trainer", avatar: "PN" },
  { name: "Rohit Verma", location: "Delhi, NCR", stars: 5, text: "As a member, I can see my payment history, attendance, and membership status all in one place. The UI is super clean and fast.", role: "Gym Member", avatar: "RV" },
  { name: "Sneha Kulkarni", location: "Pune, Maharashtra", stars: 5, text: "Switching from spreadsheets to FitCore saved us hours every week. The expiry alerts mean we never miss a renewal anymore.", role: "Gym Administrator", avatar: "SK" },
  { name: "Karthik Rajan", location: "Chennai, Tamil Nadu", stars: 5, text: "The admin dashboard is incredibly detailed. I can see who's active, whose membership is expiring, and all payment records at a glance.", role: "Gym Owner", avatar: "KR" },
  { name: "Divya Mehta", location: "Ahmedabad, Gujarat", stars: 4, text: "Very intuitive for both admins and members. The notification system is a great touch. Would love more plan customisation options!", role: "Fitness Coach", avatar: "DM" },
];

const stats = [
  { value: 6, suffix: "+", label: "Core Modules" },
  { value: 100, suffix: "%", label: "Open Source" },
  { value: 1, suffix: "", label: "SaaS Prototype" },
];

const avatarColors = [
  "hsl(24 95% 53%)", "hsl(220 80% 55%)", "hsl(152 60% 42%)",
  "hsl(270 70% 55%)", "hsl(0 70% 55%)", "hsl(38 92% 50%)",
];

const laptopFeatures = [
  { icon: Monitor, title: "Real-time Dashboard", desc: "Live member activity, revenue charts, and attendance tracking at a glance." },
  { icon: Heart, title: "Member Experience", desc: "Beautiful member portal with payment history, profile management, and notifications." },
  { icon: Award, title: "Smart Analytics", desc: "AI-powered insights on member retention, revenue trends, and gym performance." },
  { icon: Target, title: "Goal Tracking", desc: "Set and monitor gym-wide goals for memberships, revenue, and engagement." },
];

export default function Index() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const scrollY = useParallax();

  const heroReveal = useReveal(0.1);
  const featReveal = useReveal(0.1);
  const laptopReveal = useReveal(0.1);
  const statsReveal = useReveal(0.15);
  const reviewReveal = useReveal(0.1);
  const aboutReveal = useReveal(0.1);
  const ctaReveal = useReveal(0.2);

  useEffect(() => {
    if (!loading && user && role) navigate(role === "admin" ? "/admin" : "/member");
  }, [user, role, loading, navigate]);

  return (
    <div className="flex min-h-screen flex-col bg-background overflow-x-hidden">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
            <Dumbbell className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold">FitCore</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors story-link">Features</a>
          <a href="#showcase" className="hover:text-foreground transition-colors story-link">Showcase</a>
          <a href="#reviews" className="hover:text-foreground transition-colors story-link">Reviews</a>
          <a href="#about" className="hover:text-foreground transition-colors story-link">About Us</a>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="outline" size="sm" onClick={() => navigate("/auth")}>Sign In</Button>
          <Button size="sm" onClick={() => navigate("/auth")}>Get Started</Button>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center px-6 pt-24 pb-20 text-center overflow-hidden">
        <div className="absolute top-20 left-1/4 w-72 h-72 rounded-full bg-primary/10 blur-3xl animate-float pointer-events-none" style={{ transform: `translateY(${scrollY * 0.1}px)` }} />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl animate-float pointer-events-none" style={{ animationDelay: "2s", transform: `translateY(${scrollY * -0.05}px)` }} />

        <div ref={heroReveal.ref} className={`max-w-4xl space-y-6 transition-all duration-700 ${heroReveal.visible ? "animate-fade-in opacity-100" : "opacity-0 translate-y-8"}`}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-accent text-sm font-medium text-primary mb-2">
            <Zap className="h-3.5 w-3.5" />
            India's Smartest Gym Management Platform
          </div>
          <h1 className="font-display text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl leading-tight">
            Manage Your <span className="text-gradient">Gym</span><br />Effortlessly
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Complete membership management, UPI payments, attendance tracking, and real-time analytics — all in one powerful platform built for Indian gyms.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
            <Button size="lg" className="gradient-primary border-0 text-primary-foreground px-8 py-6 text-base shadow-lg hover:shadow-primary/25 hover:shadow-xl transition-all hover:scale-105 duration-300" onClick={() => navigate("/auth")}>
              Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-6 text-base hover:scale-105 transition-all duration-300" onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}>
              See Features <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap justify-center gap-4 pt-4 text-sm text-muted-foreground">
            {["No credit card required", "Free 30-day trial", "Cancel anytime"].map(t => (
              <span key={t} className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary" />{t}</span>
            ))}
          </div>
        </div>

        <div className="mt-16 flex gap-4 flex-wrap justify-center">
          {["UPI Payments", "Real-time Attendance", "Member Notifications", "Admin Dashboard"].map((tag, i) => (
            <span key={tag} className="px-4 py-2 rounded-full bg-card border border-border text-sm font-medium shadow-sm animate-fade-in hover-scale" style={{ animationDelay: `${i * 0.1 + 0.4}s` }}>
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="px-6 py-24 bg-muted/30">
        <div ref={featReveal.ref} className={`max-w-6xl mx-auto transition-all duration-700 ${featReveal.visible ? "animate-fade-in opacity-100" : "opacity-0 translate-y-8"}`}>
          <div className="text-center mb-14 space-y-3">
            <p className="text-sm font-medium text-primary uppercase tracking-widest">Everything You Need</p>
            <h2 className="font-display text-4xl font-bold">Built for Modern Gyms</h2>
            <p className="text-muted-foreground max-w-md mx-auto">One platform to run your entire gym — from day-one member onboarding to recurring payments.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={f.title} className="group rounded-2xl border bg-card p-6 space-y-4 hover:shadow-xl hover:-translate-y-2 transition-all duration-500 animate-fade-in" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <f.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="font-display font-semibold text-lg">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Laptop Showcase ── */}
      <section id="showcase" className="px-6 py-24 overflow-hidden">
        <div ref={laptopReveal.ref} className={`max-w-6xl mx-auto transition-all duration-1000 ${laptopReveal.visible ? "opacity-100" : "opacity-0"}`}>
          <div className="text-center mb-16 space-y-3">
            <p className="text-sm font-medium text-primary uppercase tracking-widest">See It In Action</p>
            <h2 className="font-display text-4xl font-bold">Powerful Dashboard at Your Fingertips</h2>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Laptop mockup */}
            <div className={`flex-1 transition-all duration-1000 delay-200 ${laptopReveal.visible ? "animate-fade-in-left" : "opacity-0 -translate-x-12"}`}>
              <div className="relative mx-auto max-w-lg">
                {/* Laptop body */}
                <div className="relative rounded-2xl border-[3px] border-foreground/20 bg-card overflow-hidden shadow-2xl">
                  {/* Top bar */}
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/60 border-b border-border">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-destructive/70" />
                      <div className="w-3 h-3 rounded-full bg-warning/70" />
                      <div className="w-3 h-3 rounded-full bg-success/70" />
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="w-full max-w-xs mx-auto h-6 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground">
                        fitcoregym.lovable.app/admin
                      </div>
                    </div>
                  </div>
                  {/* Screen content */}
                  <div className="p-4 space-y-3 bg-background">
                    {/* Mini header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded gradient-primary flex items-center justify-center">
                          <Dumbbell className="h-3 w-3 text-primary-foreground" />
                        </div>
                        <span className="text-xs font-bold font-display">FitCore</span>
                      </div>
                      <div className="flex gap-1">
                        <div className="w-6 h-6 rounded-full bg-primary/10" />
                      </div>
                    </div>
                    {/* Mini stats */}
                    <div className="grid grid-cols-4 gap-2">
                      {[{ l: "Members", v: "156" }, { l: "Revenue", v: "₹2.4L" }, { l: "Check-ins", v: "89" }, { l: "Expiring", v: "12" }].map(s => (
                        <div key={s.l} className="rounded-lg bg-muted/50 p-2 text-center">
                          <p className="text-[10px] text-muted-foreground">{s.l}</p>
                          <p className="text-xs font-bold">{s.v}</p>
                        </div>
                      ))}
                    </div>
                    {/* Mini chart */}
                    <div className="rounded-lg bg-muted/30 p-3">
                      <p className="text-[10px] text-muted-foreground mb-2">Monthly Revenue</p>
                      <div className="flex items-end gap-1 h-16">
                        {[40, 65, 55, 80, 70, 95].map((h, i) => (
                          <div key={i} className="flex-1 rounded-t gradient-primary transition-all duration-700" style={{ height: `${laptopReveal.visible ? h : 0}%`, transitionDelay: `${800 + i * 100}ms` }} />
                        ))}
                      </div>
                    </div>
                    {/* Mini list */}
                    <div className="space-y-1.5">
                      {["Aarav Sharma — ₹2,999", "Priya Nair — ₹1,499", "Rohit Verma — ₹999"].map(t => (
                        <div key={t} className="flex items-center justify-between text-[10px] px-2 py-1.5 rounded-md bg-muted/30">
                          <span>{t.split("—")[0]}</span>
                          <span className="font-semibold text-success">{t.split("—")[1]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Laptop base */}
                <div className="mx-auto w-[110%] h-4 bg-foreground/15 rounded-b-2xl -mt-1 relative left-[-5%]" />
                <div className="mx-auto w-[30%] h-1.5 bg-foreground/10 rounded-b-lg" />

                {/* Glow */}
                <div className="absolute -inset-8 bg-primary/10 rounded-3xl blur-3xl -z-10 animate-float" />
              </div>
            </div>

            {/* Feature list */}
            <div className={`flex-1 space-y-6 transition-all duration-1000 delay-400 ${laptopReveal.visible ? "animate-fade-in-right" : "opacity-0 translate-x-12"}`}>
              {laptopFeatures.map((f, i) => (
                <div key={f.title} className="flex gap-4 group animate-fade-in" style={{ animationDelay: `${600 + i * 150}ms` }}>
                  <div className="shrink-0 w-12 h-12 rounded-xl gradient-primary flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <f.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-lg">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-1">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section id="stats" className="px-6 py-24 gradient-primary">
        <div ref={statsReveal.ref} className={`max-w-5xl mx-auto transition-all duration-700 ${statsReveal.visible ? "animate-fade-in opacity-100" : "opacity-0 translate-y-8"}`}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center text-primary-foreground">
            {stats.map((s) => (
              <div key={s.label} className="space-y-2">
                <p className="font-display text-4xl sm:text-5xl font-bold"><Counter to={s.value} suffix={s.suffix} /></p>
                <p className="text-primary-foreground/70 text-sm font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Reviews ── */}
      <section id="reviews" className="px-6 py-24">
        <div ref={reviewReveal.ref} className={`max-w-6xl mx-auto transition-all duration-700 ${reviewReveal.visible ? "animate-fade-in opacity-100" : "opacity-0 translate-y-8"}`}>
          <div className="text-center mb-14 space-y-3">
            <p className="text-sm font-medium text-primary uppercase tracking-widest">Loved Across India</p>
            <h2 className="font-display text-4xl font-bold">What Our Users Say</h2>
            <p className="text-muted-foreground max-w-md mx-auto">Real reviews from gym owners, admins, and members using FitCore every day.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((r, i) => (
              <div key={r.name} className="rounded-2xl border bg-card p-6 space-y-4 hover:shadow-xl hover:-translate-y-2 transition-all duration-500 animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="flex gap-1">
                  {Array.from({ length: r.stars }).map((_, si) => <Star key={si} className="h-4 w-4 fill-primary text-primary" />)}
                  {Array.from({ length: 5 - r.stars }).map((_, si) => <Star key={si} className="h-4 w-4 text-muted-foreground/30" />)}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed italic">"{r.text}"</p>
                <div className="flex items-center gap-3 pt-2 border-t border-border">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ background: avatarColors[i % avatarColors.length] }}>{r.avatar}</div>
                  <div>
                    <p className="font-semibold text-sm">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.role} · {r.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About Us ── */}
      <section id="about" className="px-6 py-24 bg-muted/30">
        <div ref={aboutReveal.ref} className={`max-w-5xl mx-auto transition-all duration-700 ${aboutReveal.visible ? "animate-fade-in opacity-100" : "opacity-0 translate-y-8"}`}>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <p className="text-sm font-medium text-primary uppercase tracking-widest">About Us</p>
              <h2 className="font-display text-4xl font-bold">We're on a Mission to Digitize Every Gym in India</h2>
              <p className="text-muted-foreground leading-relaxed">
                FitCore was born out of a simple frustration — gym owners across India were still managing memberships on paper registers and WhatsApp groups. We built a platform that's powerful enough for chains, yet simple enough for a local gym down the street.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Our team is passionate about fitness and technology. We believe every gym member deserves a seamless experience, and every gym owner deserves tools that save them time and grow their business.
              </p>
              <div className="grid grid-cols-3 gap-4 pt-4">
                {[{ v: "2024", l: "Founded" }, { v: "45+", l: "Gym Partners" }, { v: "24/7", l: "Support" }].map(s => (
                  <div key={s.l} className="text-center p-4 rounded-xl bg-card border border-border">
                    <p className="font-display font-bold text-2xl text-primary">{s.v}</p>
                    <p className="text-xs text-muted-foreground mt-1">{s.l}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border border-primary/10 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 mx-auto rounded-2xl gradient-primary flex items-center justify-center animate-float">
                    <Dumbbell className="h-12 w-12 text-primary-foreground" />
                  </div>
                  <h3 className="font-display text-2xl font-bold">FitCore</h3>
                  <p className="text-muted-foreground text-sm">India's Gym Platform</p>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl animate-float" style={{ animationDelay: "1s" }} />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/5 rounded-full blur-2xl animate-float" style={{ animationDelay: "3s" }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 py-24">
        <div ref={ctaReveal.ref} className={`max-w-3xl mx-auto text-center space-y-6 transition-all duration-700 ${ctaReveal.visible ? "animate-scale-in opacity-100" : "opacity-0 scale-95"}`}>
          <h2 className="font-display text-4xl font-bold">Ready to Transform Your Gym?</h2>
          <p className="text-muted-foreground text-lg">Join hundreds of gym owners across India who manage smarter with FitCore.</p>
          <Button size="lg" className="gradient-primary border-0 text-primary-foreground px-10 py-6 text-base shadow-lg hover:shadow-primary/25 hover:shadow-xl hover:scale-105 transition-all duration-300" onClick={() => navigate("/auth")}>
            Get Started for Free <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
                  <Dumbbell className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-display text-xl font-bold">FitCore</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                India's smartest gym management platform. Built for fitness businesses of all sizes.
              </p>
              <div className="flex gap-3">
                {[
                  { icon: Facebook, href: "https://facebook.com" },
                  { icon: Instagram, href: "https://instagram.com" },
                  { icon: Twitter, href: "https://twitter.com" },
                  { icon: Youtube, href: "https://youtube.com" },
                ].map((s, i) => (
                  <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110">
                    <s.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Product */}
            <div className="space-y-4">
              <h4 className="font-display font-semibold">Product</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                {["Features", "Pricing", "Reviews", "FAQ"].map(l => (
                  <li key={l}><a href={`#${l.toLowerCase()}`} className="hover:text-foreground transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div className="space-y-4">
              <h4 className="font-display font-semibold">Company</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><a href="#about" className="hover:text-foreground transition-colors">About Us</a></li>
                <li><Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
                <li><Link to="/refund" className="hover:text-foreground transition-colors">Refund Policy</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h4 className="font-display font-semibold">Contact</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> support@fitcore.in</li>
                <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> +91 98765 43210</li>
                <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Mumbai, India</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} FitCore. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
              <Link to="/refund" className="hover:text-foreground transition-colors">Refund Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
