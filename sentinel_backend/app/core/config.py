import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "SentinelAI API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Cloud database URL (Render/Neon)
    DATABASE_URL: str = ""

    # PostgreSQL config
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "sanjay"
    POSTGRES_DB: str = "sentinel"
    POSTGRES_PORT: str = "5433"

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        # If DATABASE_URL is provided, use it.
        if self.DATABASE_URL:
            return self.DATABASE_URL
    
        # Otherwise, use local PostgreSQL.
        import urllib.parse
        encoded_password = urllib.parse.quote(self.POSTGRES_PASSWORD, safe="")
        return (
            f"postgresql://{self.POSTGRES_USER}:{encoded_password}"
            f"@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    
    # Neo4j config
    NEO4J_URI: str = "bolt://localhost:7687"
    NEO4J_USER: str = "neo4j"
    NEO4J_USERNAME: str = ""
    NEO4J_PASSWORD: str = "12Asdf*#_"
    NEO4J_DATABASE: str = "neo4j"

    from pydantic import model_validator
    @model_validator(mode='before')
    @classmethod
    def resolve_neo4j_user(cls, data: any) -> any:
        if isinstance(data, dict):
            username = data.get("NEO4J_USERNAME") or data.get("neo4j_username")
            if username and not (data.get("NEO4J_USER") or data.get("neo4j_user")):
                data["NEO4J_USER"] = username
        return data

    # Gemini config
    GEMINI_API_KEY: str = ""

    # JWT Security config
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days

    class Config:
        case_sensitive = True
        env_file = ".env"


settings = Settings()


print("POSTGRES_PORT =", settings.POSTGRES_PORT)
print("NEO4J_URI =", settings.NEO4J_URI)
print("NEO4J_USER =", settings.NEO4J_USER)
