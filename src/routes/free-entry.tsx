import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { randomQuote } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CheckCircle2, RefreshCw, Keyboard } from "lucide-react";

export const Route = createFileRoute("/free-entry")({ component: () => <AppShell><FreeEntry /></AppShell> });

function FreeEntry() {
  const store = useStore();
  const u = store.user!;
  const today = new Date().toISOString().slice(0, 10);
  const earned = u.freeEntriesDate === today ? u.freeEntriesToday : 0;
  const [quote, setQuote] = useState(() => randomQuote());
  const [typed, setTyped] = useState("");
  const maxed = earned >= 10;

  const chars = useMemo(() => {
    return quote.split("").map((c, i) => {
      const t = typed[i];
      if (t == null) return { c, state: "pending" as const };
      if (t === c) return { c, state: "ok" as const };
      return { c, state: "err" as const };
    });
  }, [quote, typed]);

  const perfect = typed === quote;
  const errors = chars.filter((c) => c.state === "err").length;

  const submit = () => {
    if (!perfect) { toast.error("Not a perfect match. Every character must be exact."); return; }
    store.addFreeEntry();
    toast.success("+1 free entry added to today's draw");
    setQuote(randomQuote());
    setTyped("");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header>
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-500/15 text-emerald-400"><Keyboard className="h-6 w-6" /></div>
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold">Free entry — typing task</h1>
            <p className="text-sm text-muted-foreground">No purchase necessary. Type the passage exactly to earn an entry.</p>
          </div>
        </div>
        <div className="mt-5 rounded-xl border border-border/60 bg-card p-4">
          <div className="flex items-center justify-between text-sm mb-2"><span className="font-medium">Progress</span><span className="text-muted-foreground">{earned}/10 free entries today</span></div>
          <Progress value={(earned / 10) * 100} className="h-2" />
        </div>
      </header>

      {maxed ? (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400" />
          <div className="mt-3 text-lg font-semibold">You've matched the paid tier's 10 entries today.</div>
          <div className="text-sm text-muted-foreground">Come back tomorrow — the counter resets at midnight.</div>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-5">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2 flex items-center justify-between">
              <span>Type this exactly</span>
              <button onClick={() => { setQuote(randomQuote()); setTyped(""); }} className="inline-flex items-center gap-1 text-xs hover:text-foreground"><RefreshCw className="h-3 w-3" /> New quote</button>
            </div>
            <div className="rounded-lg bg-background/60 border border-border p-4 leading-relaxed font-mono text-sm select-none">
              {chars.map((c, i) => (
                <span key={i} className={c.state === "ok" ? "text-emerald-400" : c.state === "err" ? "bg-destructive/40 text-destructive-foreground" : "text-muted-foreground"}>{c.c}</span>
              ))}
            </div>
          </div>
          <div>
            <Textarea value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="Start typing…" className="font-mono min-h-[140px]" spellCheck={false} autoFocus />
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>{typed.length}/{quote.length} characters · {errors} error{errors === 1 ? "" : "s"}</span>
              <span>{perfect ? <span className="text-emerald-400 font-medium">Perfect match!</span> : "Keep going…"}</span>
            </div>
          </div>
          <Button onClick={submit} disabled={!perfect} className="w-full h-11 font-semibold" style={perfect ? { background: "var(--gradient-primary)", color: "white" } : {}}>Submit &amp; earn 1 entry</Button>
        </div>
      )}
    </div>
  );
}