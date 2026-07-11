import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  Trophy, Gift, Keyboard, CreditCard, History, Wallet, Shield, ScrollText, LogOut, Menu, X, Sparkles,
} from "lucide-react";
import { useStore, ensureTodayEntries, RESTRICTED_REGIONS } from "@/lib/store";
import { COUNTRIES, REGIONS } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const NAV = [
  { to: "/", label: "Dashboard", icon: Trophy },
  { to: "/free-entry", label: "Free Entry", icon: Keyboard },
  { to: "/subscribe", label: "Subscribe", icon: CreditCard },
  { to: "/wins", label: "My Wins", icon: Gift },
  { to: "/wallet", label: "Wallet", icon: Wallet },
  { to: "/history", label: "History", icon: History },
  { to: "/admin", label: "Admin", icon: Shield },
];

export function AppShell({ children }: { children: ReactNode }) {
  const store = useStore();
  const { user } = store;
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (user) ensureTodayEntries(store);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.tier]);

  if (!user || !user.ageConfirmed) return <AgeGate />;
  if (!user.username || !user.country || !user.acceptedRules) return <Onboarding />;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ background: "var(--gradient-primary)" }}>
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-lg font-bold tracking-tight">givedaily</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">no purchase necessary</div>
            </div>
          </Link>
          <nav className="hidden lg:flex items-center gap-1">
            {NAV.map((n) => {
              const active = pathname === n.to;
              const Icon = n.icon;
              return (
                <Link key={n.to} to={n.to} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
                  <Icon className="h-4 w-4" /> {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-muted-foreground">{user.tier === "paid" ? "Subscriber" : "Free tier"}</div>
              <div className="text-sm font-semibold">@{user.username}</div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => store.reset()} title="Sign out"><LogOut className="h-4 w-4" /></Button>
          </div>
          <button className="lg:hidden rounded-md p-2 hover:bg-muted" onClick={() => setOpen((o) => !o)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {open && (
          <div className="lg:hidden border-t border-border/60 px-3 py-3 space-y-1">
            {NAV.map((n) => {
              const Icon = n.icon;
              const active = pathname === n.to;
              return (
                <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${active ? "bg-primary/15 text-primary" : "hover:bg-muted"}`}>
                  <Icon className="h-4 w-4" /> {n.label}
                </Link>
              );
            })}
            <Button variant="outline" className="w-full mt-2" onClick={() => store.reset()}><LogOut className="mr-2 h-4 w-4" />Sign out & reset</Button>
          </div>
        )}
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-6 md:py-10">{children}</div>
      </main>

      <footer className="border-t border-border/60 bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-6 text-xs text-muted-foreground grid gap-2 md:flex md:items-center md:justify-between">
          <div>© {new Date().getFullYear()} givedaily · Demo prototype · No real money is awarded.</div>
          <div className="flex flex-wrap gap-4">
            <Link to="/rules" className="hover:text-foreground underline underline-offset-4">Official Rules</Link>
            <Link to="/rules" hash="privacy" className="hover:text-foreground underline underline-offset-4">Privacy</Link>
            <span title="Federal and provincial contest law requires a free method of entry with equal chance of winning, and Canadian winners must correctly answer a skill-testing question.">
              No Purchase Necessary · Math skill test required
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function AgeGate() {
  const store = useStore();
  const [checked, setChecked] = useState(false);
  return (
    <div className="min-h-screen grid place-items-center px-4" style={{ background: "radial-gradient(circle at 20% 10%, oklch(0.3 0.05 275 / 0.6), transparent 60%), radial-gradient(circle at 80% 90%, oklch(0.35 0.08 160 / 0.4), transparent 60%)" }}>
      <div className="w-full max-w-md rounded-2xl border border-border/70 bg-card p-8 shadow-2xl" style={{ boxShadow: "var(--shadow-glow)" }}>
        <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl" style={{ background: "var(--gradient-primary)" }}>
          <Sparkles className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-center">Welcome to givedaily</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">A daily cash giveaway. Free to enter. Skill required to win.</p>

        <div className="mt-6 rounded-lg border border-border bg-background/50 p-4 text-sm">
          <div className="font-semibold mb-1">Age verification</div>
          <p className="text-muted-foreground text-xs">You must be the legal age of majority in your region (18+ in most of Canada, the US, and internationally; 19+ in AB, BC, NB, NL, NS, NT, NU, YT). By continuing you confirm this is true.</p>
        </div>

        <label className="mt-5 flex items-start gap-3 text-sm">
          <Checkbox checked={checked} onCheckedChange={(v) => setChecked(!!v)} className="mt-0.5" />
          <span>I confirm I am 18 years of age or older (19+ where required by my province or state).</span>
        </label>

        <Button
          disabled={!checked}
          className="mt-6 w-full h-11 font-semibold"
          style={checked ? { background: "var(--gradient-primary)", color: "white" } : {}}
          onClick={() => {
            store.setUser({
              id: crypto.randomUUID(),
              username: "",
              country: "CA",
              region: "",
              tier: "free",
              ageConfirmed: true,
              acceptedRules: false,
              isAdmin: false,
              balance: 0,
              wins: [],
              freeEntriesToday: 0,
              freeEntriesDate: "",
            });
          }}
        >Enter givedaily</Button>
        <p className="mt-3 text-[11px] text-center text-muted-foreground">Underage users are strictly prohibited from participating.</p>
      </div>
    </div>
  );
}

function Onboarding() {
  const store = useStore();
  const u = store.user!;
  const [username, setUsername] = useState(u.username);
  const [country, setCountry] = useState<string>(u.country);
  const [region, setRegion] = useState<string>(u.region);
  const [accepted, setAccepted] = useState(u.acceptedRules);
  const [noPurchase, setNoPurchase] = useState(false);

  const restrictedKey = `${country}-${region}`;
  const restricted = RESTRICTED_REGIONS[restrictedKey];
  const canSubmit = username.trim().length >= 3 && country && region && accepted && noPurchase;

  return (
    <div className="min-h-screen grid place-items-center px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl border border-border/70 bg-card p-8">
        <h1 className="text-2xl font-bold">Set up your profile</h1>
        <p className="text-sm text-muted-foreground mt-1">A few details so we can honor local contest laws.</p>

        <div className="mt-6 space-y-4">
          <div>
            <Label>Username</Label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="lucky_penguin" className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Country</Label>
              <Select value={country} onValueChange={(v) => { setCountry(v); setRegion(""); }}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{COUNTRIES.map((c) => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>State / Province</Label>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>{(REGIONS[country] ?? []).map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          {restricted && (
            <Alert variant="destructive">
              <AlertTitle>Restricted jurisdiction (simulated geoblock)</AlertTitle>
              <AlertDescription>{restricted} You may browse the app in read-only mode, but entries from this region will be excluded from draws.</AlertDescription>
            </Alert>
          )}

          <label className="flex items-start gap-3 text-sm">
            <Checkbox checked={accepted} onCheckedChange={(v) => setAccepted(!!v)} className="mt-0.5" />
            <span>I have read and agree to the <Link to="/rules" className="text-primary underline">Official Rules</Link> and <Link to="/rules" hash="privacy" className="text-primary underline">Privacy Policy</Link>.</span>
          </label>
          <label className="flex items-start gap-3 text-sm">
            <Checkbox checked={noPurchase} onCheckedChange={(v) => setNoPurchase(!!v)} className="mt-0.5" />
            <span>I understand <strong>no purchase is necessary</strong> to win and that all entries — free and paid — have equal chance in every draw.</span>
          </label>

          <Button disabled={!canSubmit} className="w-full h-11 font-semibold" style={canSubmit ? { background: "var(--gradient-primary)", color: "white" } : {}}
            onClick={() => store.updateUser({ username: username.trim(), country: country as any, region, acceptedRules: true, isAdmin: username.trim().toLowerCase() === "admin" })}>
            Continue to dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}