from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    APP_NAME: str = "Health Tracker API"
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7

    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "health_tracker"

    REDIS_URL: str = "redis://localhost:6379"

    ANTHROPIC_API_KEY: str = ""
    OPENAI_API_KEY: str = ""

    @property
    def mongo_uri(self) -> str:
        return self.MONGODB_URL


@lru_cache
def get_settings() -> Settings:
    return Settings()