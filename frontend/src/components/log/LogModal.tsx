"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { api } from "@/lib/api";
import { X, Utensils, Moon, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getTodayISO } from "@/lib/utils";
import type { FoodLog, SleepLog, ActivityLog } from "@/types";

const TABS = [
  { id: "food" as const, label: "Food", icon: Utensils },
  { id: "sleep" as const, label: "Sleep", icon: Moon },
  { id: "activity" as const, label: "Activity", icon: Dumbbell },
];

export function LogModal() {
  const { logModalOpen, logModalTab, setLogModal, addFoodLog, addSleepLog, addActivityLog } =
    useAppStore();
  const [activeTab, setActiveTab] = useState<"food" | "sleep" | "activity">(
    logModalTab || "food"
  );
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [food, setFood] = useState({
    meal: "breakfast",
    description: "",
  });

  const [sleep, setSleep] = useState({
    bedtime: "22:00",
    wakeTime: "07:00",
    quality: 3,
  });

  const [activity, setActivity] = useState({
    type: "walk",
    duration: "",
    steps: "",
    calories: "",
  });

  const resetForms = () => {
    setFood({ meal: "breakfast", description: "" });
    setSleep({ bedtime: "22:00", wakeTime: "07:00", quality: 3 });
    setActivity({ type: "walk", duration: "", steps: "", calories: "" });
  };

  const handleClose = () => {
    setLogModal(false);
    resetForms();
    setSuccess(false);
  };

  const handleFoodSubmit = async () => {
    setLoading(true);
    try {
      const items = food.description
        .split("\n")
        .filter(Boolean)
        .map((name) => ({ name: name.trim() }));

      const result = await api.logs.createFood({
        date: getTodayISO(),
        meal: food.meal,
        items,
        source: "manual",
      });
      addFoodLog(result as FoodLog);
      setSuccess(true);
      setTimeout(handleClose, 1000);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const handleSleepSubmit = async () => {
    setLoading(true);
    try {
      const [bedH, bedM] = sleep.bedtime.split(":").map(Number);
      const [wakeH, wakeM] = sleep.wakeTime.split(":").map(Number);
      const bedDate = new Date();
      bedDate.setHours(bedH, bedM, 0);
      const wakeDate = new Date();
      wakeDate.setHours(wakeH, wakeM, 0);
      if (wakeDate <= bedDate) wakeDate.setDate(wakeDate.getDate() + 1);

      const durationMins = Math.round((wakeDate.getTime() - bedDate.getTime()) / 60000);

      const result = await api.logs.createSleep({
        date: getTodayISO(),
        bedtime: bedDate.toISOString(),
        wake_time: wakeDate.toISOString(),
        duration_mins: durationMins,
        quality: sleep.quality,
      });
      addSleepLog(result as SleepLog);
      setSuccess(true);
      setTimeout(handleClose, 1000);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const handleActivitySubmit = async () => {
    setLoading(true);
    try {
      const result = await api.logs.createActivity({
        date: getTodayISO(),
        type: activity.type,
        duration_mins: parseInt(activity.duration) || 0,
        steps: activity.steps ? parseInt(activity.steps) : undefined,
        calories: activity.calories ? parseInt(activity.calories) : undefined,
      });
      addActivityLog(result as ActivityLog);
      setSuccess(true);
      setTimeout(handleClose, 1000);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {logModalOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="panel-shadow fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-background p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Log Entry</h2>
              <button
                onClick={handleClose}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-surface-hover hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-6 flex gap-1 rounded-lg bg-surface p-1">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    activeTab === id
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>

            {success && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 rounded-lg bg-green-500/10 p-3 text-center text-sm text-green-600"
              >
                Logged successfully!
              </motion.div>
            )}

            {/* Food Tab */}
            {activeTab === "food" && (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Meal
                  </label>
                  <select
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                    value={food.meal}
                    onChange={(e) => setFood({ ...food, meal: e.target.value })}
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    What did you eat? (one item per line)
                  </label>
                  <textarea
                    className="min-h-24 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Grilled chicken salad with avocado..."
                    value={food.description}
                    onChange={(e) => setFood({ ...food, description: e.target.value })}
                  />
                </div>
                <Button onClick={handleFoodSubmit} disabled={loading} className="w-full">
                  {loading ? "Saving..." : "Save Food Log"}
                </Button>
              </div>
            )}

            {/* Sleep Tab */}
            {activeTab === "sleep" && (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Bedtime
                    </label>
                    <input
                      type="time"
                      className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                      value={sleep.bedtime}
                      onChange={(e) => setSleep({ ...sleep, bedtime: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Wake time
                    </label>
                    <input
                      type="time"
                      className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                      value={sleep.wakeTime}
                      onChange={(e) => setSleep({ ...sleep, wakeTime: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Sleep quality: {sleep.quality}/5
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={sleep.quality}
                    onChange={(e) => setSleep({ ...sleep, quality: parseInt(e.target.value) })}
                    className="w-full accent-primary"
                  />
                </div>
                <Button onClick={handleSleepSubmit} disabled={loading} className="w-full">
                  {loading ? "Saving..." : "Save Sleep Log"}
                </Button>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === "activity" && (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Type
                    </label>
                    <select
                      className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                      value={activity.type}
                      onChange={(e) => setActivity({ ...activity, type: e.target.value })}
                    >
                      <option value="walk">Walk</option>
                      <option value="run">Run</option>
                      <option value="gym">Gym</option>
                      <option value="yoga">Yoga</option>
                      <option value="cycling">Cycling</option>
                      <option value="swimming">Swimming</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Duration (mins)
                    </label>
                    <input
                      type="number"
                      placeholder="30"
                      className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                      value={activity.duration}
                      onChange={(e) => setActivity({ ...activity, duration: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Steps
                    </label>
                    <input
                      type="number"
                      placeholder="5000"
                      className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                      value={activity.steps}
                      onChange={(e) => setActivity({ ...activity, steps: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Calories
                    </label>
                    <input
                      type="number"
                      placeholder="200"
                      className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                      value={activity.calories}
                      onChange={(e) => setActivity({ ...activity, calories: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={handleActivitySubmit} disabled={loading} className="w-full">
                  {loading ? "Saving..." : "Save Activity Log"}
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}