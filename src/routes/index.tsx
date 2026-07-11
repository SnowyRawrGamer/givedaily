import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trophy, Users, Clock, Zap, Keyboard, CreditCard, Info } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const Route = createFileRoute("/")({ component: Index });

function useCountdown(target: Date) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const ms = Math.max(0, target.getTime() - now);
  const h = Math.floor(ms / 3.6e6);
  const m = Math.floor((ms % 3.6e6) / 6e4);
  const s = Math.floor((ms % 6e4) / 1000);
  return { h, m, s };
}

function Index() {
  return (
    <AppShell>
      <Dashboard />
    </AppShell>
  );
}

function Dashboard() {
  const { user, draws } = useStore();
  const today = new Date().toISOString().slice(0, 10);
  const draw = draws.find((d) => d.date === today);
  const midnight = new Date(); midnight.setHours(24, 0, 0, 0);
  const { h, m, s } = useCountdown(midnight);
  const totalEntries = draw ? Object.values(draw.entries).reduce((a, e) => a + e.count, 0) : 0;
  const myEntries = draw && user ? draw.entries[user.id]?.count ?? 0 : 0;
  const freeCount = user && user.freeEntriesDate === today ? user.freeEntriesToday : 0;

  return (
    <TooltipProvider>
      <div className="space-y-8">
        <section className="rounded-3xl border border-border/60 p-6 md:p-10 relative overflow-hidden" style={{ background: "linear-gradient(135deg, oklch(0.25 0.05 275), oklch(0.22 0.04 200))" }}>
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl opacity-40" style={{ background: "var(--gradient-primary)" }} />
          <div className="relative grid gap-6 md:grid-cols-[1fr_auto] items-end">
            <div>
              <div className="text-xs uppercase tracking-widest text-emerald-300/80">Today's cash prize</div>
              <div className="mt-2 text-5xl md:text-7xl font-black tracking-tight">${draw?.prize.toLocaleString() ?? 0}</div>
              <div className="mt-3 text-sm text-muted-foreground max-w-lg">Free and paid entries have <strong className="text-foreground">equal odds</strong>. Winner must correctly answer a math skill-testing question within 60 seconds to claim.</div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center min-w-max">
              {[["Hours", h], ["Min", m], ["Sec", s]].map(([label, val]) => (
                <div key={label as string} className="rounded-xl bg-background/40 backdrop-blur px-4 py-3">
                  <div className="text-3xl font-bold tabular-nums">{String(val).padStart(2, "0")}</div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <StatCard icon={Users} label="Active entries" value={totalEntries.toLocaleString()} sub={`${Object.keys(draw?.entries ?? {}).length} participants`} />
          <StatCard icon={Trophy} label="Your entries today" value={String(myEntries)} sub={user?.tier === "paid" ? "10 auto-granted (subscriber)" : `${freeCount}/10 free earned`} />
          <StatCard icon={Clock} label="Next draw" value={`${h}h ${m}m`} sub="Auto-runs at midnight UTC" />
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border/60 bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/15 text-emerald-400"><Keyboard className="h-5 w-5" /></div>
              <div>
                <div className="font-semibold">Free entries</div>
                <div className="text-xs text-muted-foreground">Type quotes perfectly · 1 entry each · max 10/day</div>
              </div>
            </div>
            <Progress value={(freeCount / 10) * 100} className="mt-4 h-2" />
            <div className="mt-2 text-xs text-muted-foreground flex items-center justify-between">
              <span>{freeCount}/10 earned today</span>
              <Tooltip><TooltipTrigger className="inline-flex items-center gap-1 hover:text-foreground"><Info className="h-3 w-3" /> No purchase necessary</TooltipTrigger>
                <TooltipContent className="max-w-xs text-xs">By law, free entrants must have equal odds. Free entries match the automatic 10 given to paid subscribers.</TooltipContent></Tooltip>
            </div>
            <Link to="/free-entry"><Button className="mt-5 w-full" variant="secondary">Earn free entries</Button></Link>
          </div>

          <div className="rounded-2xl border border-primary/40 p-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg, oklch(0.28 0.08 275 / 0.5), oklch(0.24 0.04 260))" }}>
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl opacity-40" style={{ background: "var(--gradient-primary)" }} />
            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: "var(--gradient-primary)" }}><Zap className="h-5 w-5 text-white" /></div>
                <div>
                  <div className="font-semibold">Premium subscriber</div>
                  <div className="text-xs text-muted-foreground">Skip the typing. Auto-entered daily.</div>
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-1"><span className="text-3xl font-bold">$1</span><span className="text-sm text-muted-foreground">/ day · auto 10× entries</span></div>
              <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                <li>· 10 automatic entries every day</li>
                <li>· Cancel anytime</li>
                <li>· Same odds — bonus is convenience, not advantage</li>
              </ul>
              <Link to="/subscribe"><Button className="mt-5 w-full font-semibold" style={{ background: "var(--gradient-primary)", color: "white" }}><CreditCard className="mr-2 h-4 w-4" />{user?.tier === "paid" ? "Manage subscription" : "Subscribe for $1/day"}</Button></Link>
            </div>
          </div>
        </section>
      </div>
    </TooltipProvider>
  );
}

function StatCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/15 text-primary"><Icon className="h-4 w-4" /></div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      </div>
      <div className="mt-3 text-3xl font-bold tabular-nums">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}
