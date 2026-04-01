from pydantic_settings import BaseSettings
from functools import lru_cache
import os
from dotenv import load_dotenv

# Load environment variables from .env if present
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

class Settings(BaseSettings):
    # Google Gemini
    google_api_key: str = os.getenv("GOOGLE_API_KEY", "")
    llm_model: str = os.getenv("LLM_MODEL", "gemini-2.0-flash")

    # Application Database (SQLModel/App State)
    app_database_url: str = os.getenv("APP_DATABASE_URL", "sqlite:///./app_state.db")

    # Server Config
    port: int = int(os.getenv("PORT", 8000))
    debug: bool = os.getenv("DEBUG", "true").lower() == "true"

    class Config:
        case_sensitive = False

@lru_cache()
def get_settings():
    return Settings()
