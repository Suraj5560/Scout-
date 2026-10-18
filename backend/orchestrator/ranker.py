import math
from datetime import datetime
from typing import List, Optional
from backend.app.models import Opportunity, StudentProfile, EligibilityAssessment, ScoredOpportunity

TODAY = datetime.strptime("2026-10-18", "%Y-%m-%d").date()

def calculate_days_left(deadline_str: Optional[str]) -> Optional[int]:
    if not deadline_str:
        return None
    try:
        dt = datetime.strptime(deadline_str[:10], "%Y-%m-%d").date()
        delta = (dt - TODAY).days
        return max(0, delta)
    except Exception:
        return None

def score_opportunity(
    opp: Opportunity,
    assessment: EligibilityAssessment,
    profile: StudentProfile
) -> ScoredOpportunity:
    # 1. Verdict Weight (1, .75, .4, 0)
    verdict_weights = {
        "eligible": 1.0,
        "likely": 0.75,
        "unclear": 0.40,
        "ineligible": 0.0
    }
    vw = verdict_weights.get(assessment.verdict, 0.4)

    # 2. Skill & Interest overlap (0..1)
    corpus = f"{opp.raw.title} {opp.raw.snippet or ''} {opp.benefits or ''}".lower()
    matches = 0
    total_tokens = max(1, len(profile.skills) + len(profile.interests))
    
    for s in profile.skills:
        if s.lower() in corpus:
            matches += 1.5
    for i in profile.interests:
        if i.lower() in corpus:
            matches += 1.0

    overlap = min(1.0, matches / (total_tokens * 0.8))
    fit = round(0.6 * vw + 0.4 * overlap, 3)

    # 3. Value (0..1) based on grant/stipend or prestige
    if opp.amount_inr and opp.amount_inr > 0:
        # Log scale: 10,000 INR -> 0.57, 100,000 INR -> 0.71, 1,000,000 INR -> 0.85
        val_score = min(1.0, math.log10(max(1000.0, float(opp.amount_inr))) / 7.0)
    else:
        val_score = 0.55
    value = round(val_score, 3)

    # 4. Urgency
    days_left = calculate_days_left(opp.deadline)
    if days_left is not None:
        if days_left <= 3:
            urgency = 1.0
        elif days_left <= 7:
            urgency = 0.8
        elif days_left <= 14:
            urgency = 0.6
        elif days_left <= 30:
            urgency = 0.4
        else:
            urgency = 0.2
    else:
        urgency = 0.3

    # Urgency never lifts ineligible
    if assessment.verdict == "ineligible":
        urgency = 0.0

    # 5. Effort (0..1): 1 - minutes / 240
    effort_mins = opp.effort_minutes_est or 45
    effort = round(max(0.0, min(1.0, 1.0 - (effort_mins / 240.0))), 3)

    # 6. Total score = 100*(0.50*fit + 0.20*value + 0.20*urgency + 0.10*effort)
    raw_total = 100.0 * (0.50 * fit + 0.20 * value + 0.20 * urgency + 0.10 * effort)
    
    if assessment.verdict == "ineligible":
        # Ineligible items capped low so they sort last
        total = round(min(25.0, raw_total * 0.2), 1)
    else:
        total = round(raw_total, 1)

    return ScoredOpportunity(
        opportunity=opp,
        assessment=assessment,
        fit=fit,
        value=value,
        urgency=urgency,
        effort=effort,
        total=total,
        days_left=days_left,
        rank=1
    )

def rank_opportunities(scored_list: List[ScoredOpportunity]) -> List[ScoredOpportunity]:
    """
    Ranks opportunities:
    Eligible & Likely sorted first by total score descending.
    Unclear sorted next.
    Ineligible sorted strictly last.
    Assigns 1-indexed ranks.
    """
    def sort_key(item: ScoredOpportunity):
        verdict_priority = {
            "eligible": 3,
            "likely": 2,
            "unclear": 1,
            "ineligible": 0
        }[item.assessment.verdict]
        return (verdict_priority, item.total)

    sorted_items = sorted(scored_list, key=sort_key, reverse=True)
    for idx, item in enumerate(sorted_items, start=1):
        item.rank = idx

    return sorted_items
