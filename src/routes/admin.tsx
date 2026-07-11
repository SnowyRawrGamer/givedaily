import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useStore, type Win } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Shield, Dice5, Calendar, Users } from "lucide-react";

export const Route = createFileRoute("/admin")({ component: () => <AppShell><Admin /></AppShell> });

function Admin() {
  const store = useStore();
  const u = store.user!;
  const [prize, setPrize] = useState(250);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const stats = useMemo(() => {
    let free = 0, paid = 0;
    store.draws.forEach((d) => Object.values(d.entries).forEach((e) => { if (e.source === "paid") paid += e.count; else free += e.count; }));
    return { free, paid, total: free + paid };
  }, [store.draws]);

  if (!u.isAdmin) {
    return (
      <div className="max-w-md mx-auto rounded-2xl border border-border/60 bg-card p-8 text-center">
        <Shield className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
        <h1 className="text-xl font-bold">Admin panel</h1>
        <p className="text-sm text-muted-foreground mt-1">Toggle admin mode to schedule draws, view stats, and manually trigger winners.</p>
        <div className="mt-5 flex items-center justify-center gap-3"><Label>Enable admin mode</Label><Switch onCheckedChange={(v) => store.updateUser({ isAdmin: !!v })} /></div>
      </div>
    );
  }

  const createDraw = () => {
    if (store.draws.some((d) => d.date === date)) { toast.error("A draw already exists for that date."); return; }
    store.addDraw({ id: `draw-${date}-${Date.now()}`, date, prize, entries: {} });
    toast.success(`Draw scheduled for ${date} — $${prize}`);
  };

  const triggerDraw = (drawId: string) => {
    const draw = store.draws.find((d) => d.id === drawId)!;
    const pool: string[] = [];
    Object.entries(draw.entries).forEach(([uid, e]) => { for (let i = 0; i < e.count; i++) pool.push(uid); });
    if (pool.length === 0) { toast.error("No entries in this draw."); return; }
    const winnerId = pool[Math.floor(Math.random() * pool.length)];
    const winnerName = draw.entries[winnerId].user;
    store.updateDraw(drawId, { winnerId, winnerName, drawnAt: new Date().toISOString() });
    if (winnerId === u.id) {
      const win: Win = { id: `win-${drawId}`, drawId, date: draw.date, prize: draw.prize, status: "pending" };
      store.updateUser({ wins: [win, ...u.wins] });
      toast.success(`You won $${draw.prize}! Claim it in My Wins.`);
    } else {
      toast(`Winner: @${winnerName} for $${draw.prize}`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2"><Shield className="h-6 w-6 text-primary" />Admin panel</h1>
        <div className="flex items-center gap-2 text-sm"><Label>Admin mode</Label><Switch checked onCheckedChange={(v) => store.updateUser({ isAdmin: !!v })} /></div>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <Stat icon={Users} label="Total entries" value={stats.total} />
        <Stat icon={Users} label="Free entries" value={stats.free} accent="emerald" />
        <Stat icon={Users} label="Paid entries" value={stats.paid} accent="indigo" />
      </section>

      <section className="rounded-2xl border border-border/60 bg-card p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2"><Calendar className="h-4 w-4" />Schedule new draw</h2>
        <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] items-end">
          <div><Label>Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1" /></div>
          <div><Label>Prize amount (USD)</Label><Input type="number" value={prize} onChange={(e) => setPrize(Number(e.target.value))} className="mt-1" /></div>
          <Button onClick={createDraw} style={{ background: "var(--gradient-primary)", color: "white" }}>Create draw</Button>
        </div>
      </section>

      <section className="rounded-2xl border border-border/60 bg-card overflow-hidden">
        <h2 className="p-4 font-semibold border-b border-border/60">All draws</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-widest text-muted-foreground">
              <tr><th className="text-left px-4 py-2">Date</th><th className="text-left px-4 py-2">Prize</th><th className="text-left px-4 py-2">Entries</th><th className="text-left px-4 py-2">Winner</th><th className="text-right px-4 py-2">Action</th></tr>
            </thead>
            <tbody>
              {[...store.draws].sort((a, b) => b.date.localeCompare(a.date)).map((d) => {
                const total = Object.values(d.entries).reduce((a, e) => a + e.count, 0);
                return (
                  <tr key={d.id} className="border-t border-border/50">
                    <td className="px-4 py-3 font-mono">{d.date}</td>
                    <td className="px-4 py-3 font-semibold">${d.prize}</td>
                    <td className="px-4 py-3">{total}</td>
                    <td className="px-4 py-3">{d.winnerName ? `@${d.winnerName}` : <span className="text-muted-foreground">—</span>}</td>
                    <td className="px-4 py-3 text-right">{!d.winnerName && <Button size="sm" variant="secondary" onClick={() => triggerDraw(d.id)}><Dice5 className="mr-1 h-3 w-3" />Trigger</Button>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Stat({ icon: Icon, label, value, accent }: { icon: any; label: string; value: number; accent?: string }) {
  const color = accent === "emerald" ? "text-emerald-400 bg-emerald-500/15" : accent === "indigo" ? "text-indigo-300 bg-indigo-500/15" : "text-primary bg-primary/15";
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <div className="flex items-center gap-3"><div className={`grid h-9 w-9 place-items-center rounded-lg ${color}`}><Icon className="h-4 w-4" /></div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div></div>
      <div className="mt-3 text-3xl font-bold tabular-nums">{value.toLocaleString()}</div>
    </div>
  );
}