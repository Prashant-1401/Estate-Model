from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://localhost:5432/realestate"
    database_url_sync: str = "postgresql://localhost:5432/realestate"
    cors_origins: str = "http://localhost:3000"
    jwt_secret: str = "estatecrm-jwt-secret-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expiry_minutes: int = 1440

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
