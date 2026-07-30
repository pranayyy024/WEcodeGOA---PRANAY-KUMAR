import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file if present
env_path = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(dotenv_path=env_path)


class Settings:
    """Central configuration for CampSupport AI Backend."""
    APP_NAME: str = os.getenv("APP_NAME", "CampSupport AI")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() in ("true", "1", "t")
    API_V1_PREFIX: str = os.getenv("API_V1_PREFIX", "/api/v1")

    # LLM Settings
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "mock").lower()
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./campsupport.db")

    # Ticketing
    TICKETING_PROVIDER: str = os.getenv("TICKETING_PROVIDER", "mock").lower()
    ZENDESK_SUBDOMAIN: str = os.getenv("ZENDESK_SUBDOMAIN", "")
    ZENDESK_EMAIL: str = os.getenv("ZENDESK_EMAIL", "")
    ZENDESK_API_TOKEN: str = os.getenv("ZENDESK_API_TOKEN", "")

    # LlamaIndex / RAG
    RAG_CONFIDENCE_THRESHOLD: float = float(os.getenv("RAG_CONFIDENCE_THRESHOLD", "0.75"))
    APPROVED_DOCS_PATH: str = os.getenv("APPROVED_DOCS_PATH", "./data/approved_docs")


settings = Settings()
