from pydantic_settings import BaseSettings

from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit


def _to_sync_url(url: str) -> str:
    parts = urlsplit(url)
    query = [
        (k, v)
        for k, v in parse_qsl(parts.query, keep_blank_values=True)
        if k != "channel_binding"
    ]
    return urlunsplit(("postgresql", parts.netloc, parts.path, urlencode(query), parts.fragment))


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://localhost:5432/realestate"
    database_url_sync: str = ""
    cors_origins: str = "http://localhost:3000"
    jwt_secret: str = "estatecrm-jwt-secret-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expiry_minutes: int = 1440

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def database_url_sync_resolved(self) -> str:
        return self.database_url_sync or _to_sync_url(self.database_url)

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
