import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.models import (
    StudentProfile,
    OpportunityRaw,
    Opportunity,
    EligibilityAssessment,
    ScoredOpportunity,
    ApplicationDraft,
    FinalResult,
)
from backend.orchestrator.profile_parser import parse_profile_text
from backend.orchestrator.prefilter import prefilter_candidates
from backend.orchestrator.eligibility import evaluate_eligibility
from backend.orchestrator.ranker import score_opportunity, rank_opportunities
from backend.orchestrator.drafts import generate_top_drafts

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "Scout" in data["app"]
    assert "mock_mode" in data

def test_create_run_api():
    sample_text = "3rd year CS student at NITK. Skills: Python, React. Looking for internships."
    response = client.post("/api/runs", json={"profile_text": sample_text})
    assert response.status_code == 200
    data = response.json()
    assert "run_id" in data
    assert data["run_id"].startswith("run_")

def test_profile_parser_heuristics():
    text = "I am a 3rd year B.Tech student in Computer Science at NIT Surathkal in Karnataka. Skills: Python, React, TypeScript. Family income is 3 LPA."
    profile = parse_profile_text(text)
    assert profile.year == "3rd Year"
    assert "Computer Science" in profile.course
    assert profile.state == "Karnataka"
    assert "Python" in profile.skills
    assert "React" in profile.skills
    assert profile.family_income_lpa == 3.0

def test_eligibility_and_ranking_flow():
    profile = parse_profile_text("3rd year CS at IIT Delhi, skills: Python, React. Income: 3.0 LPA.")
    
    # 1. Eligible opportunity
    opp_eligible = Opportunity(
        raw=OpportunityRaw(
            id="test_1",
            source="internshala",
            title="React & Python Intern",
            category="internship",
            url="https://internshala.com/1"
        ),
        deadline="2026-11-20",
        amount_inr=30000.0,
        rules=[]
    )
    assess_eligible = evaluate_eligibility(opp_eligible, profile)
    assert assess_eligible.verdict in ("eligible", "likely")
    scored_eligible = score_opportunity(opp_eligible, assess_eligible, profile)
    assert scored_eligible.total > 50

    # 2. Ineligible opportunity
    opp_ineligible = Opportunity(
        raw=OpportunityRaw(
            id="test_2",
            source="internshala",
            title="Firmware Intern",
            category="internship",
            url="https://internshala.com/2"
        ),
        deadline="2026-11-20",
        rules=[
            {"field": "skills", "operator": "has", "value": "Rust", "raw_text": "Must have Rust experience."}
        ]
    )
    assess_ineligible = evaluate_eligibility(opp_ineligible, profile)
    assert assess_ineligible.verdict == "ineligible"
    scored_ineligible = score_opportunity(opp_ineligible, assess_ineligible, profile)
    assert scored_ineligible.total <= 25.0

    # 3. Ineligible sorts last
    ranked = rank_opportunities([scored_ineligible, scored_eligible])
    assert ranked[0].opportunity.raw.id == "test_1"
    assert ranked[1].opportunity.raw.id == "test_2"
    assert ranked[0].rank == 1
    assert ranked[1].rank == 2

    # 4. Draft generation
    drafts = generate_top_drafts(ranked, profile, top_n=1)
    assert len(drafts) == 1
    assert drafts[0].opportunity_id == "test_1"
    assert "NIT" in drafts[0].text or "student" in drafts[0].text
    assert len(drafts[0].checklist) > 0
