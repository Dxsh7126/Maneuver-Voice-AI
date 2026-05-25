# tools.py
import json
from typing import Annotated
from livekit.agents import llm
import asyncio

# Shared lead data dict — lives for the duration of the call
lead_data = {}

async def safe_rpc(ctx, method: str, payload: str, retries: int = 3):
    for attempt in range(retries):
        try:
            await ctx.room.local_participant.perform_rpc(
                destination_identity="frontend",
                method=method,
                payload=payload
            )
            return
        except Exception:
            if attempt < retries - 1:
                await asyncio.sleep(0.5)

def build_tools(ctx):
    fnc_ctx = llm.FunctionContext()

    @fnc_ctx.ai_callable(
        description="""Show Maneuver's full services overview. 
        Call this when the user asks what Maneuver does, what services 
        are offered, or how Maneuver can help."""
    )
    async def show_services_slide():
        await ctx.room.local_participant.perform_rpc(
            destination_identity="frontend",
            method="showUI",
            payload=json.dumps({"type": "services"})
        )

    @fnc_ctx.ai_callable(
        description="""Show detail on one specific Maneuver service. 
        Call this when the user asks about a specific service by name."""
    )
    async def show_service_detail(
        service: Annotated[str, llm.TypeInfo(
            description="One of: Intelligent Workflows, Voice AI, "
                        "AI Agents, Bespoke Applications, Systems Integration"
        )]
    ):
        await ctx.room.local_participant.perform_rpc(
            destination_identity="frontend",
            method="showUI",
            payload=json.dumps({"type": "service_detail", "name": service})
        )

    @fnc_ctx.ai_callable(
        description="""Show Maneuver's 3-step process. 
        Call this when the user asks how Maneuver works or about the process."""
    )
    async def show_process():
        await ctx.room.local_participant.perform_rpc(
            destination_identity="frontend",
            method="showUI",
            payload=json.dumps({"type": "process"})
        )

    @fnc_ctx.ai_callable(
        description="""Capture a piece of discovery info the user just revealed. 
        Call this the MOMENT a field becomes clear — don't wait until 
        the end of the call."""
    )
    async def update_lead_field(
        field: Annotated[str, llm.TypeInfo(
            description="One of: name, company, problem, timeline, budget"
        )],
        value: Annotated[str, llm.TypeInfo(
            description="Exactly what the user said, summarized cleanly"
        )]
    ):
        lead_data[field] = value
        # Persist immediately — survives a dropped call
        with open("leads.json", "w") as f:
            json.dump(lead_data, f, indent=2)
        # Update the frontend side panel live
        await ctx.room.local_participant.perform_rpc(
            destination_identity="frontend",
            method="updateLead",
            payload=json.dumps({"field": field, "value": value})
        )

    @fnc_ctx.ai_callable(
        description="""Call this when the conversation is wrapping up 
        and the user has agreed to book a follow-up call."""
    )
    async def end_call_summary():
        await ctx.room.local_participant.perform_rpc(
            destination_identity="frontend",
            method="showUI",
            payload=json.dumps({"type": "summary", "lead": lead_data})
        )

    @fnc_ctx.ai_callable(
    description="""Call this when you have enough information to assess 
    whether this is a strong lead for Maneuver. Call it after you have 
    at least: their problem, company/industry, and a budget or timeline 
    signal. Do NOT call it too early."""
)
    async def qualify_and_route():
        from scoring import score_lead
        from notifications import notify_husain
        
        tier = score_lead(lead_data)
        lead_data["tier"] = tier

        # Save updated lead with tier
        with open("leads.json", "w") as f:
            json.dump(lead_data, f, indent=2)

        if tier == "HIGH":
            # Alert Husain immediately
            await notify_husain(lead_data)
            # Show "Husain will reach out" UI
            await ctx.room.local_participant.perform_rpc(
                destination_identity="frontend",
                method="showUI",
                payload=json.dumps({"type": "high_value_close"})
            )
        else:
            # Show standard Calendly booking
            await ctx.room.local_participant.perform_rpc(
                destination_identity="frontend",
                method="showUI",
                payload=json.dumps({"type": "book_call"})
            )

    return fnc_ctx