export interface User {
  id: string;
  name: string;
  email: string;
  goals: HabitGoal[];
  created_at: string;
}

export interface HabitGoal {
  type: "sleep" | "nutrition" | "movement";
  target: number;
  unit: string;
}

export interface FoodItem {
  name: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface FoodLog {
  id: string;
  user_id: string;
  date: string;
  meal: "breakfast" | "lunch" | "dinner" | "snack";
  items: FoodItem[];
  image_url?: string;
  source: string;
  created_at: string;
}

export interface SleepLog {
  id: string;
  user_id: string;
  date: string;
  bedtime: string;
  wake_time: string;
  duration_mins: number;
  quality?: number;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  date: string;
  type: string;
  duration_mins: number;
  steps?: number;
  calories?: number;
  created_at: string;
}

export interface HabitScores {
  nutrition: number;
  sleep: number;
  movement: number;
}

export interface PatternItem {
  type: "correlation" | "streak" | "anomaly";
  description: string;
  severity: "info" | "warning" | "alert";
}

export interface Pattern {
  user_id: string;
  week_start: string;
  patterns: PatternItem[];
  habit_scores: HabitScores;
  generated_at: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}