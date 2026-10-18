import re
from typing import List, Optional
from backend.app.models import StudentProfile, Category

COMMON_SKILLS = [
    "python", "react", "typescript", "javascript", "c++", "c", "java", "sql",
    "machine learning", "ai", "deep learning", "node.js", "docker", "aws",
    "git", "html", "css", "tailwind", "fastapi", "next.js", "solidity", "web3"
]

COMMON_INTERESTS = [
    "ai", "web agents", "open source", "machine learning", "robotics",
    "cybersecurity", "blockchain", "data science", "cloud", "competitive programming", "hackathons"
]

INDIAN_STATES = [
    "karnataka", "maharashtra", "delhi", "tamil nadu", "telangana", "andhra pradesh",
    "uttar pradesh", "west bengal", "kerala", "gujarat", "rajasthan", "punjab", "haryana",
    "madhya pradesh", "bihar", "odisha", "jharkhand", "assam", "uttarakhand", "goa"
]

def parse_profile_text(text: str) -> StudentProfile:
    """
    Heuristic profile parser that extracts structured StudentProfile
    from natural language student bios. Always functions reliably without API keys.
    """
    lower = text.lower()

    # Education level & course
    education_level = "Undergraduate"
    if "postgraduate" in lower or "m.tech" in lower or "masters" in lower or "mca" in lower:
        education_level = "Postgraduate"
    elif "phd" in lower or "research" in lower:
        education_level = "PhD"
    elif "school" in lower or "12th" in lower or "high school" in lower:
        education_level = "High School"

    course = "Computer Science & Engineering"
    if "computer science" in lower or "cse" in lower or "cs" in lower:
        course = "Computer Science & Engineering"
    elif "information technology" in lower or "it" in lower:
        course = "Information Technology"
    elif "electrical" in lower or "electronics" in lower or "ece" in lower or "eee" in lower:
        course = "Electrical & Electronics Engineering"
    elif "mechanical" in lower:
        course = "Mechanical Engineering"
    elif "data science" in lower:
        course = "Data Science"
    elif "b.com" in lower or "commerce" in lower:
        course = "Commerce"

    # Year
    year = "3rd Year"
    if "1st year" in lower or "first year" in lower or "freshman" in lower:
        year = "1st Year"
    elif "2nd year" in lower or "second year" in lower or "sophomore" in lower:
        year = "2nd Year"
    elif "3rd year" in lower or "third year" in lower or "junior" in lower:
        year = "3rd Year"
    elif "4th year" in lower or "final year" in lower or "senior" in lower:
        year = "4th Year"

    # State
    detected_state = "Karnataka"
    for state in INDIAN_STATES:
        if state in lower:
            detected_state = state.title()
            break

    # College / Institution
    institution = "Indian Institute of Technology / National Engineering College"
    college_match = re.search(r'(?:at|from|studying at|in)\s+([A-Z][A-Za-z0-9\s,\.&]{3,35}(?:college|institute|university|tech|iit|nit|iiit))', text, re.IGNORECASE)
    if college_match:
        institution = college_match.group(1).strip()

    # Skills detection
    skills: List[str] = []
    for skill in COMMON_SKILLS:
        if re.search(r'\b' + re.escape(skill) + r'\b', lower):
            skills.append(skill.title() if len(skill) > 3 else skill.upper())

    if not skills:
        skills = ["Python", "JavaScript", "Problem Solving"]

    # Interests detection
    interests: List[str] = []
    for interest in COMMON_INTERESTS:
        if interest in lower:
            interests.append(interest.title())
    if not interests:
        interests = ["AI", "Web Development", "Hackathons"]

    # Categories wanted
    wants: List[Category] = []
    if "scholarship" in lower:
        wants.append("scholarship")
    if "intern" in lower or "job" in lower:
        wants.append("internship")
    if "hackathon" in lower or "contest" in lower or "competition" in lower:
        wants.append("hackathon")
    if "fellowship" in lower or "grant" in lower:
        wants.append("fellowship")

    if not wants:
        wants = ["scholarship", "internship", "hackathon", "fellowship"]

    # Work mode
    mode_pref = "any"
    if "remote" in lower:
        mode_pref = "remote"
    elif "in-person" in lower or "on-site" in lower or "offline" in lower:
        mode_pref = "in-person"
    elif "hybrid" in lower:
        mode_pref = "hybrid"

    # Family Income detection (e.g., "income 3 lpa", "under 4 lakhs")
    income_lpa: Optional[float] = None
    income_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:lpa|lakh|lakhs)', lower)
    if income_match:
        try:
            income_lpa = float(income_match.group(1))
        except ValueError:
            pass

    # Score percent (e.g., "85%", "9.2 cgpa")
    score_percent: Optional[float] = None
    score_match = re.search(r'(\d+(?:\.\d+)?)\s*%', text)
    if score_match:
        try:
            score_percent = float(score_match.group(1))
        except ValueError:
            pass
    else:
        cgpa_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:cgpa|gpa)', lower)
        if cgpa_match:
            try:
                cgpa = float(cgpa_match.group(1))
                score_percent = min(100.0, cgpa * 9.5)
            except ValueError:
                pass

    return StudentProfile(
        education_level=education_level,
        course=course,
        year=year,
        institution=institution,
        state=detected_state,
        country="India",
        skills=skills,
        interests=interests,
        wants=wants,
        mode_pref=mode_pref,
        family_income_lpa=income_lpa or 4.5,
        score_percent=score_percent or 82.0,
        bio=text
    )
