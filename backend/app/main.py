from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine, Base
from app.routers import lead, property, project, user, inquiry, dashboard


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
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

app.include_router(lead.router)
app.include_router(property.router)
app.include_router(project.router)
app.include_router(user.router)
app.include_router(inquiry.router)
app.include_router(dashboard.router)


@app.get("/")
async def root():
    return {"message": "RealEstate CRM API", "docs": "/docs"}
