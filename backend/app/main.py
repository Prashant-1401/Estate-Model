from contextlib import asynccontextmanager
from pathlib import Path

from alembic import command
from alembic.config import Config
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine
from app.routers import lead, property, project, user, inquiry, dashboard
from app.seed import seed_users

BACKEND_DIR = Path(__file__).resolve().parent.parent


def run_migrations():
    cfg = Config(str(BACKEND_DIR / "alembic.ini"))
    cfg.set_main_option("script_location", str(BACKEND_DIR / "alembic"))
    command.upgrade(cfg, "head")


@asynccontextmanager
async def lifespan(app: FastAPI):
    run_migrations()
    await seed_users()
    yield
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
app.include_router(inquiry.router)
app.include_router(dashboard.router)


@app.get("/")
async def root():
    return {"message": "RealEstate CRM API", "docs": "/docs"}
