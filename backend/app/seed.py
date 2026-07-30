import time

from sqlalchemy import select

from app.database import async_session
from app.models.user import User
from app.auth import hash_password


async def seed_users():
    async with async_session() as db:
        for i, (email, name, role, password) in enumerate([
            ("admin@estatecrm.com", "Admin", "admin", "admin123"),
            ("manager@estatecrm.com", "Manager", "manager", "manager123"),
            ("agent@estatecrm.com", "Agent", "agent", "agent123"),
        ]):
            result = await db.execute(select(User).where(User.email == email))
            existing = result.scalar_one_or_none()
            if existing:
                continue

            uid = f"UR-{int(time.time() * 1000000) + i}"
            user = User(
                id=uid,
                name=name,
                email=email,
                role=role,
                status="Active",
                hashed_password=hash_password(password),
            )
            db.add(user)

        await db.commit()
