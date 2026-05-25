# scoring.py

def score_lead(lead: dict) -> str:
    score = 0

    # Budget signals
    budget = lead.get("budget", "").lower()
    if any(x in budget for x in ["funded", "seed", "series", "revenue", "budget"]):
        score += 3
    if any(x in budget for x in ["bootstrapped", "no budget", "exploring", "idea"]):
        score += 1

    # Problem clarity — vague = low value
    problem = lead.get("problem", "")
    if len(problem) > 30:   # they articulated a real problem
        score += 2

    # Industry match — Maneuver's stated focus areas
    company = (lead.get("company", "") + lead.get("problem", "")).lower()
    if any(x in company for x in ["logistics", "freight", "hospitality", 
                                   "hotel", "supply chain", "manufacturing"]):
        score += 2

    # Timeline urgency
    timeline = lead.get("timeline", "").lower()
    if any(x in timeline for x in ["asap", "urgent", "month", "quarter", "soon"]):
        score += 2
    if any(x in timeline for x in ["exploring", "not sure", "someday"]):
        score += 0

    # Size signal
    if any(x in company for x in ["team", "staff", "employees", "people"]):
        score += 1

    if score >= 7:
        return "HIGH"
    elif score >= 4:
        return "MEDIUM"
    else:
        return "LOW"