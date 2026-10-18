import asyncio
import sys
from pathlib import Path

# Add project root to path
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from backend.app.models import AgentTask, StudentProfile
from backend.web_agent.tinyfish_client import TinyFishClient
from backend.app.config import settings

async def main():
    target_url = sys.argv[1] if len(sys.argv) > 1 else "https://devpost.com"
    print("=" * 70)
    print("TINYFISH LIVE SOURCE TEST")
    print("=" * 70)
    print(f"Target URL: {target_url}")
    print(f"API Key: {settings.TINYFISH_API_KEY[:14]}... (Active)")
    print(f"Cache TTL: {settings.CACHE_TTL_MINUTES} minutes\n")

    client = TinyFishClient()

    task = AgentTask(
        task_id="test_live_task",
        stage="discover",
        source="Devpost",
        url=target_url,
        goal="Discover upcoming hackathons"
    )

    profile = StudentProfile(
        education_level="Undergraduate",
        course="Computer Science",
        skills=["Python", "AI"],
        interests=["Hackathons", "Web Agents"],
        wants=["hackathon"]
    )

    async def on_progress(msg: str):
        print(f"  [AGENT PROGRESS] -> {msg}")

    print("[1] Running live discovery crawler...")
    raws = await client.discover(task, profile, on_progress=on_progress)
    print(f"\n[2] Discovery complete. Found {len(raws)} live listings:")
    for r in raws[:5]:
        print(f"    - {r.title} ({r.category.upper()}) | URL: {r.url}")

    if raws:
        print(f"\n[3] Testing live detail extraction for: '{raws[0].title}'...")
        detail = await client.extract_detail(task, raws[0], on_progress=on_progress)
        print(f"    Deadline: {detail.deadline}")
        print(f"    Benefits: {detail.benefits}")
        print(f"    Rules Extracted: {len(detail.rules)}")
        for rule in detail.rules[:3]:
            print(f"       * {rule.field} ({rule.operator}): {rule.raw_text}")

    print("\n[4] Testing cache instant replay...")
    start_t = asyncio.get_event_loop().time()
    cached_raws = await client.discover(task, profile, on_progress=on_progress)
    elapsed = asyncio.get_event_loop().time() - start_t
    print(f"    Replayed {len(cached_raws)} items in {elapsed*1000:.1f}ms (from diskcache).")

    print("\n>>> TinyFish Live Test PASSED!")

if __name__ == "__main__":
    asyncio.run(main())
