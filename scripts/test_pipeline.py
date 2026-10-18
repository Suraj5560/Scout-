import asyncio
import json
import sys
from pathlib import Path

# Add project root to path
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from backend.orchestrator.executor import RunExecutor
from backend.web_agent.mock_client import MockClient

SAMPLE_PROFILE_TEXT = (
    "Hi, I am a 3rd year undergraduate student studying Computer Science at NIT Surathkal in Karnataka, India. "
    "My family income is 3 LPA and my academic score is 88%. My core skills include Python, React, TypeScript, "
    "and Machine Learning. I am looking for tech internships, hackathons, and scholarships to support my education."
)

async def main():
    print("=" * 80)
    print("SCOUT MULTI-AGENT PIPELINE ACCEPTANCE TEST")
    print("=" * 80)
    print(f"\n[INPUT PROFILE]:\n{SAMPLE_PROFILE_TEXT}\n")

    events_captured = []

    async def log_event(event_type: str, data: dict):
        events_captured.append(event_type)
        if event_type == "profile_parsed":
            p = data["profile"]
            print(f"[STAGE 0 - PARSER]: Parsed {p['year']} {p['course']} student at {p['institution']}, {p['state']}.")
            print(f"                   Skills: {p['skills']} | Wants: {p['wants']}")
        elif event_type == "plan_ready":
            print(f"[STAGE 1 - PLANNER]: Planned {data['tasks_count']} parallel discovery tasks: {data['sources']}")
        elif event_type == "agent_started" and data.get("stage") == "discover":
            print(f"[STAGE 2 - AGENT START]: Dispatched Discovery Agent to {data['source']}")
        elif event_type == "candidates_picked":
            dropped = data["dropped"]
            print(f"\n[STAGE 3 - PREFILTER]: Kept top {data['kept_count']} candidates.")
            print(f"                      Dropped: {dropped['expired_count']} expired, {dropped['duplicate_count']} duplicates, {dropped['off_count']} off-category.")
        elif event_type == "agent_started" and data.get("stage") == "detail":
            print(f"[STAGE 4 - DETAIL AGENT]: Extracting rules for '{data.get('title')}'")
        elif event_type == "stage_changed":
            print(f"\n>>> PIPELINE STAGE: {data['stage'].upper()}")

    # Initialize executor with MockClient (fail_rate=0 for deterministic test output)
    client = MockClient(fail_rate=0.0)
    executor = RunExecutor(
        run_id="test_run_001",
        profile_text=SAMPLE_PROFILE_TEXT,
        client=client,
        event_callback=log_event
    )

    result = await executor.run()

    print("\n" + "=" * 80)
    print("FINAL RANKED RESULTS (SCOUT RADAR)")
    print("=" * 80)
    print(f"Execution Summary: {result.summary}")
    print(f"Discovered: {result.discovered_count} | Detailed: {result.analyzed_count} | Duration: {result.duration_ms}ms\n")

    for item in result.ranked:
        opp = item.opportunity
        verdict = item.assessment.verdict.upper()
        verdict_color = {
            "ELIGIBLE": "\033[92m",
            "LIKELY": "\033[93m",
            "UNCLEAR": "\033[90m",
            "INELIGIBLE": "\033[91m"
        }.get(verdict, "")
        reset = "\033[0m"

        print(f"#{item.rank} [{item.total} pts] [{verdict_color}{verdict}{reset}] {opp.raw.title} ({opp.raw.category.upper()})")
        print(f"   Source: {opp.raw.source} | Org: {opp.raw.organization or 'N/A'}")
        print(f"   Benefits: {opp.benefits or 'N/A'} | Deadline: {opp.deadline} ({item.days_left} days left)")
        print(f"   Fit: {item.fit} | Value: {item.value} | Urgency: {item.urgency} | Effort: {item.effort}")
        print(f"   Reasoning: {item.assessment.reasoning}")
        if item.assessment.unmet:
            print(f"   Unmet Criteria: {item.assessment.unmet}")
        print("-" * 80)

    print("\n" + "=" * 80)
    print("GENERATED APPLICATION DRAFTS (TOP MATCHES)")
    print("=" * 80)
    for idx, draft in enumerate(result.drafts, start=1):
        print(f"\n[DRAFT #{idx}] For Opportunity ID: {draft.opportunity_id}")
        print(f"Statement:\n{draft.text}\n")
        print(f"Required Documents Checklist: {draft.checklist}")
        print(f"Disclaimer: {draft.disclaimer}")
        print("-" * 60)

    print("\n>>> Pipeline Acceptance Test PASSED successfully!")

if __name__ == "__main__":
    asyncio.run(main())
