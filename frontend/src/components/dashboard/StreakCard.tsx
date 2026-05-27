interface StreakCardProps {
  label: string;
  value: number;
  icon: string;
}

export function StreakCard({ label, value, icon }: StreakCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4">
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">day streak — {label}</p>
      </div>
    </div>
  );
}