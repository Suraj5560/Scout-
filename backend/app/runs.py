import asyncio
import uuid
import json
import logging
from typing import Dict, Optional, Any
from fastapi import APIRouter, HTTPException
from sse_starlette.sse import EventSourceResponse
from backend.app.models import (
    CreateRunRequest,
    CreateRunResponse,
    FinalResult,
    CreateDraftRequest,
    ApplicationDraft
)
from backend.orchestrator.executor import RunExecutor
from backend.orchestrator.drafts import create_application_draft

logger = logging.getLogger("scout.runs")

router = APIRouter(prefix="/api/runs", tags=["runs"])

class RunManager:
    def __init__(self):
        self.queues: Dict[str, asyncio.Queue] = {}
        self.results: Dict[str, FinalResult] = {}
        self.tasks: Dict[str, asyncio.Task] = {}

    def get_or_create_queue(self, run_id: str) -> asyncio.Queue:
        if run_id not in self.queues:
            self.queues[run_id] = asyncio.Queue()
        return self.queues[run_id]

    async def emit_to_run(self, run_id: str, event_type: str, data: Dict[str, Any]):
        queue = self.get_or_create_queue(run_id)
        payload = {"type": event_type, **data}
        await queue.put(payload)

    def store_result(self, run_id: str, result: FinalResult):
        self.results[run_id] = result

    def get_result(self, run_id: str) -> Optional[FinalResult]:
        return self.results.get(run_id)

run_manager = RunManager()

async def background_run_pipeline(run_id: str, profile_text: str):
    async def event_handler(event_type: str, data: Dict[str, Any]):
        await run_manager.emit_to_run(run_id, event_type, data)

    executor = RunExecutor(
        run_id=run_id,
        profile_text=profile_text,
        event_callback=event_handler
    )

    try:
        result = await executor.run()
        run_manager.store_result(run_id, result)
    except Exception as e:
        logger.exception(f"Run {run_id} failed with error: {e}")
        await run_manager.emit_to_run(run_id, "run_error", {
            "run_id": run_id,
            "error": str(e)
        })

@router.post("", response_model=CreateRunResponse)
async def create_run(req: CreateRunRequest):
    run_id = f"run_{uuid.uuid4().hex[:8]}"
    # Initialize queue immediately
    run_manager.get_or_create_queue(run_id)
    # Start execution as async task
    task = asyncio.create_task(background_run_pipeline(run_id, req.profile_text))
    run_manager.tasks[run_id] = task
    return CreateRunResponse(run_id=run_id)

@router.get("/{run_id}/stream")
async def stream_run_events(run_id: str):
    queue = run_manager.get_or_create_queue(run_id)

    async def event_generator():
        # Yield initial connection confirmation
        yield {
            "event": "message",
            "data": json.dumps({"type": "stream_connected", "run_id": run_id})
        }

        while True:
            try:
                # Wait for next event with a 15-second heartbeat
                data = await asyncio.wait_for(queue.get(), timeout=15.0)
                queue.task_done()
                
                event_type = data.get("type", "message")
                yield {
                    "event": "message",
                    "data": json.dumps(data)
                }

                if event_type in ("result_ready", "run_error"):
                    break
            except asyncio.TimeoutError:
                # Heartbeat to keep connection alive through proxies
                yield {
                    "event": "ping",
                    "data": json.dumps({"type": "heartbeat", "time": asyncio.get_event_loop().time()})
                }

    return EventSourceResponse(event_generator())

@router.get("/{run_id}")
async def get_run_result(run_id: str):
    result = run_manager.get_result(run_id)
    if not result:
        raise HTTPException(status_code=404, detail="Run result not ready or not found")
    return result

@router.post("/{run_id}/drafts", response_model=ApplicationDraft)
async def generate_single_draft(run_id: str, req: CreateDraftRequest):
    result = run_manager.get_result(run_id)
    if not result:
        raise HTTPException(status_code=404, detail="Run not found")
    
    scored_match = next((s for s in result.ranked if s.opportunity.raw.id == req.opportunity_id), None)
    if not scored_match:
        raise HTTPException(status_code=404, detail="Opportunity not found in run results")

    draft = create_application_draft(scored_match, result.profile)
    return draft
