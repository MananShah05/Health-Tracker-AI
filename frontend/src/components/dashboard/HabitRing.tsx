"use client";

import { useSpring, animated } from "@react-spring/web";

interface HabitRingProps {
  label: string;
  score: number;
  color: string;
}

export function HabitRing({ label, score, color }: HabitRingProps) {
  const spring = useSpring({
    from: { value: 0 },
    to: { value: score },
    config: { tension: 60, friction: 20 },
  });

  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface p-4">
      <div className="relative h-24 w-24">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-border"
          />
          <animated.circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={spring.value.to(
              (v) => circumference - (v / 100) * circumference
            )}
            style={{ transition: "stroke-dashoffset 0.5s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <animated.span className="text-lg font-semibold text-foreground">
            {spring.value.to((v) => Math.round(v))}
          </animated.span>
        </div>
      </div>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </div>
  );
}