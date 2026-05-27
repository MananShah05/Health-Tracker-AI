import asyncio
from arq import run_worker
from datetime import date

from app.core.config import get_settings
from app.core.database import connect_db, close_db
from app.core.redis import get_arq_redis

settings = get_settings()


async def startup(ctx):
    await connect_db()


async def shutdown(ctx):
    await close_db()


async def generate_pattern_task(ctx):
    """ARQ task: fetches user data and generates AI pattern analysis."""
    user_id: str = ctx["kwargs"]["user_id"]

    from app.services.ai_pattern import generate_user_pattern
    from app.core.database import get_database

    result = await generate_user_pattern(user_id)
    db = get_database()
    await db.patterns.delete_many({"user_id": user_id})
    await db.patterns.insert_one(result)

    return {"generated_at": result["generated_at"]}


class WorkerSettings:
    settings_key = "health_tracker_arq"
    redis_url = settings.REDIS_URL
    startup = startup
    shutdown = shutdown
    functions = [generate_pattern_task]