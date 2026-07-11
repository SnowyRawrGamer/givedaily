import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Country = "CA" | "US" | "UK" | "AU" | "OTHER";
export type Tier = "free" | "paid";

export interface Draw {
  id: string;
  date: string; // ISO date
  prize: number;
  drawnAt?: string;
  winnerId?: string;
  winnerName?: string;
  entries: Record<string, { user: string; count: number; source: "free" | "paid" }>;
}

export type WinStatus = "pending" | "unlocked" | "forfeited";
export interface Win {
  id: string;
  drawId: string;
  date: string;
  prize: number;
  status: WinStatus;
}

export interface User {
  id: string;
  username: string;
  country: Country;
  region: string;
  tier: Tier;
  ageConfirmed: boolean;
  acceptedRules: boolean;
  isAdmin: boolean;
  balance: number;
  wins: Win[];
  freeEntriesToday: number;
  freeEntriesDate: string; // YYYY-MM-DD
}

interface StoreState {
  user: User | null;
  draws: Draw[];
  setUser: (u: User | null) => void;
  updateUser: (patch: Partial<User>) => void;
  addDraw: (d: Draw) => void;
  updateDraw: (id: string, patch: Partial<Draw>) => void;
  addFreeEntry: () => void;
  reset: () => void;
}

const KEY = "givedaily:v1";

const RESTRICTED: Country[] = [];
export const RESTRICTED_LABEL: Partial<Record<Country, string>> = {};

const todayISO = () => new Date().toISOString().slice(0, 10);

function makeSeedDraws(): Draw[] {
  const today = new Date();
  const draws: Draw[] = [];
  // 3 past draws
  for (let i = 3; i >= 1; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    draws.push({
      id: `draw-${iso}`,
      date: iso,
      prize: 100 + i * 25,
      drawnAt: d.toISOString(),
      winnerName: ["luckyLoon42", "maple_moose", "sunset_wolf"][i - 1],
      winnerId: "seed",
      entries: {},
    });
  }
  // today
  const todayIso = today.toISOString().slice(0, 10);
  draws.push({
    id: `draw-${todayIso}`,
    date: todayIso,
    prize: 250,
    entries: {},
  });
  return draws;
}

function load(): { user: User | null; draws: Draw[] } {
  if (typeof window === "undefined") return { user: null, draws: [] };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { user: null, draws: makeSeedDraws() };
}

const Ctx = createContext<StoreState | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [draws, setDraws] = useState<Draw[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const s = load();
    setUserState(s.user);
    setDraws(s.draws.length ? s.draws : makeSeedDraws());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(KEY, JSON.stringify({ user, draws }));
  }, [user, draws, hydrated]);

  const setUser = (u: User | null) => setUserState(u);
  const updateUser = (patch: Partial<User>) =>
    setUserState((u) => (u ? { ...u, ...patch } : u));

  const addDraw = (d: Draw) => setDraws((arr) => [...arr, d]);
  const updateDraw = (id: string, patch: Partial<Draw>) =>
    setDraws((arr) => arr.map((d) => (d.id === id ? { ...d, ...patch } : d)));

  const addFreeEntry = () => {
    setUserState((u) => {
      if (!u) return u;
      const today = todayISO();
      const count = u.freeEntriesDate === today ? u.freeEntriesToday : 0;
      if (count >= 10) return u;
      const next = { ...u, freeEntriesToday: count + 1, freeEntriesDate: today };
      // add entry to today's draw
      setDraws((arr) =>
        arr.map((d) => {
          if (d.date !== today) return d;
          const prev = d.entries[u.id] ?? { user: u.username, count: 0, source: "free" as const };
          return {
            ...d,
            entries: {
              ...d.entries,
              [u.id]: { ...prev, count: prev.count + 1, source: prev.source === "paid" ? "paid" : "free" },
            },
          };
        }),
      );
      return next;
    });
  };

  const reset = () => {
    localStorage.removeItem(KEY);
    setUserState(null);
    setDraws(makeSeedDraws());
  };

  return (
    <Ctx.Provider value={{ user, draws, setUser, updateUser, addDraw, updateDraw, addFreeEntry, reset }}>
      {children}
    </Ctx.Provider>
  );
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("StoreProvider missing");
  return s;
}

// Ensure today's draw exists and refresh paid entries.
export function ensureTodayEntries(store: StoreState) {
  const today = todayISO();
  const has = store.draws.some((d) => d.date === today);
  if (!has) {
    store.addDraw({ id: `draw-${today}`, date: today, prize: 250, entries: {} });
  }
  const u = store.user;
  if (u && u.tier === "paid") {
    const draw = store.draws.find((d) => d.date === today);
    if (draw && !draw.entries[u.id]) {
      store.updateDraw(draw.id, {
        entries: { ...draw.entries, [u.id]: { user: u.username, count: 10, source: "paid" } },
      });
    }
  }
}

export const RESTRICTED_REGIONS: Record<string, string> = {
  "US-FL": "Florida requires special sweepstakes registration.",
  "US-NY": "New York has strict sweepstakes bonding requirements.",
  "US-RI": "Rhode Island restricts retail sweepstakes.",
  "CA-QC": "Quebec requires Régie approval for contests.",
};