import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Wallet as WalletIcon, ArrowDownToLine, Trophy } from "lucide-react";

const THRESHOLD = 25;

export const Route = createFileRoute("/wallet")({ component: () => <AppShell><Wallet /></AppShell> });

function Wallet() {
  const store = useStore();
  const u = store.user!;
  const [processing, setProcessing] = useState(false);
  const unlocked = u.wins.filter((w) => w.status === "unlocked");

  const cashout = () => {
    if (u.balance < THRESHOLD) return;
    setProcessing(true);
    setTimeout(() => {
      toast.success(`$${u.balance.toFixed(2)} transferred to your linked bank (simulated).`);
      store.updateUser({ balance: 0 });
      setProcessing(false);
    }, 1400);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold">Wallet</h1>
      <div className="rounded-2xl border border-emerald-500/30 p-8 relative overflow-hidden" style={{ background: "linear-gradient(135deg, oklch(0.28 0.08 160 / 0.5), oklch(0.24 0.04 260))" }}>
        <div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-500/20 text-emerald-400"><WalletIcon className="h-6 w-6" /></div>
          <div><div className="text-xs uppercase tracking-widest text-muted-foreground">Current balance</div><div className="text-5xl font-black">${u.balance.toFixed(2)}</div></div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3 items-center">
          <Button onClick={cashout} disabled={u.balance < THRESHOLD || processing} className="h-11 font-semibold" style={u.balance >= THRESHOLD ? { background: "var(--gradient-primary)", color: "white" } : {}}>
            <ArrowDownToLine className="mr-2 h-4 w-4" />{processing ? "Transferring…" : "Cash out to bank"}
          </Button>
          <span className="text-xs text-muted-foreground">Minimum cashout: ${THRESHOLD.toFixed(2)}</span>
        </div>
      </div>
      <div>
        <h2 className="text-sm uppercase tracking-widest text-muted-foreground mb-3">Unlocked winnings</h2>
        {unlocked.length === 0 ? (
          <div className="rounded-xl border border-border/60 bg-card p-8 text-center text-muted-foreground text-sm">No unlocked wins yet.</div>
        ) : (
          <div className="space-y-2">
            {unlocked.map((w) => (
              <div key={w.id} className="flex items-center justify-between rounded-lg border border-border/60 bg-card px-4 py-3">
                <div className="flex items-center gap-2 text-sm"><Trophy className="h-4 w-4 text-emerald-400" />{w.date}</div>
                <div className="font-semibold">+${w.prize.toFixed(2)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}