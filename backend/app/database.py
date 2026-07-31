from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.config import settings

from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

connect_args = {}
if "sslmode=require" in settings.database_url:
    connect_args["ssl"] = "require"


def _clean_url(url: str) -> str:
    parts = urlsplit(url)
    query = [
        kv
        for kv in parse_qsl(parts.query, keep_blank_values=True)
        if kv[0] not in ("sslmode", "channel_binding")
    ]
    return urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(query), parts.fragment))


clean_url = _clean_url(settings.database_url)

engine = create_async_engine(clean_url, pool_pre_ping=True, connect_args=connect_args)
async_session = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with async_session() as session:
        yield session
