import asyncio
from arq.connections import RedisSettings
from app.core.config import get_settings


class MockArqRedis:
    async def enqueue_job(self, function_name: str, *args, **kwargs):
        print(f"[Mock Redis] Enqueuing job: {function_name} with kwargs={kwargs}")
        if function_name == "generate_pattern_task":
            # Direct in-process execution in background
            from arq_worker import generate_pattern_task
            ctx = {"kwargs": kwargs}
            asyncio.create_task(generate_pattern_task(ctx))
        return None


def _redis_settings() -> RedisSettings:
    settings = get_settings()
    return RedisSettings.from_url(settings.REDIS_URL)


async def get_arq_redis():
    return MockArqRedis()