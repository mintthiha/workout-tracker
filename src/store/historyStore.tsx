import React, { createContext, useContext, useState } from "react";

export interface HistoryExercise {
  name: string;
  sets: number;
  best: string;
}

export interface HistoryEntry {
  id: string;
  title: string;
  date: string;
  monthYear: string;
  duration: string;
  weight: string;
  prs: number;
  exercises: HistoryExercise[];
}

interface HistoryContextValue {
  entries: HistoryEntry[];
  addEntry: (entry: HistoryEntry) => void;
  deleteEntry: (id: string) => void;
}

const HistoryContext = createContext<HistoryContextValue | null>(null);

const SEED_ENTRIES: HistoryEntry[] = [
  {
    id: "seed-1",
    title: "Pull Day",
    date: "Friday, Feb 20 2026",
    monthYear: "FEBRUARY 2026",
    duration: "55min",
    weight: "1970 lb",
    prs: 5,
    exercises: [
      { name: "Pull Up", sets: 4, best: "BW × 8" },
      { name: "Lat Pulldown (Cable)", sets: 3, best: "120 lb × 10" },
      { name: "Row (Barbell)", sets: 3, best: "135 lb × 8" },
      { name: "Bicep Curl (Dumbbell)", sets: 3, best: "40 lb × 9" },
    ],
  },
  {
    id: "seed-2",
    title: "Push Day",
    date: "Saturday, Feb 21 2026",
    monthYear: "FEBRUARY 2026",
    duration: "1h 1min",
    weight: "8600 lb",
    prs: 2,
    exercises: [
      { name: "Bench Press (Barbell)", sets: 4, best: "185 lb × 5" },
      { name: "Overhead Press (Barbell)", sets: 3, best: "95 lb × 8" },
      { name: "Incline Bench Press (Dumbbell)", sets: 3, best: "65 lb × 10" },
      { name: "Tricep Pushdown (Cable)", sets: 3, best: "50 lb × 12" },
    ],
  },
];

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<HistoryEntry[]>(SEED_ENTRIES);

  function addEntry(entry: HistoryEntry) {
    setEntries((prev) => [entry, ...prev]);
  }

  function deleteEntry(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <HistoryContext.Provider value={{ entries, addEntry, deleteEntry }}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory(): HistoryContextValue {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error("useHistory must be used within HistoryProvider");
  return ctx;
}
