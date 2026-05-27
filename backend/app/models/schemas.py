from datetime import datetime, date
from typing import Annotated, Literal
from pydantic import BaseModel, Field, EmailStr


# Auth
class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    name: str
    email: str
    goals: list["HabitGoal"] = []
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# Habit Goals
class HabitGoal(BaseModel):
    type: str  # "sleep", "nutrition", "movement"
    target: float
    unit: str  # "hours", "steps", "calories", "protein_g"


class HabitGoalUpdate(BaseModel):
    goals: list[HabitGoal]


# Food Log
class FoodItem(BaseModel):
    name: str
    calories: int | None = None
    protein: float | None = None
    carbs: float | None = None
    fat: float | None = None


class FoodLogCreate(BaseModel):
    date: date
    meal: str  # "breakfast", "lunch", "dinner", "snack"
    items: list[FoodItem]
    image_url: str | None = None
    source: str = "manual"


class FoodLogOut(BaseModel):
    id: str
    user_id: str
    date: date
    meal: str
    items: list[FoodItem]
    image_url: str | None = None
    source: str
    created_at: datetime


# Sleep Log
class SleepLogCreate(BaseModel):
    date: date
    bedtime: datetime
    wake_time: datetime
    duration_mins: int | None = None
    quality: int | None = Field(default=None, ge=1, le=5)


class SleepLogOut(BaseModel):
    id: str
    user_id: str
    date: date
    bedtime: datetime
    wake_time: datetime
    duration_mins: int
    quality: int | None = None
    created_at: datetime


# Activity Log
class ActivityLogCreate(BaseModel):
    date: date
    type: str  # "walk", "run", "gym", "yoga", "cycling", "swimming", "other"
    duration_mins: int
    steps: int | None = None
    calories: int | None = None


class ActivityLogOut(BaseModel):
    id: str
    user_id: str
    date: date
    type: str
    duration_mins: int
    steps: int | None = None
    calories: int | None = None
    created_at: datetime


# Pattern
class HabitScores(BaseModel):
    nutrition: float = Field(ge=0, le=100)
    sleep: float = Field(ge=0, le=100)
    movement: float = Field(ge=0, le=100)


class PatternItem(BaseModel):
    type: str  # "correlation", "streak", "anomaly"
    description: str
    severity: str = "info"  # "info", "warning", "alert"


class PatternResponse(BaseModel):
    user_id: str
    week_start: date
    patterns: list[PatternItem]
    habit_scores: HabitScores
    generated_at: datetime


# Chat
class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]