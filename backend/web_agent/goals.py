from typing import List

DISCOVERY_SCHEMA = """
[
  {
    "title": "Opportunity Title",
    "organization": "Hosting Organization",
    "category": "scholarship | internship | hackathon | fellowship",
    "url": "https://absolute-link-to-details",
    "deadline_text": "YYYY-MM-DD or readable text",
    "snippet": "Brief summary of the opportunity"
  }
]
"""

DETAIL_SCHEMA = """
{
  "deadline": "YYYY-MM-DD",
  "benefits": "Financial grant / stipend / prizes description",
  "amount_inr": 50000,
  "location": "City or Country",
  "mode": "remote | on-site | hybrid",
  "rules": [
    {
      "field": "country | state | family_income_lpa | score_percent | category | education_level | skills",
      "operator": "eq | in | lte | gte | between | has | text",
      "value": "requirement threshold or keyword",
      "raw_text": "Original sentence from the webpage proving this rule"
    }
  ],
  "documents_required": ["Document 1", "Document 2"],
  "apply_url": "https://official-application-link",
  "evidence": "Quoted sentence from page confirming deadline and requirements"
}
"""

def build_discovery_goal(url: str, categories: List[str], interests: List[str]) -> str:
    categories_str = ", ".join(categories) if categories else "scholarship, internship, hackathon, fellowship"
    interests_str = ", ".join(interests) if interests else "technology, computer science, student engineering"
    return (
        f"Go to {url}. Find open {categories_str} opportunities relevant to {interests_str}. "
        f"Scan available listings and paginate if needed. "
        f"Extract each opportunity's title, organization, category, absolute URL, deadline text, and snippet. "
        f"Return STRICT JSON only matching this format:\n{DISCOVERY_SCHEMA}"
    )

def build_detail_goal(url: str, title: str) -> str:
    return (
        f"Open {url} for the opportunity '{title}'. "
        f"Extract deadline in ISO format (YYYY-MM-DD), benefits/stipend amount in INR or text, location, work mode (remote/hybrid/in-person), "
        f"all explicit eligibility criteria as structured rules with the original sentence proving each rule, "
        f"the required documents checklist, and official application link. "
        f"Return STRICT JSON only matching this format:\n{DETAIL_SCHEMA}"
    )
