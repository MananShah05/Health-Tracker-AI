from datetime import datetime
from fastapi import APIRouter, HTTPException, status
from app.core.database import get_database
from app.models.schemas import UserOut, HabitGoal

router = APIRouter()

# Hardcoded demo user — auth is fully removed for local dev
DEMO_USER_ID = "6a15fc1ccb137a320ea616b5"


async def get_current_user_id() -> str:
    """Always returns the demo user ID."""
    return DEMO_USER_ID


@router.get("/me", response_model=UserOut)
async def get_me():
    db = get_database()
    user = await db.users.find_one({"_id": DEMO_USER_ID})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    goals = user.get("goals", [])
    validated_goals: list[HabitGoal] = [HabitGoal(**g) for g in goals] if goals else []

    return UserOut(
        id=str(user["_id"]),
        name=user["name"],
        email=user["email"],
        goals=validated_goals,
        created_at=user["created_at"],
    )


@router.get("/onboarding", response_model=dict)
async def get_onboarding_status():
    db = get_database()
    user = await db.users.find_one({"_id": DEMO_USER_ID})
    goals = user.get("goals", []) if user else []
    completed = len(goals) > 0
    return {"completed": completed, "goals_count": len(goals)}