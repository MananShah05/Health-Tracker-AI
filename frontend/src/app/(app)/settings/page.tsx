"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function SettingsPage() {
  const { user } = useAppStore();
  const [goals, setGoals] = useState({
    sleepHours: user?.goals.find((g) => g.type === "sleep")?.target || 7,
    dailySteps: user?.goals.find((g) => g.type === "movement")?.target || 8000,
    dailyProtein: user?.goals.find((g) => g.type === "nutrition")?.target || 120,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.logs.updateGoals([
        { type: "sleep", target: goals.sleepHours, unit: "hours" },
        { type: "movement", target: goals.dailySteps, unit: "steps" },
        { type: "nutrition", target: goals.dailyProtein, unit: "protein_g" },
      ]);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // handle error
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <h1 className="mb-6 text-xl font-semibold text-foreground">Settings</h1>

      <div className="max-w-md space-y-8">
        <section>
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Habit Goals
          </h2>
          <div className="space-y-4 rounded-xl border border-border bg-surface p-6">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Target sleep (hours)
              </label>
              <input
                type="number"
                min={4}
                max={12}
                className="h-10 w-full max-w-32 rounded-lg border border-border bg-background px-3 text-sm"
                value={goals.sleepHours}
                onChange={(e) =>
                  setGoals({ ...goals, sleepHours: parseFloat(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Daily step goal
              </label>
              <input
                type="number"
                min={1000}
                step={1000}
                className="h-10 w-full max-w-32 rounded-lg border border-border bg-background px-3 text-sm"
                value={goals.dailySteps}
                onChange={(e) =>
                  setGoals({ ...goals, dailySteps: parseInt(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Daily protein goal (g)
              </label>
              <input
                type="number"
                min={20}
                step={10}
                className="h-10 w-full max-w-32 rounded-lg border border-border bg-background px-3 text-sm"
                value={goals.dailyProtein}
                onChange={(e) =>
                  setGoals({ ...goals, dailyProtein: parseInt(e.target.value) })
                }
              />
            </div>
            <div className="pt-2">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Goals"}
              </Button>
              {saved && (
                <span className="ml-3 text-sm text-green-600">Saved!</span>
              )}
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Profile
          </h2>
          <div className="space-y-4 rounded-xl border border-border bg-surface p-6">
            <Input label="Name" value={user?.name || ""} readOnly />
            <Input label="Email" value={user?.email || ""} readOnly />
          </div>
        </section>
      </div>
    </div>
  );
}