import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dumbbell, Star, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const quotes = [
  { text: "FitCore saved us hours every week. The best investment for our gym.", author: "Aarav Sharma", role: "Gym Owner, Mumbai" },
  { text: "Attendance tracking is flawless. Members love checking in digitally.", author: "Priya Nair", role: "Trainer, Kochi" },
  { text: "UPI payments integrated beautifully. Collections are now stress-free.", author: "Rohit Verma", role: "Gym Admin, Delhi" },
];

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const { signIn, signUp, user, role, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user && role) navigate(role === "admin" ? "/admin" : "/member");
  }, [user, role, authLoading, navigate]);

  useEffect(() => {
    const t = setInterval(() => setQuoteIdx(i => (i + 1) % quotes.length), 4000);
    return () => clearInterval(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } else {
      const { error } = await signUp(email, password, fullName);
      if (error) {
        toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Account created!", description: "Check your email to confirm, then sign in." });
        setIsLogin(true);
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen">

      {/* ── Left panel (branding) ── */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary flex-col justify-between p-12 text-primary-foreground relative overflow-hidden">
        {/* decorative circles */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute bottom-20 -left-10 w-48 h-48 rounded-full bg-white/10 pointer-events-none" />

        <div>
          <button onClick={() => navigate("/")} className="flex items-center gap-2 mb-12 opacity-90 hover:opacity-100 transition-opacity">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back to home</span>
          </button>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Dumbbell className="h-6 w-6" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold">FitCore</p>
              <p className="text-xs opacity-70">Gym Management Platform</p>
            </div>
          </div>
          <h1 className="font-display text-4xl font-bold leading-tight">
            Your gym.<br />Your data.<br />Your control.
          </h1>
          <p className="mt-4 opacity-80 text-sm leading-relaxed max-w-xs">
            Manage memberships, payments, attendance and notifications all from one seamless dashboard.
          </p>
        </div>

        {/* Rotating testimonial */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 space-y-3 animate-fade-in">
          <div className="flex gap-1">
            {[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 fill-white text-white" />)}
          </div>
          <p className="text-sm leading-relaxed opacity-90 italic transition-all duration-500">
            "{quotes[quoteIdx].text}"
          </p>
          <div>
            <p className="font-semibold text-sm">{quotes[quoteIdx].author}</p>
            <p className="text-xs opacity-70">{quotes[quoteIdx].role}</p>
          </div>
        </div>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex flex-1 items-center justify-center p-6 lg:p-16 bg-background">
        <div className="w-full max-w-md space-y-8 animate-fade-in">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
              <Dumbbell className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold">FitCore</span>
          </div>

          <div>
            <h2 className="font-display text-3xl font-bold">{isLogin ? "Welcome back 👋" : "Create account"}</h2>
            <p className="mt-2 text-muted-foreground text-sm">
              {isLogin ? "Sign in to access your dashboard" : "Join FitCore and manage your gym"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Rahul Gupta"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPass ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 gradient-primary border-0 text-primary-foreground text-sm font-semibold shadow-md hover:shadow-lg transition-shadow"
              disabled={loading}
            >
              {loading ? "Please wait…" : isLogin ? "Sign In →" : "Create Account →"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs text-muted-foreground bg-background px-3">or</div>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              className="text-primary font-semibold hover:underline"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>

          <p className="text-center text-xs text-muted-foreground">
            By continuing you agree to our{" "}
            <span className="text-primary cursor-pointer hover:underline">Terms of Service</span>{" "}
            and{" "}
            <span className="text-primary cursor-pointer hover:underline">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
}
