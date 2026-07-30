import os
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "CampSupport AI"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"

    # LLM & RAG Provider Selection: 'mock' (default offline mode), 'openai', or 'gemini'
    LLM_PROVIDER: str = "mock"
    OPENAI_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None

    # LlamaIndex Configuration
    APPROVED_DOCS_PATH: str = "./data/approved_docs"
    RAG_CONFIDENCE_THRESHOLD: float = 0.65

    # Database Settings (MongoDB recommended for hackathon & flexible JSON documents)
    DATABASE_URL: str = "mongodb://localhost:27017"
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "campsupport"

    # Ticketing Integration: 'mock', 'zendesk', or 'servicenow'
    TICKETING_PROVIDER: str = "mock"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
