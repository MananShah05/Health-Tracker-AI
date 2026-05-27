"use client";

import { Lightbulb, AlertTriangle, Info } from "lucide-react";
import type { PatternItem } from "@/types";

const severityConfig = {
  info: { icon: Info, color: "text-blue-500", bg: "bg-blue-500/10" },
  warning: { icon: AlertTriangle, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  alert: { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10" },
};

interface PatternCardProps {
  pattern: PatternItem;
}

export function PatternCard({ pattern }: PatternCardProps) {
  const config = severityConfig[pattern.severity] || severityConfig.info;
  const Icon = config.icon;

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="mb-2 flex items-center gap-2">
        <div className={`rounded-lg p-1.5 ${config.bg}`}>
          <Icon className={`h-3.5 w-3.5 ${config.color}`} />
        </div>
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {pattern.type}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-foreground">{pattern.description}</p>
    </div>
  );
}