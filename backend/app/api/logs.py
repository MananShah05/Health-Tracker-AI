from datetime import date, datetime
from fastapi import APIRouter, HTTPException, Query, Path
from bson import ObjectId
from app.core.database import get_database
from app.api.auth import DEMO_USER_ID
from app.models.schemas import (
    FoodLogCreate, FoodLogOut,
    SleepLogCreate, SleepLogOut,
    ActivityLogCreate, ActivityLogOut,
    HabitGoalUpdate, HabitGoal,
)

router = APIRouter()


LOG_COLLECTIONS = {
    "food": "food_logs",
    "sleep": "sleep_logs",
    "activity": "activity_logs",
}


@router.get("/goals", response_model=list[HabitGoal])
async def get_goals():
    user_id = DEMO_USER_ID
    db = get_database()
    user = await db.users.find_one({"_id": user_id})
    goals = user.get("goals", []) if user else []
    return [HabitGoal(**g) for g in goals]


@router.post("/food", response_model=FoodLogOut)
async def create_food_log(data: FoodLogCreate):
    user_id = DEMO_USER_ID
    db = get_database()
    doc = {
        "user_id": user_id,
        "date": data.date.isoformat(),
        "meal": data.meal,
        "items": [item.model_dump() for item in data.items],
        "image_url": data.image_url,
        "source": data.source,
        "created_at": datetime.utcnow(),
    }
    result = await db.food_logs.insert_one(doc)
    return FoodLogOut(
        id=str(result.inserted_id),
        user_id=user_id,
        **doc,
        date=date.fromisoformat(doc["date"]),
    )


@router.post("/sleep", response_model=SleepLogOut)
async def create_sleep_log(data: SleepLogCreate):
    user_id = DEMO_USER_ID
    db = get_database()
    duration_mins = data.duration_mins
    if duration_mins is None:
        delta = data.wake_time - data.bedtime
        duration_mins = int(delta.total_seconds() // 60)

    doc = {
        "user_id": user_id,
        "date": data.date.isoformat(),
        "bedtime": data.bedtime.isoformat(),
        "wake_time": data.wake_time.isoformat(),
        "duration_mins": duration_mins,
        "quality": data.quality,
        "created_at": datetime.utcnow(),
    }
    result = await db.sleep_logs.insert_one(doc)
    return SleepLogOut(
        id=str(result.inserted_id),
        user_id=user_id,
        duration_mins=duration_mins,
        **doc,
    )


@router.post("/activity", response_model=ActivityLogOut)
async def create_activity_log(data: ActivityLogCreate):
    user_id = DEMO_USER_ID
    db = get_database()
    doc = {
        "user_id": user_id,
        "date": data.date.isoformat(),
        "type": data.type,
        "duration_mins": data.duration_mins,
        "steps": data.steps,
        "calories": data.calories,
        "created_at": datetime.utcnow(),
    }
    result = await db.activity_logs.insert_one(doc)
    return ActivityLogOut(
        id=str(result.inserted_id),
        user_id=user_id,
        **doc,
        date=date.fromisoformat(doc["date"]),
    )


@router.get("", response_model=dict)
async def get_logs(
    start_date: date | None = None,
    end_date: date | None = None,
    log_type: str | None = None,
):
    user_id = DEMO_USER_ID
    db = get_database()

    date_filter = {}
    if start_date:
        date_filter["$gte"] = start_date.isoformat()
    if end_date:
        date_filter["$lte"] = end_date.isoformat()

    result = {}

    if log_type is None or log_type == "food":
        query = {"user_id": user_id}
        if date_filter:
            query["date"] = date_filter
        cursor = db.food_logs.find(query).sort("date", -1)
        result["food"] = [
            FoodLogOut(
                id=str(doc["_id"]),
                user_id=doc["user_id"],
                date=date.fromisoformat(doc["date"]),
                meal=doc["meal"],
                items=doc["items"],
                image_url=doc.get("image_url"),
                source=doc.get("source", "manual"),
                created_at=doc["created_at"],
            )
            async for doc in cursor
        ]

    if log_type is None or log_type == "sleep":
        query = {"user_id": user_id}
        if date_filter:
            query["date"] = date_filter
        cursor = db.sleep_logs.find(query).sort("date", -1)
        result["sleep"] = [
            SleepLogOut(
                id=str(doc["_id"]),
                user_id=doc["user_id"],
                date=date.fromisoformat(doc["date"]),
                bedtime=datetime.fromisoformat(doc["bedtime"]),
                wake_time=datetime.fromisoformat(doc["wake_time"]),
                duration_mins=doc["duration_mins"],
                quality=doc.get("quality"),
                created_at=doc["created_at"],
            )
            async for doc in cursor
        ]

    if log_type is None or log_type == "activity":
        query = {"user_id": user_id}
        if date_filter:
            query["date"] = date_filter
        cursor = db.activity_logs.find(query).sort("date", -1)
        result["activity"] = [
            ActivityLogOut(
                id=str(doc["_id"]),
                user_id=doc["user_id"],
                date=date.fromisoformat(doc["date"]),
                type=doc["type"],
                duration_mins=doc["duration_mins"],
                steps=doc.get("steps"),
                calories=doc.get("calories"),
                created_at=doc["created_at"],
            )
            async for doc in cursor
        ]

    return result


@router.put("/goals", response_model=dict)
async def update_goals(data: HabitGoalUpdate):
    user_id = DEMO_USER_ID
    db = get_database()
    await db.users.update_one(
        {"_id": user_id},
        {"$set": {"goals": [g.model_dump() for g in data.goals]}},
    )
    return {"success": True}


@router.delete("/{type}/{id}", response_model=dict)
async def delete_log(
    type: str,
    id: str,
):
    user_id = DEMO_USER_ID
    db = get_database()
    result = await db[LOG_COLLECTIONS[type]].delete_one({
        "_id": id,
        "user_id": user_id,
    })
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Log not found")
    return {"deleted": True}


@router.patch("/{type}/{id}", response_model=dict)
async def update_log(
    type: str,
    id: str,
    updates: dict,
):
    user_id = DEMO_USER_ID
    db = get_database()
    updates.pop("user_id", None)
    updates.pop("_id", None)
    result = await db[LOG_COLLECTIONS[type]].find_one_and_update(
        {"_id": id, "user_id": user_id},
        {"$set": updates},
        return_document=True,
    )
    if result is None:
        raise HTTPException(status_code=404, detail="Log not found")
    return {"updated": True}