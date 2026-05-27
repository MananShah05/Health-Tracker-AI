# PRD — AI Health Habit Tracker

**Version:** 0.1 | **Status:** Draft

---

## 1. Problem

Users log health data across fragmented apps. No single layer connects food, sleep, and activity to surface actionable, personalized behavioral patterns. Generic advice doesn't adapt to the individual.

---

## 2. Goal

Single-surface AI companion that:
1. Ingests food logs, sleep data, activity
2. Detects unhealthy patterns over time
3. Surfaces contextual habit suggestions powered by LLM
4. Feels delightful — not clinical

---

## 3. Users

| Persona | Pain |
|---|---|
| Fitness-curious professional (25–40) | Has data, no insight |
| Recovering from illness / lifestyle change | Needs structure, not judgment |
| Biohacker / optimizer | Wants correlation discovery |

---

## 4. Core Features (MVP)

### 4.1 Daily Log
- Food entry (text/image → AI parses macros via GPT-4o vision)
- Sleep log (manual or wearable sync)
- Activity log (manual or Apple Health / Google Fit)

### 4.2 AI Pattern Engine
- Weekly pattern detection (e.g. "Poor sleep 3 nights after high-carb dinners")
- Habit score (0–100) per category: Nutrition / Sleep / Movement
- Streak tracking per habit goal

### 4.3 AI Chat Companion
- Context-aware chat: "Why do I feel tired on Mondays?"
- Responds with user's own data + general health knowledge
- Avoid medical diagnosis — suggestion only, with disclaimer

### 4.4 Dashboard
- Weekly overview: rings + sparklines
- Pattern highlight cards (staggered entry, Emil-style)
- Trend charts (last 30 / 90 days)

### 4.5 Habit Goals
- User sets goals (e.g. "Sleep 7h+", "Walk 8k steps")
- AI adjusts suggestions based on goal gap

---

## 5. Tech Stack (Revised)

### Frontend
| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSR for AI route handlers, SEO |
| Animation | Framer Motion | Spring physics, layout animations |
| Scroll | Lenis | Smooth dashboard scrolling |
| Charts | Recharts or D3 | Flexible health sparklines |
| UI | Tailwind + custom CSS vars | Speed + design token control |
| State | Zustand | Lightweight, no boilerplate |

### Backend
| Layer | Choice | Reason |
|---|---|---|
| API | FastAPI | Async, fast, typed, great for AI pipelines |
| AI | Anthropic Claude API (claude-sonnet-4) | Pattern analysis + chat |
| Vision | GPT-4o | Food image → macro parsing |
| Task Queue | ARQ (Redis-backed) | Background pattern jobs, non-blocking |
| Cache | Redis | Cache AI suggestions (TTL 6h), rate limit |
| Auth | Supabase Auth or Auth.js | Fast setup, JWT |

### DB
| Layer | Choice | Reason |
|---|---|---|
| Primary | MongoDB | Schema flexibility as health data evolves |
| Timeseries | MongoDB Time Series Collections | Native support for log data |
| Cache | Redis | Fast ephemeral layer |

### Infra (suggested)
- Frontend: Vercel
- Backend: Railway or Fly.io
- DB: MongoDB Atlas

---

## 6. Data Models (Mongo)

```
User { _id, name, email, goals[], createdAt }

FoodLog { userId, date, meal, items[{name, cal, protein, carbs, fat}], imageUrl?, source }

SleepLog { userId, date, bedtime, wakeTime, durationMins, quality? }

ActivityLog { userId, date, type, durationMins, steps?, calories? }

Pattern { userId, weekStart, patterns[{type, description, severity}], habitScores{nutrition,sleep,movement}, generatedAt }
```

---

## 7. AI Architecture

```
User logs data
    ↓
Cron / ARQ job runs weekly (or on-demand)
    ↓
FastAPI collects last 14 days of logs
    ↓
Prompt Claude: "Here is user data. Find behavioral patterns. Output JSON."
    ↓
Store Pattern doc in MongoDB
    ↓
Frontend reads cached patterns — no LLM call on every page load
    ↓
Chat: real-time Claude call with user context injected as system prompt
```

**Why not stream patterns live?**
Pattern analysis is expensive. Cache it. Chat is interactive — stream it.

---

## 8. Emil-Inspired UI Principles

| Element | Decision |
|---|---|
| Dashboard entry | Stagger cards 50ms apart, `translateY(8px) → 0` + fade |
| Habit rings | Spring animation on mount (Framer Motion `useSpring`) |
| Log input | Modal enters `scale(0.96) opacity 0` → `scale(1) opacity 1`, 220ms ease-out |
| Pattern cards | Layout animation with `AnimatePresence` — shift on add/remove |
| Chat messages | CSS transition, not keyframes — rapid message stream = interruptible |
| Button press | `scale(0.97)` active state, 120ms |
| Log modal exit | Faster than enter — 150ms vs 220ms |
| Hover states | Gated behind `@media (hover: hover) and (pointer: fine)` |

---

## 9. Screens

1. **Onboarding** — goals setup, wearable connect
2. **Dashboard** — weekly overview, pattern highlights, streak rings
3. **Log** — food / sleep / activity input (tabbed sheet)
4. **Trends** — 30/90 day charts per category
5. **AI Chat** — context-aware health assistant
6. **Settings** — goals, integrations, notifications

---

## 10. Non-Goals (v1)

- No wearable sync (manual only in MVP, SDK later)
- No social/sharing
- No medical records integration
- No calorie scanning via barcode (v2)

---

## 11. Success Metrics

| Metric | Target (Month 3) |
|---|---|
| D7 retention | > 40% |
| Logs per active user/week | > 5 |
| Pattern card click-through | > 30% |
| Chat sessions per week | > 2 per user |

---

## 12. Risks

| Risk | Mitigation |
|---|---|
| LLM gives bad health advice | Hard disclaimer on all AI output, no diagnosis |
| Pattern detection low quality | Require min 7 days data before showing patterns |
| Users stop logging | Push notification reminders + streak mechanic |
| MongoDB timeseries query perf | Index on `userId + date`, cap collection size |

---

## 13. Build Order

```
Phase 1 (Weeks 1–3): Auth + log input + MongoDB schema
Phase 2 (Weeks 4–5): Dashboard UI + charts + streak rings
Phase 3 (Weeks 6–7): AI pattern engine + cron job
Phase 4 (Week 8): AI chat with context injection
Phase 5 (Week 9–10): Polish — animations, Emil principles, perf
```

---

*Stack is solid. Main additions: Redis cache layer + ARQ background jobs. These are the difference between "demo" and "production AI app."*
