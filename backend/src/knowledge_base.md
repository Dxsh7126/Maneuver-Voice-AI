# knowledge_base.py

SERVICES = """
Services:
- Intelligent Workflows: Automated pipelines. 40% less manual work.
- Voice AI: Arabic/English agents, 24/7, CRM-integrated.
- AI Agents: Handle enquiries, route requests autonomously.
- Bespoke Applications: Custom systems, full ownership.
- Systems Integration: Connect AI to existing CRM/email/databases.
"""

PROCESS = """
Process: Understand → Design & Build → Launch & Evolve.
We stay through go-live and after.
"""

POSITIONING = """
vs Big Four: They give decks after months. We deploy in weeks.
vs Freelancers: They build what you ask. We own strategy + build.
Numbers: 6+ countries, 10+ projects, 100% retention.
"""

CASE_STUDY = """
Freight brokerage: automated dispatch, tracking, comms.
Dispatchers recovered 3+ hours/day.
"""

CONTACT = """
husain@maneuver.ae | +971 58 284 9985
Book: calendly.com/husain-maneuver/30min
"""

# This is all the agent actually needs in the system prompt
CORE_KB = f"{SERVICES}\n{PROCESS}\n{POSITIONING}"