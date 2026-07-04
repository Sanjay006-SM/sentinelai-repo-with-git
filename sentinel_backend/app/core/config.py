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

    # The hardcoded resolve_neo4j_user validator was removed to prevent overriding Render environment variables.

    # Gemini config
    GEMINI_API_KEY: str = ""

    # JWT Security config
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # Feature Flags
    ENABLE_GRAPH_EVIDENCE_ENGINE: bool = False

    class Config:
        case_sensitive = True
        env_file = ".env"
        str_strip_whitespace = True


settings = Settings()


print("POSTGRES_PORT =", settings.POSTGRES_PORT)
print("NEO4J_URI =", settings.NEO4J_URI)
print("NEO4J_USER =", settings.NEO4J_USER)
print("NEO4J_PASSWORD length =", len(settings.NEO4J_PASSWORD), "starts with =", settings.NEO4J_PASSWORD[:4] + "...")
print("NEO4J_DATABASE =", settings.NEO4J_DATABASE)
