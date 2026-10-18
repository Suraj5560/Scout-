from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings
from backend.app.runs import router as runs_router

app = FastAPI(
    title="Scout API",
    description="Multi-Agent Opportunity Radar Backend",
    version="0.1.0"
)

# CORS configuration for Vite
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(runs_router)

@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "app": "Scout: Multi-Agent Opportunity Radar",
        "version": "0.1.0",
        "mock_mode": settings.MOCK_MODE,
        "max_parallel_agents": settings.MAX_PARALLEL_AGENTS,
        "run_deadline_s": settings.RUN_DEADLINE_S
    }
