from math import ceil

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import Select

MAX_PER_PAGE = 100


def _page_params(page: int, per_page: int) -> tuple[int, int]:
    page = max(1, page)
    per_page = min(max(1, per_page), MAX_PER_PAGE)
    return page, per_page


async def paginate(db: AsyncSession, stmt: Select, page: int, per_page: int) -> tuple[list, int, int]:
    page, per_page = _page_params(page, per_page)
    count_stmt = select(func.count()).select_from(stmt.order_by(None).subquery())
    total = (await db.execute(count_stmt)).scalar() or 0
    items = (await db.execute(stmt.offset((page - 1) * per_page).limit(per_page))).scalars().all()
    return list(items), total, max(1, ceil(total / per_page))
