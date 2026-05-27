import json
from datetime import datetime, timedelta, timezone
from app.core.database import get_database
from app.core.config import get_settings

settings = get_settings()

DISCLAIMER = (
    "\n\n⚠️ *This is not a medical diagnosis. Please consult a healthcare professional for personalized advice.*"
)


async def get_chat_response(user_id: str, message: str):
    db = get_database()
    cutoff = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    cutoff_date = cutoff[:10]

    food_logs = []
    async for doc in db.food_logs.find({"user_id": user_id, "date": {"$gte": cutoff_date}}):
        food_logs.append(doc)
    sleep_logs = []
    async for doc in db.sleep_logs.find({"user_id": user_id, "date": {"$gte": cutoff_date}}):
        sleep_logs.append(doc)
    activity_logs = []
    async for doc in db.activity_logs.find({"user_id": user_id, "date": {"$gte": cutoff_date}}):
        activity_logs.append(doc)
    user = await db.users.find_one({"_id": user_id})

    context = f"""**User's Recent Data (last 7 days)**:
- Goals: {json.dumps(user.get("goals", []))}
- Food Logs: {json.dumps(food_logs, default=str)}
- Sleep Logs: {json.dumps(sleep_logs, default=str)}
- Activity Logs: {json.dumps(activity_logs, default=str)}"""

    system = f"""You are a friendly, empathetic health companion. You help users understand their health patterns and suggest habits based on their data. You respond warmly, practically, and are never clinical.

IMPORTANT: You are NOT a doctor. Never diagnose. Always suggest with care and include the disclaimer that they should consult a healthcare professional.

User data context:
{context}"""

    from anthropic import Anthropic

    client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    with client.messages.stream(
        model="claude-sonnet-4-7-20250514",
        max_tokens=1024,
        system=system,
        messages=[{"role": "user", "content": f"{message}{DISCLAIMER}"}],
    ) as stream:
        for text in stream.text_stream:
            yield text