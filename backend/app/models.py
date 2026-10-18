from typing import Literal, Optional, Any, List, Union
from pydantic import BaseModel, Field

Category = Literal["scholarship", "internship", "hackathon", "fellowship"]
Verdict = Literal["eligible", "likely", "unclear", "ineligible"]
Stage = Literal["discover", "detail", "reason", "rank", "draft"]
RuleOperator = Literal["eq", "in", "lte", "gte", "between", "has", "text"]

class StudentProfile(BaseModel):
    education_level: str = "Undergraduate"
    course: str = "Computer Science"
    year: Union[str, int] = "3rd Year"
    institution: str = "Engineering College"
    state: str = "Karnataka"
    country: str = "India"
    category: Optional[str] = None # General, OBC, SC, ST, EWS
    family_income_lpa: Optional[float] = None
    score_percent: Optional[float] = None
    skills: List[str] = Field(default_factory=list)
    interests: List[str] = Field(default_factory=list)
    wants: List[Category] = Field(default_factory=lambda: ["scholarship", "internship", "hackathon"])
    mode_pref: str = "any" # remote, hybrid, in-person, any
    bio: Optional[str] = None

class AgentTask(BaseModel):
    task_id: str
    stage: Literal["discover", "detail"]
    source: str
    url: str
    goal: str
    fallback_sources: List[str] = Field(default_factory=list)

class OpportunityRaw(BaseModel):
    id: str
    source: str
    title: str
    organization: Optional[str] = None
    category: Category
    url: str
    deadline_text: Optional[str] = None
    snippet: Optional[str] = None

class EligibilityRule(BaseModel):
    field: str
    operator: RuleOperator
    value: Any
    raw_text: str

class Opportunity(BaseModel):
    raw: OpportunityRaw
    deadline: Optional[str] = None # ISO format YYYY-MM-DD
    benefits: Optional[str] = None
    amount_inr: Optional[float] = None
    location: Optional[str] = None
    mode: Optional[str] = None # remote, on-site, hybrid
    rules: List[EligibilityRule] = Field(default_factory=list)
    documents_required: List[str] = Field(default_factory=list)
    apply_url: Optional[str] = None
    effort_minutes_est: Optional[int] = None
    evidence: Optional[str] = None
    confidence: float = 1.0

class EligibilityAssessment(BaseModel):
    verdict: Verdict
    confidence: float = 1.0
    met: List[str] = Field(default_factory=list)
    unmet: List[str] = Field(default_factory=list)
    unknown: List[str] = Field(default_factory=list)
    reasoning: str = ""

class ScoredOpportunity(BaseModel):
    opportunity: Opportunity
    assessment: EligibilityAssessment
    fit: float = 0.0 # 0..1
    value: float = 0.0 # 0..1
    urgency: float = 0.0 # 0..1
    effort: float = 0.0 # 0..1
    total: float = 0.0 # 0..100
    days_left: Optional[int] = None
    rank: int = 1

class ApplicationDraft(BaseModel):
    opportunity_id: str
    text: str
    checklist: List[str] = Field(default_factory=list)
    disclaimer: str = "Draft only. Review before submitting."

class AgentResult(BaseModel):
    task_id: str
    stage: Literal["discover", "detail"]
    source: str
    status: Literal["success", "failed", "retry", "fallback"]
    raws: List[OpportunityRaw] = Field(default_factory=list)
    detail: Optional[Opportunity] = None
    error: Optional[str] = None
    duration_ms: int = 0
    attempts: int = 1

class FinalResult(BaseModel):
    run_id: str
    profile: StudentProfile
    ranked: List[ScoredOpportunity] = Field(default_factory=list)
    drafts: List[ApplicationDraft] = Field(default_factory=list)
    discovered_count: int = 0
    analyzed_count: int = 0
    agents_total: int = 0
    agents_ok: int = 0
    duration_ms: int = 0
    summary: str = ""
    warnings: List[str] = Field(default_factory=list)

class CreateRunRequest(BaseModel):
    profile_text: str

class CreateRunResponse(BaseModel):
    run_id: str

class CreateDraftRequest(BaseModel):
    opportunity_id: str
