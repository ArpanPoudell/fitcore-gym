import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  CreditCard, Smartphone, Building2, Wallet, Check, Lock,
  ChevronRight, AlertCircle, Loader2, Shield
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Plan {
  id: string;
  name: string;
  description: string;
  duration_days: number;
  price: number;
}

interface PaymentCheckoutProps {
  plan: Plan | null;
  onClose: () => void;
  onSuccess: () => void;
}

type PaymentMethod = "upi" | "card" | "netbanking" | "wallet";
type Step = "method" | "details" | "otp" | "success";

const UPI_APPS = [
  { id: "gpay", name: "Google Pay", color: "#4285F4", initial: "G" },
  { id: "phonepe", name: "PhonePe", color: "#5F259F", initial: "P" },
  { id: "paytm", name: "Paytm", color: "#00BAF2", initial: "P" },
  { id: "bhim", name: "BHIM", color: "#006A4E", initial: "B" },
];

const BANKS = [
  "State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank",
  "Kotak Mahindra Bank", "Punjab National Bank", "Bank of Baroda", "Canara Bank",
];

const WALLETS = [
  { id: "paytm", name: "Paytm Wallet", color: "#00BAF2", initial: "P" },
  { id: "mobikwik", name: "MobiKwik", color: "#6CBE45", initial: "M" },
  { id: "freecharge", name: "Freecharge", color: "#FF5A00", initial: "F" },
  { id: "airtel", name: "Airtel Money", color: "#E40000", initial: "A" },
];

function formatCard(value: string) {
  return value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}
function formatExpiry(value: string) {
  const clean = value.replace(/\D/g, "").slice(0, 4);
  return clean.length > 2 ? clean.slice(0, 2) + "/" + clean.slice(2) : clean;
}

export default function PaymentCheckout({ plan, onClose, onSuccess }: PaymentCheckoutProps) {
  const [method, setMethod] = useState<PaymentMethod>("upi");
  const [step, setStep] = useState<Step>("method");
  const [processing, setProcessing] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const { toast } = useToast();

  // UPI
  const [upiId, setUpiId] = useState("");
  const [upiApp, setUpiApp] = useState<string | null>(null);
  const [upiIdError, setUpiIdError] = useState("");

  // Card
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});

  // Net Banking
  const [bank, setBank] = useState("");

  // Wallet
  const [wallet, setWallet] = useState<string | null>(null);

  if (!plan) return null;

  const validateUPI = () => {
    if (upiApp) { setUpiIdError(""); return true; }
    if (!upiId.match(/^[\w.\-_]{2,}@[\w]+$/)) {
      setUpiIdError("Enter a valid UPI ID (e.g. name@upi)");
      return false;
    }
    setUpiIdError("");
    return true;
  };

  const validateCard = () => {
    const errors: Record<string, string> = {};
    if (cardNumber.replace(/\s/g, "").length < 16) errors.cardNumber = "Enter a valid 16-digit card number";
    if (!cardName.trim()) errors.cardName = "Enter cardholder name";
    const [m, y] = expiry.split("/");
    if (!m || !y || parseInt(m) > 12 || parseInt(m) < 1) errors.expiry = "Enter valid expiry (MM/YY)";
    if (cvv.length < 3) errors.cvv = "Enter valid CVV";
    setCardErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProceed = async () => {
    if (method === "upi" && !validateUPI()) return;
    if (method === "card" && !validateCard()) return;
    if (method === "netbanking" && !bank) {
      toast({ title: "Select a bank", description: "Please select your bank to continue.", variant: "destructive" });
      return;
    }
    if (method === "wallet" && !wallet) {
      toast({ title: "Select a wallet", description: "Please select a wallet to continue.", variant: "destructive" });
      return;
    }

    setProcessing(true);
    await new Promise(r => setTimeout(r, 1800));
    setProcessing(false);
    setStep("otp");
  };

  const handleOTPVerify = async () => {
    if (otp.length < 6) { setOtpError("Enter the 6-digit OTP"); return; }
    setOtpError("");
    setProcessing(true);
    await new Promise(r => setTimeout(r, 1500));
    setProcessing(false);
    setStep("success");
    setTimeout(() => {
      onSuccess();
    }, 2000);
  };

  const methodLabel: Record<PaymentMethod, string> = {
    upi: "UPI",
    card: "Credit / Debit Card",
    netbanking: "Net Banking",
    wallet: "Wallets",
  };

  return (
    <Dialog open={!!plan} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden rounded-2xl">
        {/* Header */}
        <div className="gradient-primary text-primary-foreground px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs opacity-80 uppercase tracking-wider font-medium">FitCore Gym</p>
              <p className="text-xl font-display font-bold mt-0.5">₹{plan.price.toLocaleString()}</p>
              <p className="text-xs opacity-80 mt-0.5">{plan.name} · {plan.duration_days} days</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs opacity-80">
              <Lock className="h-3 w-3" />
              <span>Secure Payment</span>
            </div>
          </div>
        </div>

        {step === "method" && (
          <div className="p-6 space-y-4">
            <DialogHeader>
              <DialogTitle className="font-display text-base">Choose Payment Method</DialogTitle>
            </DialogHeader>

            {/* Method tabs */}
            <div className="grid grid-cols-4 gap-2">
              {(["upi", "card", "netbanking", "wallet"] as PaymentMethod[]).map((m) => {
                const Icon = m === "upi" ? Smartphone : m === "card" ? CreditCard : m === "netbanking" ? Building2 : Wallet;
                return (
                  <button
                    key={m}
                    onClick={() => setMethod(m)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-medium transition-all",
                      method === m
                        ? "border-primary bg-accent text-primary"
                        : "border-border bg-background text-muted-foreground hover:border-primary/40"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-center leading-tight">{methodLabel[m].split(" / ")[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* UPI */}
            {method === "upi" && (
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-2">
                  {UPI_APPS.map(app => (
                    <button
                      key={app.id}
                      onClick={() => { setUpiApp(app.id); setUpiId(""); setUpiIdError(""); }}
                      className={cn(
                        "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-medium transition-all",
                        upiApp === app.id ? "border-primary bg-accent" : "border-border hover:border-primary/40"
                      )}
                    >
                      <div className="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: app.color }}>
                        {app.initial}
                      </div>
                      <span className="text-center leading-tight text-muted-foreground">{app.name.split(" ")[0]}</span>
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground">or enter UPI ID</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">UPI ID</Label>
                  <Input
                    placeholder="yourname@upi"
                    value={upiId}
                    onChange={e => { setUpiId(e.target.value); setUpiApp(null); setUpiIdError(""); }}
                    className={cn(upiIdError && "border-destructive")}
                  />
                  {upiIdError && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{upiIdError}</p>}
                </div>
              </div>
            )}

            {/* Card */}
            {method === "card" && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">Card Number</Label>
                  <div className="relative">
                    <Input
                      placeholder="0000 0000 0000 0000"
                      value={cardNumber}
                      onChange={e => setCardNumber(formatCard(e.target.value))}
                      className={cn("pr-10", cardErrors.cardNumber && "border-destructive")}
                      maxLength={19}
                    />
                    <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                  {cardErrors.cardNumber && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{cardErrors.cardNumber}</p>}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Cardholder Name</Label>
                  <Input
                    placeholder="Name on card"
                    value={cardName}
                    onChange={e => setCardName(e.target.value)}
                    className={cn(cardErrors.cardName && "border-destructive")}
                  />
                  {cardErrors.cardName && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{cardErrors.cardName}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Expiry (MM/YY)</Label>
                    <Input
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={e => setExpiry(formatExpiry(e.target.value))}
                      maxLength={5}
                      className={cn(cardErrors.expiry && "border-destructive")}
                    />
                    {cardErrors.expiry && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{cardErrors.expiry}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">CVV</Label>
                    <Input
                      placeholder="•••"
                      type="password"
                      value={cvv}
                      onChange={e => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      maxLength={4}
                      className={cn(cardErrors.cvv && "border-destructive")}
                    />
                    {cardErrors.cvv && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{cardErrors.cvv}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Net Banking */}
            {method === "netbanking" && (
              <div className="space-y-2">
                <Label className="text-xs">Select Your Bank</Label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {BANKS.map(b => (
                    <button
                      key={b}
                      onClick={() => setBank(b)}
                      className={cn(
                        "text-left text-xs px-3 py-2.5 rounded-lg border-2 transition-all font-medium",
                        bank === b ? "border-primary bg-accent text-primary" : "border-border hover:border-primary/40 text-foreground"
                      )}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Wallet */}
            {method === "wallet" && (
              <div className="grid grid-cols-2 gap-2">
                {WALLETS.map(w => (
                  <button
                    key={w.id}
                    onClick={() => setWallet(w.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-sm font-medium",
                      wallet === w.id ? "border-primary bg-accent" : "border-border hover:border-primary/40"
                    )}
                  >
                    <div className="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ background: w.color }}>
                      {w.initial}
                    </div>
                    <span className="text-foreground">{w.name}</span>
                  </button>
                ))}
              </div>
            )}

            <Button className="w-full gradient-primary border-0 text-primary-foreground" onClick={handleProceed} disabled={processing}>
              {processing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing…</> : <>Pay ₹{plan.price.toLocaleString()} <ChevronRight className="ml-1 h-4 w-4" /></>}
            </Button>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-3 w-3" />
              <span>256-bit SSL encrypted · PCI DSS compliant</span>
            </div>
          </div>
        )}

        {/* OTP Step */}
        {step === "otp" && (
          <div className="p-6 space-y-5">
            <div className="text-center space-y-2">
              <div className="h-14 w-14 rounded-full bg-accent flex items-center justify-center mx-auto">
                <Smartphone className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-display font-bold text-lg">OTP Verification</h3>
              <p className="text-sm text-muted-foreground">
                {method === "upi" ? "A payment request has been sent to your UPI app. Enter the OTP to confirm." :
                  method === "card" ? "We've sent a 6-digit OTP to your registered mobile number for 3D Secure verification." :
                    method === "netbanking" ? `You're being redirected to ${bank}. Enter your transaction OTP below.` :
                      "Enter the OTP sent to your registered mobile number to confirm the wallet payment."}
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Enter 6-digit OTP</Label>
              <Input
                placeholder="••••••"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={e => { setOtp(e.target.value.replace(/\D/g, "").slice(0, 6)); setOtpError(""); }}
                className={cn("text-center text-xl tracking-widest font-mono", otpError && "border-destructive")}
              />
              {otpError && <p className="text-xs text-destructive flex items-center justify-center gap-1"><AlertCircle className="h-3 w-3" />{otpError}</p>}
              <p className="text-xs text-muted-foreground text-center">OTP valid for 10 minutes · <button className="text-primary underline">Resend OTP</button></p>
            </div>
            <Button className="w-full gradient-primary border-0 text-primary-foreground" onClick={handleOTPVerify} disabled={processing}>
              {processing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying…</> : "Verify & Pay"}
            </Button>
            <button onClick={() => setStep("method")} className="w-full text-xs text-muted-foreground underline text-center">
              ← Change payment method
            </button>
          </div>
        )}

        {/* Success Step */}
        {step === "success" && (
          <div className="p-8 flex flex-col items-center gap-4 text-center">
            <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center animate-scale-in">
              <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xl text-foreground">Payment Successful!</h3>
              <p className="text-sm text-muted-foreground mt-1">Your <strong>{plan.name}</strong> membership is now active.</p>
            </div>
            <div className="w-full bg-muted rounded-xl p-4 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="font-bold text-foreground">₹{plan.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method</span>
                <span className="font-medium text-foreground">{methodLabel[method]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium text-green-600">Completed</span>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
