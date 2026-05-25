# notifications.py
import smtplib, os
from email.mime.text import MIMEText

async def notify_husain(lead: dict):
    """
    Sends Husain an email the moment a high-value lead finishes a call.
    Uses Gmail SMTP — free, no third-party service needed.
    """
    body = f"""
🔥 HIGH VALUE LEAD — Maneuver Voice AI

Name:     {lead.get('name', 'Unknown')}
Company:  {lead.get('company', 'Unknown')}
Problem:  {lead.get('problem', 'Unknown')}
Timeline: {lead.get('timeline', 'Unknown')}
Budget:   {lead.get('budget', 'Unknown')}

Reply directly to follow up.
"""
    msg = MIMEText(body)
    msg["Subject"] = f"🔥 Hot lead: {lead.get('name', 'Unknown')} — {lead.get('company', '')}"
    msg["From"]    = os.getenv("NOTIFY_FROM_EMAIL")   # your gmail
    msg["To"]      = "husain@maneuver.ae"

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(
            os.getenv("NOTIFY_FROM_EMAIL"),
            os.getenv("NOTIFY_APP_PASSWORD")   # Gmail app password, not your login password
        )
        server.send_message(msg)