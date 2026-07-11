import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { Trophy } from "lucide-react";

export const Route = createFileRoute("/history")({ component: () => <AppShell><History /></AppShell> });

function History() {
  const { draws } = useStore();
  const past = [...draws].filter((d) => d.winnerName).sort((a, b) => b.date.localeCompare(a.date));
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold">Draw history</h1>
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-widest text-muted-foreground">
            <tr><th className="text-left px-4 py-3">Date</th><th className="text-left px-4 py-3">Prize</th><th className="text-left px-4 py-3">Winner</th></tr>
          </thead>
          <tbody>
            {past.length === 0 ? (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">No past draws yet.</td></tr>
            ) : past.map((d) => (
              <tr key={d.id} className="border-t border-border/50">
                <td className="px-4 py-3 font-mono">{d.date}</td>
                <td className="px-4 py-3 font-semibold">${d.prize}</td>
                <td className="px-4 py-3"><span className="inline-flex items-center gap-2"><Trophy className="h-4 w-4 text-emerald-400" />@{d.winnerName}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}