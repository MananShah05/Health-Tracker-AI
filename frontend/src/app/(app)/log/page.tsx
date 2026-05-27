"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";

export default function LogPage() {
  const [text, setText] = useState("");
  const [meal, setMeal] = useState("breakfast");

  return (
    <div className="p-6 lg:p-8">
      <h1 className="mb-6 text-xl font-semibold text-foreground">Log Entry</h1>

      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-medium">Meal type</label>
          <select
            className="h-10 w-full max-w-xs rounded-lg border border-border bg-background px-3 text-sm"
            value={meal}
            onChange={(e) => setMeal(e.target.value)}
          >
            <option>breakfast</option>
            <option>lunch</option>
            <option>dinner</option>
            <option>snack</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-medium">What did you eat?</label>
          <textarea
            className="min-h-32 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground"
            placeholder="Describe your meal or add items one per line..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <Button>Save</Button>
      </div>
    </div>
  );
}