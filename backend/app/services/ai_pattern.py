import json
from datetime import datetime, date, timedelta, timezone
from app.core.database import get_database
from app.core.config import get_settings

settings = get_settings()


async def generate_user_pattern(user_id: str) -> dict:
    from anthropic import Anthropic

    db = get_database()
    cutoff = (datetime.now(timezone.utc) - timedelta(days=14)).isoformat()

    food_logs = []
    async for doc in db.food_logs.find({"user_id": user_id, "date": {"$gte": cutoff[:10]}}):
        food_logs.append(doc)

    sleep_logs = []
    async for doc in db.sleep_logs.find({"user_id": user_id, "date": {"$gte": cutoff[:10]}}):
        sleep_logs.append(doc)

    activity_logs = []
    async for doc in db.activity_logs.find({"user_id": user_id, "date": {"$gte": cutoff[:10]}}):
        activity_logs.append(doc)

    user = await db.users.find_one({"_id": user_id})

    prompt = f"""Analyze the following health data for patterns and insights. Return a JSON object with:
- "habit_scores": object with "nutrition", "sleep", "movement" scores (0-100)
- "patterns": array of pattern objects, each with "type" (correlation/streak/anomaly), "description", "severity" (info/warning/alert)

**User Goals**: {json.dumps(user.get("goals", []))}

**Food Logs (last 14 days)**: {json.dumps(food_logs[:20], default=str)}
**Sleep Logs (last 14 days)**: {json.dumps(sleep_logs[:20], default=str)}
**Activity Logs (last 14 days)**: {json.dumps(activity_logs[:20], default=str)}

Return ONLY valid JSON, no markdown, no explanation."""

    client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    response = client.messages.create(
        model="claude-sonnet-4-7-20250514",
        max_tokens=1024,
        system="You are a health analyst AI. Analyze the user's health data and return JSON patterns. Be specific and actionable. Use the user's actual data, not hypothetical scenarios.",
        messages=[{"role": "user", "content": prompt}],
    )

    text = response.content[0].text.strip()
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        start = text.find("{")
        end = text.rfind("}") + 1
        data = json.loads(text[start:end])

    week_start = (date.today() - timedelta(days=date.today().weekday())).isoformat()

    return {
        "user_id": user_id,
        "week_start": week_start,
        "patterns": data.get("patterns", []),
        "habit_scores": data.get("habit_scores", {"nutrition": 50, "sleep": 50, "movement": 50}),
        "generated_at": datetime.utcnow(),
    }


async def generate_patterns_job(ctx, user_id: str):
    result = await generate_user_pattern(user_id)
    db = get_database()
    await db.patterns.delete_many({"user_id": user_id})
    await db.patterns.insert_one(result)
    return result