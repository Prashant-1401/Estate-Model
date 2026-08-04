import asyncio
import logging
from contextlib import asynccontextmanager
from functools import partial
from pathlib import Path

from alembic import command
from alembic.config import Config
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine
from app.routers import lead, property, project, user, dashboard, follow_up
from app.routers import module, role, form, company, workflow, notification, config, dashboard_config, dropdown
from app.seed import seed_users

logger = logging.getLogger(__name__)
BACKEND_DIR = Path(__file__).resolve().parent.parent


def run_migrations():
    cfg = Config(str(BACKEND_DIR / "alembic.ini"))
    cfg.set_main_option("script_location", str(BACKEND_DIR / "alembic"))
    command.upgrade(cfg, "head")


async def startup_init():
    try:
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, run_migrations)
        logger.info("Migrations completed")
    except Exception as e:
        logger.error(f"Migration failed: {e}")
    try:
        await seed_users()
        logger.info("Seed completed")
    except Exception as e:
        logger.error(f"Seed failed: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(startup_init())
    yield
    await task
    await engine.dispose()


app = FastAPI(title="RealEstate CRM API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user.auth_router)
app.include_router(lead.router)
app.include_router(property.router)
app.include_router(project.router)
app.include_router(user.router)
app.include_router(dashboard.router)
app.include_router(follow_up.router)
app.include_router(module.router)
app.include_router(role.router)
app.include_router(role.permission_router)
app.include_router(form.router)
app.include_router(company.router)
app.include_router(workflow.router)
app.include_router(notification.router)
app.include_router(config.router)
app.include_router(dashboard_config.router)
app.include_router(dropdown.router)


@app.get("/")
async def root():
    return {"message": "RealEstate CRM API", "docs": "/docs"}
