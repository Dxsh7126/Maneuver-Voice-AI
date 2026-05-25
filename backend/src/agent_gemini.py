import asyncio
import json
import random
import time
from pathlib import Path
from typing import Annotated
from dotenv import load_dotenv
from livekit.agents import Agent, AgentSession, JobContext, WorkerOptions, cli, function_tool
from livekit.plugins import groq, silero
from livekit.plugins import elevenlabs, cartesia
from prompts import SYSTEM_PROMPT
from scoring import score_lead
from notifications import notify_husain

load_dotenv(dotenv_path=Path(__file__).parent / ".env")

# ── Lead data — persists for the duration of the call ──────────────────────
lead_data = {}

# ── Opening lines — randomised so it never sounds scripted ─────────────────
OPENING_LINES = [
    "Hey, I'm Husain from Maneuver. What are you working on?",
    "Hey, Husain here. Thanks for stopping by, what's keeping you busy these days?",
    "Hi there, Husain from Maneuver. What kind of business are you running?",
    "Hey, good to have you here. I'm Husain, what are you building?",
    "Husain here from Maneuver. What's on your plate right now?",
]

# ── Agent class ─────────────────────────────────────────────────────────────
class ManeuverAgent(Agent):

    def __init__(self, ctx: JobContext, session_ref: list):
        super().__init__(instructions=SYSTEM_PROMPT)
        self._ctx = ctx
        self._session_ref = session_ref

    # ── RPC helper ──────────────────────────────────────────────────────────
    async def _send_rpc(self, method: str, payload: dict):
        participants = list(self._ctx.room.remote_participants.values())

        if not participants:
            for _ in range(5):
                await asyncio.sleep(0.8)
                participants = list(self._ctx.room.remote_participants.values())
                if participants:
                    break

        if not participants:
            print(f"[RPC] no participants found — method: {method}")
            return

        try:
            await self._ctx.room.local_participant.perform_rpc(
                destination_identity=participants[0].identity,
                method=method,
                payload=json.dumps(payload),
            )
            print(f"[RPC] sent {method} to {participants[0].identity}")
        except Exception as e:
            print(f"[RPC] failed: {type(e).__name__}: {e}")

    # ── Visual & Data Tools ──────────────────────────────────────────────────
    
    @function_tool
    async def update_lead_info(
        self,
        name: Annotated[str, "The user's name, if revealed"] = "",
        company: Annotated[str, "The user's company or industry, if revealed"] = "",
        problem: Annotated[str, "The user's operational problem, if revealed"] = "",
        timeline: Annotated[str, "The user's timeline, if revealed"] = "",
        budget: Annotated[str, "The user's budget or funding stage, if revealed"] = ""
    ):
        """
        Capture OR update discovery info. 
        Call this the MOMENT any of these fields become clear.
        You can update multiple fields at once if the user provides them.
        CRITICAL OVERWRITE RULE: If the user corrects themselves, call this again with the new value.
        """
        # Collect only the fields the LLM actually provided
        updates = {}
        if name: updates["name"] = name
        if company: updates["company"] = company
        if problem: updates["problem"] = problem
        if timeline: updates["timeline"] = timeline
        if budget: updates["budget"] = budget

        # Update the state and send RPCs for each field
        for field, value in updates.items():
            lead_data[field] = value
            print(f"[LLM EXTRACT] captured/updated: {field} = {value}")
            await self._send_rpc("updateLead", {"field": field, "value": value})
            
        # Save to disk
        with open("leads.json", "w") as f:
            json.dump(lead_data, f, indent=2)
            
        # Return receipt to resume conversation
        return f"Successfully updated {list(updates.keys())}. Now, continue the conversation naturally."

    @function_tool
    async def display_services(self):
        """
        Show Maneuver's services overview on screen.
        Call when the user asks what Maneuver does or what services exist.
        """
        await self._send_rpc("showUI", {"type": "services"})
        session = self._session_ref[0]
        await session.say(
            "We work across five main areas, from automating your workflows "
            "to building full custom systems. Which is closest to what you're dealing with?",
            allow_interruptions=True,
        )

    @function_tool
    async def display_one_service(
        self,
        service: Annotated[
            str,
            "Exact service name. One of: Intelligent Workflows, Voice AI, "
            "AI Agents, Bespoke Applications, Systems Integration",
        ],
    ):
        """
        Show detail for one specific Maneuver service.
        Call when the user asks about a specific service by name.
        """
        await self._send_rpc("showUI", {"type": "service_detail", "name": service})
        session = self._session_ref[0]
        await session.say(
            f"{service} is one of our strongest offerings. "
            "What does that challenge look like in your business right now?",
            allow_interruptions=True,
        )

    @function_tool
    async def display_process(self):
        """
        Show Maneuver's 3-step process on screen.
        Call when the user asks how Maneuver works or about the process.
        """
        await self._send_rpc("showUI", {"type": "process"})
        session = self._session_ref[0]
        await session.say(
            "Three steps. We understand first, then build real systems, "
            "then stay with you after launch. No decks, no prototypes. "
            "What stage are you at right now?",
            allow_interruptions=True,
        )

    @function_tool
    async def close_call(self):
        """
        Score this lead and show the right closing card.
        Call once you have the user's problem, company, and at least
        one of: timeline or budget. Do not call more than once.
        """
        tier = score_lead(lead_data)
        lead_data["tier"] = tier
        with open("leads.json", "w") as f:
            json.dump(lead_data, f, indent=2)

        session = self._session_ref[0]

        if tier == "HIGH":
            await notify_husain(lead_data)
            await self._send_rpc("showUI", {"type": "high_value_close"})
            await session.say(
                "Honestly this sounds like exactly the kind of engagement "
                "Husain handles personally. I'm flagging this for him right now, "
                "expect a message within the hour.",
                allow_interruptions=True,
            )
        else:
            await self._send_rpc("showUI", {"type": "book_call"})
            await session.say(
                "This sounds worth exploring properly. "
                "I've pulled up a link to grab 30 minutes with the team, "
                "no pitch, just an honest conversation.",
                allow_interruptions=True,
            )


# ── Entrypoint ───────────────────────────────────────────────────────────────
async def entrypoint(ctx: JobContext):
    await ctx.connect()

    session_ref: list = []
    agent = ManeuverAgent(ctx, session_ref)

    session = AgentSession(
        stt=groq.STT(model="whisper-large-v3-turbo"),
        llm=groq.LLM(
            model="llama-3.3-70b-versatile",
            timeout=8.0,
        ),
        tts=cartesia.TTS(
            model="sonic-turbo",
            voice="a0e99841-438c-4a64-b679-ae501e7d6091",
        ),
        vad=silero.VAD.load(
            min_silence_duration=1.2,
            min_speech_duration=0.05,
            prefix_padding_duration=0.3,
        ),
    )

    session_ref.append(session)

    # ── Silence tracking ────────────────────────────────────────────────────
    last_activity = time.time()
    silence_fired = True

    @session.on("agent_stopped_speaking")
    def on_agent_stopped_speaking():
        nonlocal last_activity, silence_fired
        # The agent just finished its sentence. Start the 12-second clock!
        last_activity = time.time()
        silence_fired = False  

    @session.on("user_speech_started")
    def on_user_speech_started():
        nonlocal silence_fired
        # The user just opened their mouth. Pause the clock!
        silence_fired = True

    # ── Silence monitor ─────────────────────────────────────────────────────
    async def silence_monitor():
        nonlocal silence_fired
        while True:
            await asyncio.sleep(2)
            if not silence_fired and (time.time() - last_activity) > 12:
                silence_fired = True
                await session.say(
                    "Still there? No rush at all.",
                    allow_interruptions=True,
                )

    asyncio.create_task(silence_monitor())

    # ── Start ───────────────────────────────────────────────────────────────
    await session.start(agent, room=ctx.room)
    await asyncio.sleep(1.5)
    await session.say(
        random.choice(OPENING_LINES),
        allow_interruptions=True,
    )
    last_activity = time.time()


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))