from datetime import date, datetime
from fastapi import APIRouter, HTTPException
from app.core.database import get_database
from app.api.auth import DEMO_USER_ID
from app.models.schemas import PatternResponse, PatternItem, HabitScores
from app.core.redis import get_arq_redis

router = APIRouter()


@router.get("", response_model=PatternResponse | None)
async def get_latest_pattern():
    user_id = DEMO_USER_ID
    db = get_database()
    doc = await db.patterns.find_one(
        {"user_id": user_id},
        sort=[("generated_at", -1)],
    )
    if not doc:
        return None

    return PatternResponse(
        user_id=doc["user_id"],
        week_start=date.fromisoformat(doc["week_start"]) if isinstance(doc["week_start"], str) else doc["week_start"],
        patterns=[PatternItem(**p) for p in doc["patterns"]],
        habit_scores=HabitScores(**doc["habit_scores"]),
        generated_at=doc["generated_at"],
    )


@router.post("/generate", response_model=dict)
async def generate_pattern():
    user_id = DEMO_USER_ID
    redis = await get_arq_redis()
    await redis.enqueue_job("generate_pattern_task", user_id=user_id)
    return {"job_queued": True}