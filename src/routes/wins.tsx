import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useStore, type Win } from "@/lib/store";
import { randomMathProblem } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertTriangle, Gift, Lock, Unlock, Timer } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/wins")({ component: () => <AppShell><Wins /></AppShell> });

function Wins() {
  const store = useStore();
  const u = store.user!;
  const [claim, setClaim] = useState<Win | null>(null);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold">My wins</h1>
      {u.wins.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card p-10 text-center text-muted-foreground">
          <Gift className="mx-auto h-10 w-10 mb-3 text-muted-foreground/60" />
          No wins yet. Earn entries and wait for the next draw.
        </div>
      ) : (
        <div className="space-y-3">
          {u.wins.map((w) => (
            <div key={w.id} className="rounded-xl border border-border/60 bg-card p-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">{w.date}</div>
                <div className="text-xl font-bold">${w.prize}</div>
                <StatusPill status={w.status} />
              </div>
              {w.status === "pending" && <Button onClick={() => setClaim(w)} style={{ background: "var(--gradient-primary)", color: "white" }}>Claim prize</Button>}
              {w.status === "unlocked" && <div className="text-sm text-emerald-400 flex items-center gap-1"><Unlock className="h-4 w-4" />Added to wallet</div>}
              {w.status === "forfeited" && <div className="text-sm text-destructive flex items-center gap-1"><Lock className="h-4 w-4" />Forfeited</div>}
            </div>
          ))}
        </div>
      )}
      {claim && <ClaimModal win={claim} onClose={() => setClaim(null)} />}
    </div>
  );
}

function StatusPill({ status }: { status: Win["status"] }) {
  const map: Record<Win["status"], string> = {
    pending: "bg-amber-500/15 text-amber-400",
    unlocked: "bg-emerald-500/15 text-emerald-400",
    forfeited: "bg-destructive/20 text-destructive",
  };
  return <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] uppercase tracking-widest ${map[status]}`}>{status}</span>;
}

function ClaimModal({ win, onClose }: { win: Win; onClose: () => void }) {
  const store = useStore();
  const u = store.user!;
  const problem = useMemo(() => randomMathProblem(), [win.id]);
  const [answer, setAnswer] = useState("");
  const [seconds, setSeconds] = useState(60);
  const [phase, setPhase] = useState<"active" | "second-chance" | "done">("active");
  const [problem2, setProblem2] = useState(problem);

  useEffect(() => {
    if (phase === "done") return;
    if (seconds <= 0) { failAttempt(); return; }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, phase]);

  function unlock() {
    const wins = u.wins.map((w) => w.id === win.id ? { ...w, status: "unlocked" as const } : w);
    store.updateUser({ wins, balance: u.balance + win.prize });
    toast.success(`Prize unlocked! $${win.prize} added to your balance.`);
    setPhase("done"); onClose();
  }
  function forfeit() {
    const wins = u.wins.map((w) => w.id === win.id ? { ...w, status: "forfeited" as const } : w);
    store.updateUser({ wins });
    toast.error("Prize forfeited.");
    setPhase("done"); onClose();
  }
  function failAttempt() {
    if (phase === "active") {
      const np = randomMathProblem();
      setProblem2(np); setAnswer(""); setSeconds(60); setPhase("second-chance");
      toast("Incorrect — one final chance to keep your prize.");
    } else { forfeit(); }
  }
  function submit() {
    const current = phase === "active" ? problem : problem2;
    if (Number(answer) === current.answer) unlock(); else failAttempt();
  }

  const current = phase === "active" ? problem : problem2;

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {phase === "second-chance" ? <AlertTriangle className="h-5 w-5 text-amber-400" /> : <Gift className="h-5 w-5 text-emerald-400" />}
            {phase === "second-chance" ? `Final chance — solve to keep $${win.prize}` : "Canadian skill-testing question"}
          </DialogTitle>
          <DialogDescription>
            Contest law requires winners to correctly answer a mathematical skill-testing question within 60 seconds.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-background/60 p-6 text-center">
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Solve</div>
            <div className="text-3xl font-mono font-bold">{current.expr} = ?</div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2"><Timer className="h-4 w-4" /><span className={`font-mono ${seconds < 15 ? "text-destructive" : ""}`}>{seconds}s remaining</span></div>
            <div className="text-muted-foreground">Prize: ${win.prize}</div>
          </div>
          <Input autoFocus type="number" value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Your answer" className="text-center text-xl h-12 font-mono" onKeyDown={(e) => e.key === "Enter" && submit()} />
          <Button onClick={submit} className="w-full h-11 font-semibold" style={{ background: "var(--gradient-primary)", color: "white" }}>Submit answer</Button>
          <p className="text-[11px] text-muted-foreground text-center">If incorrect or the timer runs out, the prize is forfeited per contest rules.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}