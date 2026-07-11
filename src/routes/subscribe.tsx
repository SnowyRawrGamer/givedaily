import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useStore, ensureTodayEntries } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { CreditCard, Lock, ShieldCheck, CheckCircle2, XCircle } from "lucide-react";

export const Route = createFileRoute("/subscribe")({ component: () => <AppShell><Subscribe /></AppShell> });

function Subscribe() {
  const store = useStore();
  const u = store.user!;
  const [open, setOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [card, setCard] = useState("4242 4242 4242 4242");
  const [exp, setExp] = useState("12/28"); const [cvc, setCvc] = useState("123");

  const paid = u.tier === "paid";

  const checkout = () => {
    setProcessing(true);
    setTimeout(() => {
      store.updateUser({ tier: "paid" });
      setTimeout(() => { ensureTodayEntries({ ...store, user: { ...u, tier: "paid" } } as any); }, 50);
      setProcessing(false); setOpen(false);
      toast.success("Subscription active — 10 automatic entries added to today's draw.");
    }, 1200);
  };

  const cancel = () => { store.updateUser({ tier: "free" }); toast("Subscription cancelled. You keep any entries already earned."); };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold">Premium subscription</h1>

      <div className="rounded-2xl border border-primary/40 p-6 md:p-8 relative overflow-hidden" style={{ background: "linear-gradient(135deg, oklch(0.28 0.08 275 / 0.6), oklch(0.24 0.04 260))" }}>
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full blur-3xl opacity-40" style={{ background: "var(--gradient-primary)" }} />
        <div className="relative">
          <div className="text-xs uppercase tracking-widest text-emerald-300/80">Premium</div>
          <div className="mt-2 flex items-baseline gap-2"><span className="text-5xl font-black">$1</span><span className="text-muted-foreground">/ day</span></div>
          <p className="mt-3 text-sm text-muted-foreground max-w-lg">Automatic 10 entries every day. Skip the typing task. Cancel anytime. Same odds as free entrants — the paid tier is a convenience, not an odds advantage. This is required by law.</p>
          <div className="mt-6 grid gap-2 text-sm">
            {["10 automatic entries daily", "Instant qualification for every draw", "Priority support during claim window", "Cancel anytime — pro-rated refund"].map((f) => (
              <div key={f} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> {f}</div>
            ))}
          </div>
          {paid ? (
            <div className="mt-6 flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/15 text-emerald-400 px-3 py-2 text-sm"><ShieldCheck className="h-4 w-4" /> Active subscriber</div>
              <Button variant="outline" onClick={cancel}><XCircle className="mr-2 h-4 w-4" />Cancel subscription</Button>
            </div>
          ) : (
            <Button onClick={() => setOpen(true)} className="mt-6 w-full md:w-auto h-11 px-6 font-semibold" style={{ background: "var(--gradient-primary)", color: "white" }}>
              <CreditCard className="mr-2 h-4 w-4" /> Subscribe for $1/day
            </Button>
          )}
        </div>
      </div>

      <div className="text-xs text-muted-foreground rounded-xl border border-border/60 p-4">
        <strong className="text-foreground">No purchase necessary.</strong> Free entrants can earn up to 10 entries per day via the typing task. Paid and free entries have identical odds. This is a legal requirement in Canada, the US, and most jurisdictions.
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Lock className="h-4 w-4" /> Secure checkout (simulated)</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Card number</Label><Input value={card} onChange={(e) => setCard(e.target.value)} className="mt-1 font-mono" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Expiry</Label><Input value={exp} onChange={(e) => setExp(e.target.value)} className="mt-1 font-mono" /></div>
              <div><Label>CVC</Label><Input value={cvc} onChange={(e) => setCvc(e.target.value)} className="mt-1 font-mono" /></div>
            </div>
            <Button onClick={checkout} disabled={processing} className="w-full h-11 font-semibold" style={{ background: "var(--gradient-primary)", color: "white" }}>
              {processing ? "Processing…" : "Pay $1.00 & subscribe"}
            </Button>
            <p className="text-[11px] text-muted-foreground text-center">Simulated Stripe checkout. No real charge is made.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}