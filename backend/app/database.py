from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.config import settings

connect_args = {}
if "sslmode=require" in settings.database_url:
    connect_args["ssl"] = "require"

clean_url = settings.database_url.replace("?sslmode=require", "").replace("?sslmode=require&channel_binding=require", "")

engine = create_async_engine(clean_url, pool_pre_ping=True, connect_args=connect_args)
async_session = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with async_session() as session:
        yield session
