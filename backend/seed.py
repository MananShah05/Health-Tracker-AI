"""Seed a demo user for local development."""
import asyncio
from datetime import datetime
from app.core.database import connect_db, close_db, get_database
from app.core.security import get_password_hash


async def seed():
    await connect_db()
    db = get_database()

    email = "demo@test.com"
    password = "password123"
    name = "Demo User"

    existing = await db.users.find_one({"email": email})
    if existing:
        print(f"Demo user already exists: {email}")
    else:
        await db.users.insert_one({
            "name": name,
            "email": email,
            "password_hash": get_password_hash(password),
            "goals": [],
            "onboarding_complete": False,
            "created_at": datetime.utcnow(),
        })
        print(f"Demo user created: {email} / {password}")

    await close_db()


if __name__ == "__main__":
    asyncio.run(seed())