"use client";

import { useMemo } from "react";
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";
import { useAppStore } from "@/store/useAppStore";
import { formatDate } from "@/lib/utils";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function WeeklySparkline() {
  const { foodLogs, sleepLogs, activityLogs } = useAppStore();

  const data = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      const dateStr = d.toISOString().split("T")[0];
      const dayName = DAYS[d.getDay() === 0 ? 6 : d.getDay() - 1];

      const foodCount = foodLogs.filter((l) => l.date === dateStr).length;
      const sleepHrs =
        sleepLogs
          .filter((l) => l.date === dateStr)
          .reduce((sum, l) => sum + l.duration_mins / 60, 0) / (sleepLogs.filter((l) => l.date === dateStr).length || 1);
      const steps = activityLogs
        .filter((l) => l.date === dateStr)
        .reduce((sum, l) => sum + (l.steps || 0), 0);

      return {
        day: dayName,
        food: foodCount,
        sleep: Math.round(sleepHrs * 10) / 10,
        steps: steps / 1000,
      };
    });
  }, [foodLogs, sleepLogs, activityLogs]);

  return (
    <div className="flex gap-6 overflow-x-auto">
      {["food", "sleep", "steps"].map((key) => (
        <div key={key} className="min-w-0 flex-1">
          <p className="mb-2 text-xs font-medium capitalize text-muted-foreground">
            {key === "food" ? "Meals logged" : key === "sleep" ? "Sleep (hrs)" : "Steps (k)"}
          </p>
          <div className="h-16">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <Line
                  type="monotone"
                  dataKey={key}
                  stroke={
                    key === "food" ? "#22c55e" : key === "sleep" ? "#a78bfa" : "#f97316"
                  }
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ))}
    </div>
  );
}