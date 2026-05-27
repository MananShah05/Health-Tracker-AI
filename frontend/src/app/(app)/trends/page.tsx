"use client";

import { useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from "recharts";
import { useAppStore } from "@/store/useAppStore";
import { formatDate } from "@/lib/utils";

export default function TrendsPage() {
  const { foodLogs, sleepLogs, activityLogs } = useAppStore();

  const sleepData = useMemo(() => {
    return [...sleepLogs]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30)
      .map((l) => ({
        date: formatDate(l.date),
        hours: Math.round((l.duration_mins / 60) * 10) / 10,
        quality: l.quality || 0,
      }));
  }, [sleepLogs]);

  const activityData = useMemo(() => {
    const byDate: Record<string, number> = {};
    for (const l of activityLogs) {
      byDate[l.date] = (byDate[l.date] || 0) + (l.steps || 0);
    }
    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-30)
      .map(([date, steps]) => ({ date: formatDate(date), steps }));
  }, [activityLogs]);

  return (
    <div className="p-6 lg:p-8">
      <h1 className="mb-6 text-xl font-semibold text-foreground">Trends</h1>

      <div className="mb-8 space-y-8">
        <div>
          <h2 className="mb-4 text-sm font-medium text-muted-foreground">Sleep (last 30 days)</h2>
          <div className="h-64 rounded-xl border border-border bg-surface p-4">
            {sleepData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sleepData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="hours"
                    stroke="#a78bfa"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No sleep data yet
              </p>
            )}
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-sm font-medium text-muted-foreground">Steps (last 30 days)</h2>
          <div className="h-64 rounded-xl border border-border bg-surface p-4">
            {activityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <Tooltip />
                  <Bar dataKey="steps" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No activity data yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}