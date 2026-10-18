import yaml
from pathlib import Path
from typing import List
from backend.app.models import AgentTask, StudentProfile

SOURCES_PATH = Path(__file__).resolve().parent.parent.parent / "sources.yaml"

def create_discovery_plan(profile: StudentProfile, sources_file: Path = SOURCES_PATH) -> List[AgentTask]:
    """
    Stage 1 Planner: Reads sources.yaml and creates one Stage A task
    per enabled source relevant to the student's requested categories.
    """
    if not sources_file.exists():
        # Fallback default sources
        raw_sources = [
            {"id": "scholarships_gov", "name": "National Scholarship Portal", "url": "https://scholarships.gov.in", "category": "scholarship", "enabled": True, "goal": "Find open Indian scholarships.", "fallback_sources": ["buddy4study"]},
            {"id": "buddy4study", "name": "Buddy4Study", "url": "https://www.buddy4study.com", "category": "scholarship", "enabled": True, "goal": "Find student scholarships.", "fallback_sources": ["scholarships_gov"]},
            {"id": "internshala", "name": "Internshala", "url": "https://internshala.com", "category": "internship", "enabled": True, "goal": "Find technology internships.", "fallback_sources": ["unstop"]},
            {"id": "unstop", "name": "Unstop", "url": "https://unstop.com", "category": "hackathon", "enabled": True, "goal": "Find student hackathons.", "fallback_sources": ["devfolio"]},
            {"id": "devfolio", "name": "Devfolio", "url": "https://devfolio.co", "category": "hackathon", "enabled": True, "goal": "Find web3 and software hackathons.", "fallback_sources": ["devpost"]},
            {"id": "devpost", "name": "Devpost", "url": "https://devpost.com", "category": "hackathon", "enabled": True, "goal": "Find global hackathons.", "fallback_sources": ["devfolio"]},
        ]
    else:
        with open(sources_file, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f)
            raw_sources = data.get("sources", [])

    tasks: List[AgentTask] = []
    for s in raw_sources:
        if not s.get("enabled", True):
            continue
        
        # Include source if it matches student wants or broad discovery
        category = s.get("category", "")
        if not profile.wants or category in profile.wants or not category:
            task = AgentTask(
                task_id=f"task_discover_{s['id']}",
                stage="discover",
                source=s.get("name", s["id"]),
                url=s["url"],
                goal=s.get("goal", f"Discover opportunities on {s['name']}"),
                fallback_sources=s.get("fallback_sources", [])
            )
            tasks.append(task)

    return tasks
