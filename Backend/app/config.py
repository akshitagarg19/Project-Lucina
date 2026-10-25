import os
from pydantic import BaseModel

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_DB_FILE = os.path.join(BACKEND_DIR, "lucina.db").replace("\\", "/")

class Settings(BaseModel):
    APP_NAME: str = "Lucina AI"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    PORT: int = int(os.getenv("PORT", "8000"))
    SECRET_KEY: str = os.getenv("SECRET_KEY", "lucina-rechersion-2026-secret-key")
    # By default use SQLite with absolute path so that the application runs out of the box with zero external DB setup.
    # If DATABASE_URL is provided (e.g. PostgreSQL), it uses PostgreSQL seamlessly.
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_DB_FILE}")

settings = Settings()
