"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { HabitRing } from "@/components/dashboard/HabitRing";
import { PatternCard } from "@/components/dashboard/PatternCard";
import { StreakCard } from "@/components/dashboard/StreakCard";
import { WeeklySparkline } from "@/components/dashboard/WeeklySparkline";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";

const stagger = {
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  },
  item: {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  },
};

function computeStreak(
  dates: string[],
  targetHours?: number,
  getValue?: (log: unknown) => number
): number {
  if (dates.length === 0) return 0;

  const sorted = [...new Set(dates)].sort().reverse();
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  if (sorted[0] !== today && sorted[0] !== yesterday) return 0;

  let streak = 0;
  let checkDate = sorted[0] === today ? new Date() : new Date(Date.now() - 86400000);

  for (let i = 0; i < 365; i++) {
    const dateStr = checkDate.toISOString().split("T")[0];
    if (!sorted.includes(dateStr)) break;
    streak++;
    checkDate = new Date(checkDate.getTime() - 86400000);
  }

  return streak;
}

export default function DashboardPage() {
  const { habitScores, patterns, user, setLogModal, sleepLogs, activityLogs, foodLogs } =
    useAppStore();

  const streaks = useMemo(() => {
    const sleepDates = sleepLogs.map((l) => l.date);
    const activityDates = activityLogs.map((l) => l.date);
    const foodDates = foodLogs.map((l) => l.date);

    return {
      sleep: computeStreak(sleepDates),
      steps: computeStreak(activityDates),
      meals: computeStreak(foodDates),
    };
  }, [sleepLogs, activityLogs, foodLogs]);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Welcome back, {user?.name?.split(" ")[0]}
          </h1>
          <p className="text-sm text-muted-foreground">{today}</p>
        </div>
        <Button onClick={() => setLogModal(true, "food")} size="sm">
          <Plus className="h-4 w-4" />
          Quick Log
        </Button>
      </div>

      {/* Habit Rings */}
      <motion.div
        variants={stagger.container}
        initial="hidden"
        animate="show"
        className="mb-8 grid grid-cols-3 gap-4"
      >
        <motion.div variants={stagger.item}>
          <HabitRing label="Nutrition" score={habitScores.nutrition} color="#22c55e" />
        </motion.div>
        <motion.div variants={stagger.item}>
          <HabitRing label="Sleep" score={habitScores.sleep} color="#a78bfa" />
        </motion.div>
        <motion.div variants={stagger.item}>
          <HabitRing label="Movement" score={habitScores.movement} color="#f97316" />
        </motion.div>
      </motion.div>

      {/* Weekly Sparklines */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <WeeklySparkline />
      </motion.div>

      {/* Pattern Cards */}
      {patterns.length > 0 && (
        <motion.div
          variants={stagger.container}
          initial="hidden"
          animate="show"
          className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {patterns[0].patterns.map((pattern, i) => (
            <motion.div key={i} variants={stagger.item}>
              <PatternCard pattern={pattern} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {patterns.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-xl border border-dashed border-border bg-surface p-8 text-center"
        >
          <p className="text-sm text-muted-foreground">
            Log your first 7 days of data to unlock AI pattern insights
          </p>
        </motion.div>
      )}

      {/* Dynamic Streaks */}
      <motion.div
        variants={stagger.container}
        initial="hidden"
        animate="show"
        className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <motion.div variants={stagger.item}>
          <StreakCard label="Consistent Sleep" value={streaks.sleep} icon="🌙" />
        </motion.div>
        <motion.div variants={stagger.item}>
          <StreakCard label="Daily Steps" value={streaks.steps} icon="👟" />
        </motion.div>
        <motion.div variants={stagger.item}>
          <StreakCard label="Meal Logging" value={streaks.meals} icon="🍽️" />
        </motion.div>
      </motion.div>
    </div>
  );
}