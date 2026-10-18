import json
import asyncio
import os
import random
from pathlib import Path
from typing import List, Optional
from backend.app.models import (
    AgentTask,
    OpportunityRaw,
    Opportunity,
    StudentProfile,
    EligibilityRule
)
from backend.web_agent.base import WebAgentClient, ProgressCallback
from backend.app.config import settings

FIXTURES_PATH = Path(__file__).resolve().parent.parent / "fixtures" / "opportunities.json"

class MockClient(WebAgentClient):
    """
    High-fidelity Mock Web Agent reading from structured fixtures.
    Simulates realistic asynchronous web crawling, progressive status messages,
    and configurable failure/retry rates.
    """

    def __init__(self, fixtures_file: Optional[Path] = None, fail_rate: Optional[float] = None):
        self.fixtures_file = fixtures_file or FIXTURES_PATH
        self.fail_rate = fail_rate if fail_rate is not None else settings.MOCK_FAIL_RATE
        self._fixtures = self._load_fixtures()

    def _load_fixtures(self) -> List[dict]:
        if not self.fixtures_file.exists():
            return []
        with open(self.fixtures_file, "r", encoding="utf-8") as f:
            return json.load(f)

    async def discover(
        self,
        task: AgentTask,
        profile: StudentProfile,
        on_progress: Optional[ProgressCallback] = None
    ) -> List[OpportunityRaw]:
        if on_progress:
            await on_progress(f"Connecting to {task.source} ({task.url})...")
        await asyncio.sleep(random.uniform(0.3, 0.7))

        # Check simulated failure rate for retries
        if random.random() < self.fail_rate:
            if on_progress:
                await on_progress(f"Connection timeout on {task.source}. Triggering retry...")
            raise ConnectionError(f"Simulated portal timeout on {task.source}")

        if on_progress:
            await on_progress(f"Scanning pages on {task.source} for categories: {profile.wants}...")
        await asyncio.sleep(random.uniform(0.2, 0.5))

        # Match fixtures by source or category
        matched = []
        for item in self._fixtures:
            item_source = item.get("source", "").lower()
            task_source = task.source.lower()
            if item_source in task_source or task_source in item_source or random.random() < 0.6:
                raw = OpportunityRaw(
                    id=item["id"],
                    source=item.get("source", task.source),
                    title=item["title"],
                    organization=item.get("organization"),
                    category=item.get("category", "internship"),
                    url=item.get("url", task.url),
                    deadline_text=item.get("deadline_text"),
                    snippet=item.get("snippet", "")
                )
                matched.append(raw)

        if on_progress:
            await on_progress(f"Found {len(matched)} raw opportunity listings on {task.source}.")

        return matched

    async def extract_detail(
        self,
        task: AgentTask,
        raw: OpportunityRaw,
        on_progress: Optional[ProgressCallback] = None
    ) -> Opportunity:
        if on_progress:
            await on_progress(f"Opening {raw.title} at {raw.url}...")
        await asyncio.sleep(random.uniform(0.2, 0.5))

        # Locate full fixture
        full_item = next((item for item in self._fixtures if item["id"] == raw.id), None)
        
        if full_item:
            rules = [EligibilityRule(**r) for r in full_item.get("rules", [])]
            opp = Opportunity(
                raw=raw,
                deadline=full_item.get("deadline"),
                benefits=full_item.get("benefits"),
                amount_inr=full_item.get("amount_inr"),
                location=full_item.get("location"),
                mode=full_item.get("mode", "remote"),
                rules=rules,
                documents_required=full_item.get("documents_required", []),
                apply_url=full_item.get("apply_url", raw.url),
                effort_minutes_est=full_item.get("effort_minutes_est", 45),
                evidence=full_item.get("evidence", "Extracted verified criteria from primary web document."),
                confidence=full_item.get("confidence", 0.95)
            )
        else:
            # Fallback sensible detail synthesis
            opp = Opportunity(
                raw=raw,
                deadline=raw.deadline_text or "2026-11-30",
                benefits="Verified Student Grant / Stipend",
                amount_inr=25000.0,
                location="India / Remote",
                mode="remote",
                rules=[
                    EligibilityRule(
                        field="country",
                        operator="eq",
                        value="India",
                        raw_text="Must be resident of India."
                    )
                ],
                documents_required=["Student ID", "Resume"],
                apply_url=raw.url,
                effort_minutes_est=30,
                evidence="Standard listing terms verified from portal.",
                confidence=0.9
            )

        if on_progress:
            await on_progress(f"Parsed {len(opp.rules)} eligibility rules and verified deadline {opp.deadline}.")

        return opp
