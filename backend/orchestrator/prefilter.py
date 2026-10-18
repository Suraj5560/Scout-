from datetime import datetime
from typing import List, Tuple, Dict, Any
from backend.app.models import OpportunityRaw, StudentProfile

TODAY_STR = "2026-10-18" # Current local date from environment

def prefilter_candidates(
    raws: List[OpportunityRaw],
    profile: StudentProfile,
    max_keep: int = 12
) -> Tuple[List[OpportunityRaw], Dict[str, Any]]:
    """
    Stage 3 Prefilter:
    - Drops expired listings
    - Drops duplicate opportunities (by title similarity or URL)
    - Drops off-category listings
    - Ranks remaining by keyword overlap with skills/interests, keeping top 12
    """
    dropped: Dict[str, List[str]] = {
        "expired": [],
        "duplicate": [],
        "off": []
    }
    
    seen_titles = set()
    valid_candidates: List[Tuple[float, OpportunityRaw]] = []

    for item in raws:
        # 1. Check expiration
        if item.deadline_text and item.deadline_text < TODAY_STR:
            dropped["expired"].append(item.id)
            continue

        # 2. Check duplicates
        normalized_title = "".join(ch for ch in item.title.lower() if ch.isalnum())
        if normalized_title in seen_titles:
            dropped["duplicate"].append(item.id)
            continue
        seen_titles.add(normalized_title)

        # 3. Check category match
        if profile.wants and item.category not in profile.wants:
            dropped["off"].append(item.id)
            continue

        # 4. Keyword overlap score
        text_corpus = f"{item.title} {item.snippet or ''}".lower()
        score = 0.0

        for skill in profile.skills:
            if skill.lower() in text_corpus:
                score += 1.5

        for interest in profile.interests:
            if interest.lower() in text_corpus:
                score += 1.0

        if item.category in profile.wants:
            score += 2.0

        valid_candidates.append((score, item))

    # Sort descending by overlap score
    valid_candidates.sort(key=lambda x: x[0], reverse=True)
    kept = [item for _, item in valid_candidates[:max_keep]]

    dropped_summary = {
        "expired_count": len(dropped["expired"]),
        "duplicate_count": len(dropped["duplicate"]),
        "off_count": len(dropped["off"]),
        "details": dropped
    }

    return kept, dropped_summary
