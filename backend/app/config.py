import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from project root
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

class Settings:
    MOCK_MODE: bool = os.getenv("MOCK_MODE", "false").lower() in ("true", "1", "yes")
    MOCK_FAIL_RATE: float = float(os.getenv("MOCK_FAIL_RATE", "0.0"))
    MAX_PARALLEL_AGENTS: int = int(os.getenv("MAX_PARALLEL_AGENTS", "6"))
    RUN_DEADLINE_S: int = int(os.getenv("RUN_DEADLINE_S", "180"))
    
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "openai")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gpt-4o-mini")
    
    TINYFISH_API_KEY: str = os.getenv("TINYFISH_API_KEY", "")
    TINYFISH_API_BASE: str = os.getenv("TINYFISH_API_BASE", "https://agent.tinyfish.ai/v1")
    
    CACHE_DIR: str = os.getenv("CACHE_DIR", ".cache")
    CACHE_TTL_MINUTES: int = int(os.getenv("CACHE_TTL_MINUTES", "30"))

settings = Settings()
