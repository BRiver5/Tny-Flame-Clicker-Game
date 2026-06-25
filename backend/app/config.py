from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite:///./data/tiny_flame.db"
    cors_origins: list[str] = [
        "http://localhost:8081",
        "http://localhost:19006",
        "http://127.0.0.1:8081",
        "http://10.0.2.2:8000",
    ]

    class Config:
        env_file = ".env"


settings = Settings()
