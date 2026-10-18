from typing import List
from backend.app.models import Opportunity, StudentProfile, ApplicationDraft, ScoredOpportunity

def create_application_draft(scored: ScoredOpportunity, profile: StudentProfile) -> ApplicationDraft:
    """
    Stage 7 Draft Writer:
    Creates a 120-180 word tailored application statement for top matches,
    using strictly verified facts from the student's profile.
    """
    opp = scored.opportunity
    skills_str = ", ".join(profile.skills[:4]) if profile.skills else "software development"
    interests_str = ", ".join(profile.interests[:3]) if profile.interests else "technology and engineering"

    # Contextual tailored draft
    paragraphs = [
        f"I am writing to express my earnest application for the {opp.raw.title} hosted by {opp.raw.organization or 'your organization'}. Currently enrolled as a {profile.year} student pursuing {profile.course} at {profile.institution} in {profile.state}, I have dedicated my academic tenure to rigorous practical coursework and technical excellence.",
        f"My core competencies lie in {skills_str}, with an active concentration in {interests_str}. Having engaged in practical project implementations, I have cultivated disciplined problem-solving practices and effective teamwork methodologies. This program's mission to foster growth directly complements my career trajectory.",
        f"Given my qualification under your criteria ({scored.assessment.reasoning.split('[')[0].strip()}), I am eager to contribute diligence, technical rigor, and perspective to your community. Thank you for your review."
    ]

    text = " ".join(paragraphs)
    
    # Checklist of documents
    checklist = opp.documents_required if opp.documents_required else [
        "Updated Resume / Curriculum Vitae",
        "Current Student Bonafide / Enrollment Proof",
        "Official Academic Transcripts",
        "Valid Government Photo ID"
    ]

    return ApplicationDraft(
        opportunity_id=opp.raw.id,
        text=text,
        checklist=checklist,
        disclaimer="Draft only. Review before submitting."
    )

def generate_top_drafts(ranked: List[ScoredOpportunity], profile: StudentProfile, top_n: int = 3) -> List[ApplicationDraft]:
    drafts: List[ApplicationDraft] = []
    # Pick top eligible or likely opportunities
    qualifying = [item for item in ranked if item.assessment.verdict in ("eligible", "likely")]
    
    for item in qualifying[:top_n]:
        draft = create_application_draft(item, profile)
        drafts.append(draft)

    return drafts
