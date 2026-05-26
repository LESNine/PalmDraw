import os
from pathlib import Path


class Settings:
    APP_NAME: str = "palmdraw"
    APP_VERSION: str = "0.1.0"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]
    UPLOAD_DIR: Path = Path("./uploads")
    MAX_CACHE_SIZE_MB: int = 2048
    PLOT_DPI: int = 150
    PREVIEW_DPI: int = 72
    ALLOWED_EXTENSIONS: set[str] = {".nc", ".nc4", ".cdf"}

    def __init__(self):
        self.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


settings = Settings()
