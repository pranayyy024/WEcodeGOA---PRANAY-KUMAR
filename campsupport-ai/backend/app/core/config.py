import os

class Settings:
    APP_NAME = "campsupport-ai"
    API_KEY = os.getenv("API_KEY", "")

settings = Settings()
