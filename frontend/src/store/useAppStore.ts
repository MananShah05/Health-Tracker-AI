"use client";

import { create } from "zustand";
import { api } from "@/lib/api";
import type { User, Pattern, FoodLog, SleepLog, ActivityLog, HabitScores } from "@/types";

interface AppState {
  user: User | null;
  isLoading: boolean;
  habitScores: HabitScores;
  patterns: Pattern[];
  foodLogs: FoodLog[];
  sleepLogs: SleepLog[];
  activityLogs: ActivityLog[];
  logModalOpen: boolean;
  logModalTab: "food" | "sleep" | "activity";

  loadUser: () => Promise<void>;
  loadLogs: (start_date?: string, end_date?: string) => Promise<void>;
  loadPatterns: () => Promise<void>;
  setLogModal: (open: boolean, tab?: "food" | "sleep" | "activity") => void;
  updateHabitScores: (scores: HabitScores) => void;
  addFoodLog: (log: FoodLog) => void;
  addSleepLog: (log: SleepLog) => void;
  addActivityLog: (log: ActivityLog) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  isLoading: false,
  habitScores: { nutrition: 0, sleep: 0, movement: 0 },
  patterns: [],
  foodLogs: [],
  sleepLogs: [],
  activityLogs: [],
  logModalOpen: false,
  logModalTab: "food",

  loadUser: async () => {
    try {
      const user = await api.auth.me();
      set({ user });
    } catch {
      // If /me fails, set a fallback user so the UI still renders
      set({
        user: {
          id: "demo",
          name: "Demo User",
          email: "demo@test.com",
          goals: [],
          created_at: new Date().toISOString(),
        },
      });
    }
  },

  loadLogs: async (start_date, end_date) => {
    try {
      const result = await api.logs.getLogs({ start_date, end_date });
      set({
        foodLogs: result.food || [],
        sleepLogs: result.sleep || [],
        activityLogs: result.activity || [],
      });
    } catch {
      // silent fail
    }
  },

  loadPatterns: async () => {
    try {
      const pattern = await api.patterns.get();
      if (pattern) {
        set({ patterns: [pattern], habitScores: pattern.habit_scores });
      }
    } catch {
      // silent fail
    }
  },

  setLogModal: (open, tab) =>
    set({ logModalOpen: open, logModalTab: tab || "food" }),

  updateHabitScores: (scores) => set({ habitScores: scores }),

  addFoodLog: (log) => set((state) => ({ foodLogs: [log, ...state.foodLogs] })),
  addSleepLog: (log) => set((state) => ({ sleepLogs: [log, ...state.sleepLogs] })),
  addActivityLog: (log) => set((state) => ({ activityLogs: [log, ...state.activityLogs] })),
}));