from typing import List
from backend.app.models import Opportunity, StudentProfile, EligibilityAssessment, Verdict

def evaluate_eligibility(opp: Opportunity, profile: StudentProfile) -> EligibilityAssessment:
    """
    Stage 5 Eligibility Reasoner:
    Compares structured criteria rules against student profile.
    - Any hard unmet criteria marks the opportunity as 'ineligible'.
    - All met marks as 'eligible'.
    - Mostly met with some unknown values marks as 'likely'.
    - Otherwise 'unclear'.
    """
    met: List[str] = []
    unmet: List[str] = []
    unknown: List[str] = []
    reasons: List[str] = []

    if not opp.rules:
        # If no explicit rules exist, consider it likely open
        return EligibilityAssessment(
            verdict="likely",
            confidence=0.85,
            met=["Open enrollment without strict prereqs."],
            unmet=[],
            unknown=["Specific departmental criteria not listed"],
            reasoning=opp.evidence or "Public open opportunity with standard participation guidelines."
        )

    for rule in opp.rules:
        field = rule.field.lower()
        op = rule.operator
        val = rule.value
        raw_text = rule.raw_text

        # Evaluate based on field
        if field == "country":
            student_country = (profile.country or "India").lower()
            if student_country == str(val).lower():
                met.append(f"Country requirement ({raw_text})")
            else:
                unmet.append(f"Must reside in {val} (Candidate is in {profile.country})")

        elif field == "state":
            student_state = (profile.state or "").lower()
            allowed_states = [s.lower() for s in (val if isinstance(val, list) else [val])]
            if student_state in allowed_states:
                met.append(f"State eligibility confirmed ({profile.state})")
            else:
                unmet.append(f"Restricted to {', '.join(allowed_states)} (Candidate is from {profile.state})")

        elif field == "family_income_lpa":
            if profile.family_income_lpa is not None:
                max_income = float(val)
                if profile.family_income_lpa <= max_income:
                    met.append(f"Income within threshold (<= {max_income} LPA)")
                else:
                    unmet.append(f"Family income {profile.family_income_lpa} LPA exceeds ceiling of {max_income} LPA")
            else:
                unknown.append(f"Family income requirement ({raw_text})")

        elif field == "score_percent":
            if profile.score_percent is not None:
                min_score = float(val)
                if profile.score_percent >= min_score:
                    met.append(f"Academic score {profile.score_percent}% meets minimum {min_score}%")
                else:
                    unmet.append(f"Academic score {profile.score_percent}% below required {min_score}%")
            else:
                unknown.append(f"Academic score requirement ({raw_text})")

        elif field == "category":
            if profile.category:
                allowed = [c.lower() for c in (val if isinstance(val, list) else [val])]
                if profile.category.lower() in allowed:
                    met.append(f"Category verified ({profile.category})")
                else:
                    unmet.append(f"Reserved for {val} category (Candidate listed {profile.category})")
            else:
                unknown.append(f"Category criteria ({raw_text})")

        elif field == "education_level":
            target = str(val).lower()
            student_edu = profile.education_level.lower()
            if target == "any" or target in student_edu or student_edu in target:
                met.append(f"Degree level qualified ({profile.education_level})")
            else:
                unmet.append(f"Requires {val} status (Candidate is {profile.education_level})")

        elif field == "skills":
            req_skill = str(val).lower()
            student_skills = [s.lower() for s in profile.skills]
            if any(req_skill in s or s in req_skill for s in student_skills):
                met.append(f"Skill verified: {val}")
            else:
                unmet.append(f"Missing required technical competency: {val}")

        elif field == "interests":
            req_interest = str(val).lower()
            student_interests = [i.lower() for i in profile.interests]
            if any(req_interest in i or i in req_interest for i in student_interests):
                met.append(f"Interest verified: {val}")
            else:
                unknown.append(f"Expressed interest in {val}")

        else:
            # Free-text rule fallback
            met.append(f"Rule verified: {raw_text}")

    # Determine verdict
    if unmet:
        verdict: Verdict = "ineligible"
        reasoning = f"Did not meet {len(unmet)} critical criteria: {unmet[0]}"
    elif not unknown and met:
        verdict = "eligible"
        reasoning = f"Meets all {len(met)} documented eligibility requirements."
    elif len(met) >= len(unknown):
        verdict = "likely"
        reasoning = f"Meets {len(met)} confirmed criteria; {len(unknown)} minor items require verification."
    else:
        verdict = "unclear"
        reasoning = f"Insufficient specific profile data for {len(unknown)} published requirements."

    if opp.evidence:
        reasoning += f" [Evidence: \"{opp.evidence[:120]}...\"]"

    return EligibilityAssessment(
        verdict=verdict,
        confidence=0.95 if verdict in ("eligible", "ineligible") else 0.8,
        met=met,
        unmet=unmet,
        unknown=unknown,
        reasoning=reasoning
    )
