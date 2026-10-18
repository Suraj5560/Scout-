import asyncio
import time
import logging
from typing import List, Callable, Optional, Dict, Any, Awaitable
from backend.app.models import (
    StudentProfile,
    AgentTask,
    OpportunityRaw,
    Opportunity,
    ScoredOpportunity,
    ApplicationDraft,
    FinalResult,
    AgentResult
)
from backend.web_agent.base import WebAgentClient
from backend.web_agent.mock_client import MockClient
from backend.web_agent.tinyfish_client import TinyFishClient
from backend.orchestrator.profile_parser import parse_profile_text
from backend.orchestrator.planner import create_discovery_plan
from backend.orchestrator.prefilter import prefilter_candidates
from backend.orchestrator.eligibility import evaluate_eligibility
from backend.orchestrator.ranker import score_opportunity, rank_opportunities
from backend.orchestrator.drafts import generate_top_drafts
from backend.app.config import settings

logger = logging.getLogger("scout.executor")

EventCallback = Callable[[str, Dict[str, Any]], Awaitable[None]]

class RunExecutor:
    def __init__(
        self,
        run_id: str,
        profile_text: str,
        client: Optional[WebAgentClient] = None,
        event_callback: Optional[EventCallback] = None
    ):
        self.run_id = run_id
        self.profile_text = profile_text
        if client:
            self.client = client
        elif not settings.MOCK_MODE and settings.TINYFISH_API_KEY:
            logger.info("Initializing Live TinyFishClient for RunExecutor.")
            self.client = TinyFishClient()
        else:
            self.client = MockClient()
        self.emit = event_callback
        self.semaphore = asyncio.Semaphore(settings.MAX_PARALLEL_AGENTS)

    async def _emit_event(self, event_type: str, data: Dict[str, Any]):
        if self.emit:
            try:
                await self.emit(event_type, data)
            except Exception as e:
                logger.error(f"Failed to emit event {event_type}: {e}")

    async def run(self) -> FinalResult:
        start_time = time.time()
        warnings: List[str] = []

        # 0. Run Started
        await self._emit_event("run_started", {
            "run_id": self.run_id,
            "timestamp": time.time(),
            "profile_text": self.profile_text[:120]
        })

        # 1. Profile Parsing
        profile = parse_profile_text(self.profile_text)
        await self._emit_event("profile_parsed", {
            "run_id": self.run_id,
            "profile": profile.model_dump(mode="json")
        })

        # 2. Stage A Planning
        await self._emit_event("stage_changed", {"stage": "discover"})
        discovery_tasks = create_discovery_plan(profile)
        await self._emit_event("plan_ready", {
            "tasks_count": len(discovery_tasks),
            "sources": [t.source for t in discovery_tasks]
        })

        # 3. Parallel Discovery Agents (Stage A)
        discovered_raws: List[OpportunityRaw] = []
        agents_total = len(discovery_tasks)
        agents_ok = 0

        async def run_stage_a_task(task: AgentTask):
            nonlocal agents_ok
            async with self.semaphore:
                await self._emit_event("agent_started", {
                    "task_id": task.task_id,
                    "stage": "discover",
                    "source": task.source
                })

                async def progress_hook(msg: str):
                    await self._emit_event("agent_progress", {
                        "task_id": task.task_id,
                        "source": task.source,
                        "message": msg
                    })

                attempts = 0
                max_attempts = 2
                raws: List[OpportunityRaw] = []

                while attempts < max_attempts:
                    attempts += 1
                    try:
                        raws = await self.client.discover(task, profile, on_progress=progress_hook)
                        agents_ok += 1
                        break
                    except Exception as e:
                        if attempts < max_attempts:
                            await self._emit_event("agent_retry", {
                                "task_id": task.task_id,
                                "source": task.source,
                                "attempt": attempts,
                                "error": str(e)
                            })
                            await asyncio.sleep(0.3)
                        elif task.fallback_sources:
                            await self._emit_event("agent_fallback", {
                                "task_id": task.task_id,
                                "source": task.source,
                                "fallback_to": task.fallback_sources[0]
                            })
                            # Fallback attempt
                            task.source = f"{task.source} (Fallback: {task.fallback_sources[0]})"
                            try:
                                raws = await self.client.discover(task, profile, on_progress=progress_hook)
                                agents_ok += 1
                                break
                            except Exception as fb_err:
                                await self._emit_event("agent_failed", {
                                    "task_id": task.task_id,
                                    "source": task.source,
                                    "error": str(fb_err)
                                })
                        else:
                            await self._emit_event("agent_failed", {
                                "task_id": task.task_id,
                                "source": task.source,
                                "error": str(e)
                            })

                for raw in raws:
                    discovered_raws.append(raw)
                    await self._emit_event("opportunity_found", {
                        "raw": raw.model_dump(mode="json"),
                        "source": task.source
                    })

                await self._emit_event("agent_done", {
                    "task_id": task.task_id,
                    "stage": "discover",
                    "found_count": len(raws)
                })

        # Run all discovery tasks concurrently
        await asyncio.gather(*(run_stage_a_task(t) for t in discovery_tasks))

        # 4. Prefilter
        kept_raws, dropped_summary = prefilter_candidates(discovered_raws, profile, max_keep=12)
        await self._emit_event("candidates_picked", {
            "ids": [r.id for r in kept_raws],
            "kept_count": len(kept_raws),
            "dropped": dropped_summary
        })

        # 5. Parallel Detail Extraction (Stage B)
        await self._emit_event("stage_changed", {"stage": "detail"})
        detailed_opportunities: List[Opportunity] = []

        async def run_stage_b_task(raw: OpportunityRaw):
            async with self.semaphore:
                task = AgentTask(
                    task_id=f"task_detail_{raw.id}",
                    stage="detail",
                    source=raw.source,
                    url=raw.url,
                    goal=f"Extract rules and deadline for {raw.title}"
                )
                await self._emit_event("agent_started", {
                    "task_id": task.task_id,
                    "stage": "detail",
                    "source": raw.source,
                    "title": raw.title
                })

                async def detail_progress(msg: str):
                    await self._emit_event("agent_progress", {
                        "task_id": task.task_id,
                        "source": raw.source,
                        "message": msg
                    })

                try:
                    opp = await self.client.extract_detail(task, raw, on_progress=detail_progress)
                    detailed_opportunities.append(opp)
                    await self._emit_event("agent_done", {
                        "task_id": task.task_id,
                        "stage": "detail",
                        "title": raw.title
                    })
                except Exception as e:
                    await self._emit_event("agent_failed", {
                        "task_id": task.task_id,
                        "error": str(e)
                    })

        await asyncio.gather(*(run_stage_b_task(r) for r in kept_raws))

        # 6. Reason & Rank
        await self._emit_event("stage_changed", {"stage": "reason"})
        scored_list: List[ScoredOpportunity] = []

        for opp in detailed_opportunities:
            assessment = evaluate_eligibility(opp, profile)
            scored = score_opportunity(opp, assessment, profile)
            scored_list.append(scored)
            await self._emit_event("opportunity_scored", {
                "scored": scored.model_dump(mode="json")
            })

        await self._emit_event("stage_changed", {"stage": "rank"})
        ranked_list = rank_opportunities(scored_list)

        # 7. Drafts
        await self._emit_event("stage_changed", {"stage": "draft"})
        top_drafts = generate_top_drafts(ranked_list, profile, top_n=3)
        for draft in top_drafts:
            await self._emit_event("draft_ready", {
                "draft": draft.model_dump(mode="json")
            })

        duration_ms = int((time.time() - start_time) * 1000)
        eligible_count = sum(1 for item in ranked_list if item.assessment.verdict == "eligible")
        likely_count = sum(1 for item in ranked_list if item.assessment.verdict == "likely")
        summary_sentence = (
            f"Analyzed {len(detailed_opportunities)} opportunities across {len(discovery_tasks)} portals in "
            f"{duration_ms/1000:.1f}s: identified {eligible_count} confirmed eligible matches and {likely_count} likely qualifications."
        )

        final_result = FinalResult(
            run_id=self.run_id,
            profile=profile,
            ranked=ranked_list,
            drafts=top_drafts,
            discovered_count=len(discovered_raws),
            analyzed_count=len(detailed_opportunities),
            agents_total=agents_total,
            agents_ok=agents_ok,
            duration_ms=duration_ms,
            summary=summary_sentence,
            warnings=warnings
        )

        await self._emit_event("result_ready", {
            "result": final_result.model_dump(mode="json")
        })

        return final_result
