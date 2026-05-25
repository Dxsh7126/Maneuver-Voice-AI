# Maneuver — Talk to Founder Voice AI Agent

A real-time voice AI web application that lets visitors have a natural conversation
with an AI agent representing Husain Topiwala, founder of Maneuver. The agent runs
a discovery call, captures lead information live, scores leads by value, and routes
high-priority prospects directly to Husain. The frontend reacts visually to the
conversation in real time, cards and panels appear while the agent speaks.

---

## How to run locally

### Prerequisites

- Python 3.11+
- Node.js 18+ and pnpm
- Free accounts: [LiveKit Cloud](https://livekit.io), [Groq](https://console.groq.com), [ElevenLabs](https://elevenlabs.io)

### Step 1 — Clone the repo

```bash
git clone https://github.com/Dxsh7126/Maneuver-Voice-AI
cd maneuver-voice-ai
```

### Step 2 — Python agent

```bash
cd backend/src

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
source venv/bin/activate       # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Copy env template and fill in your keys
cp .env.example .env
```

Fill in `.env`:

```bash
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=APIxxxxxxxxxxxxxxx
LIVEKIT_API_SECRET=your-secret
GROQ_API_KEY=gsk_...
ELEVENLABS_API_KEY=sk_...
NOTIFY_FROM_EMAIL=yourgmail@gmail.com
NOTIFY_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
```

Run the agent:

```bash
python agent.py dev
```

Wait for:
```
INFO  livekit.agents  registered worker  {"url": "wss://..."}
```

### Step 3 — React frontend

```bash
cd frontend

pnpm install

cp .env.example .env.local
```

Fill in `.env.local`:

```bash
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=APIxxxxxxxxxxxxxxx
LIVEKIT_API_SECRET=your-secret
AGENT_NAME=
```

Run the frontend:

```bash
pnpm dev
```

Open `http://localhost:3000`, click **Start Call**, grant mic permission.

### If the connection fails

- Make sure the agent terminal shows "registered worker" **before** clicking Start Call
- Hard refresh the browser: `Ctrl + Shift + R`
- Restart both terminals if the token is stale (idle for more than 10 minutes)

---

## Models and providers — and why

| Role | Provider | Model | Why |
|---|---|---|---|
| **VAD** | Silero | built-in | Runs locally, zero latency, no API call for end-of-turn detection |
| **STT** | Groq | `whisper-large-v3-turbo` | Groq's LPU hardware gives ~200ms transcription vs 800ms on standard cloud. Free tier. |
| **LLM** | Groq | `llama-3.3-70b-versatile` | Strong tool calling, fast on Groq's LPUs, free tier. 70b handles complex conversation and multi-tool turns reliably. |
| **TTS** | Cartesia | `sonic-turbo` | Highly conversational and stable at ultra-low latency. Standard Public Voice (`a0e99841-438c-4a64-b679-ae501e7d6091`) — natural, professional, and avoids free-tier connection drops. |
| **Real-time audio** | LiveKit | Cloud free tier | Handles WebRTC, turn detection, noise cancellation, and RPC between agent and browser. Required by assignment. |
| **Framework** | LiveKit Agents | v1.5 | Required. Provides the voice pipeline, function calling infrastructure, and session management. |
| **Frontend** | Next.js + React | 15 | Starter template provided. TypeScript throughout. |
| **Notifications** | Gmail SMTP | — | Free. No third-party service needed for high-value lead email alerts. |

**Why Groq over OpenAI for LLM:** Groq's LPU hardware produces tokens 5-10x faster than standard GPU inference. For voice conversations where every 100ms matters, this is the difference between a natural pause and an awkward silence. The free tier is also generous enough for development and demo.

---

## Architecture

```
User speaks into browser mic
        ↓
LiveKit Room (WebRTC audio relay)
        ↓
Groq Whisper STT → transcript in ~200ms
        ↓
Llama 3.3 70B decides: respond + optionally call a visual tool
        ↓
    ┌── Visual tool fires (e.g. display_services)
    │       ↓
    │   perform_rpc → browser receives showUI event
    │       ↓
    │   React renders card (ServicesCard, ProcessCard, etc.)
    │       ↓
    │   session.say() speaks the response simultaneously
    │
    └── No tool → LLM response goes straight to TTS
        ↓
ElevenLabs TTS → audio back through LiveKit → user hears response

Separately, on every transcript:
Python regex extracts lead fields → writes leads.json → RPC updateLead → sidebar updates
```

**Key insight:** RPC fires before TTS completes, so visuals appear *with* the voice, not after.

---

## Two conversation modes

### Discovery mode (default)
The agent opens the call and walks the user through discovery — one question at a time, branching naturally based on answers. The goal is to learn: what they're building, where the pain is, their stage, timeline, and budget signal.

The agent never asks more than one question per turn and never accepts vague answers without following up.

### Q&A mode
If the user asks about Maneuver at any point — services, process, case studies, pricing — the agent answers from its knowledge base and steers back to discovery. The switch between modes is seamless within a single call.

---

# Lead Capture (LLM Multi-Tool Extraction)

Lead extraction is handled dynamically by Groq's `llama-3.3-70b-versatile` using a multi-parameter tool call (`update_lead_info`). This allows the LLM to use semantic understanding to parse messy human speech.

| Field     | Example Trigger |
|------------|------------------|
| `name`     | "Uhm, I'm John" |
| `company`  | "Basically we run like... a logistics platform out in Dubai." |
| `problem`  | "Manual tracking is an absolute nightmare." |
| `timeline` | "We need to move by next quarter." |
| `budget`   | "We just raised our seed round." |

## Self-Correction

If the user changes their mind (e.g. *"Actually, change that to next month"*), the system prompt instructs the LLM to fire the tool again, overwriting the state.

Fields write to `leads.json` immediately on capture to survive dropped calls, and the React side panel updates live via RPC.

---

# Lead Scoring and Routing

Once the agent has `problem + company + (timeline or budget)`, it calls `close_call()` which scores the lead and routes accordingly:

```text
Score 7+  → HIGH   → immediate SMTP email to husain@maneuver.ae
                   → UI shows HighValueClose: "Husain will reach out personally"

Score 4-6 → MEDIUM → UI shows BookCall: Calendly link

Score < 4 → LOW    → UI shows BookCall: Calendly link
```

This protects the founder's time by automating gatekeeping so only the highest-value leads get personal attention, while everyone else gets a frictionless booking flow.

---


**Sample captured output (`leads.json`):**
```json
{
  "name": "John",
  "company": "logistics company in Dubai",
  "problem": "We're struggling with manual dispatch and tracking.",
  "timeline": "3 months",
  "budget": "Seed stage",
  "tier": "HIGH"
}
```

---

## Lead scoring and routing

Once the agent has `problem + company + (timeline or budget)`, it calls `close_call()` which scores the lead and routes accordingly:

```python
Score 7+  → HIGH   → immediate email to husain@maneuver.ae
                   → UI shows HighValueClose: "Husain will reach out personally"

Score 4-6 → MEDIUM → UI shows BookCall: Calendly link
Score < 4 → LOW    → UI shows BookCall: Calendly link
```

**Scoring signals:**
- Funded/investor-backed → +3
- Clear articulated problem → +2
- Industry match (logistics, hospitality, supply chain) → +2
- Urgent timeline → +2
- Team size signal → +1

This protects Husain's time — only the highest-value leads get his personal attention. Everyone else gets a frictionless booking flow.

---


# Synchronized Visual Layer

When the LLM calls a visual tool, the React frontend renders the corresponding component on screen while the agent is still speaking.

| User Asks / States | Tool Called | UI Rendered |
|---------------------|-------------|--------------|
| "What services do you offer?" | `display_services()` | `ServicesCard` — 5 core offerings |
| "Tell me about Voice AI" | `display_one_service("Voice AI")` | `ServiceDetail` — specific breakdown |
| "How does your process work?" | `display_process()` | `ProcessCard` — 3-step diagram |
| Agent captures multiple fields | `update_lead_info(...)` | Sidebar fields fade in |
| Lead qualifies to close | `close_call()` | `HighValueClose` or `BookCall` |

```

## File structure

```text
maneuver-voice-agent/
│
├── backend/
│   ├── src/
│   │   ├── agent.py            # ManeuverAgent class, all tools, entrypoint
│   │   ├── prompts.py          # System prompt — persona, constraints, KB
│   │   ├── scoring.py          # Lead scoring logic (HIGH/MEDIUM/LOW)
│   │   └── notifications.py    # Gmail SMTP — fires on HIGH tier leads
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    ├── app/
    │   └── components/
    │       ├── view-controller.tsx   # Layout: welcome screen + connected layout
    │       └── agents-ui/
    │           ├── AgentStatus.tsx   # Listening/Thinking/Speaking visualizer
    │           ├── DynamicPanel.tsx  # Routes uiState to correct card
    │           ├── LeadPanel.tsx     # Live discovery capture sidebar
    │           └── panels/           # Individual UI cards (Services, Process, etc.)
    ├── hooks/
    │   └── useAgentUI.ts         # RPC listeners, state management
    ├── package.json
    └── .env.example
```
---

## What I'd build next with another week

**1. WhatsApp alerts instead of email**
Husain is more likely to respond to a WhatsApp message than an email within the hour. Twilio's WhatsApp API is straightforward to wire in — same trigger, different transport.

**2. Admin dashboard at `/admin`**
A simple page showing all past calls: captured fields, lead tier, timestamp, and a full transcript. Gives Husain a CRM-lite view without any third-party tool. Would take a day with a simple JSON file store or SQLite.

**3. Arabic language support**
Maneuver serves UAE clients. The agent should detect Arabic input (Whisper identifies the language automatically) and switch to an Arabic TTS voice. Deepgram supports Arabic; ElevenLabs has Arabic voices. Would double the addressable audience on the site.

**4. Calendly inline booking**
Instead of sending users to a link, use the Calendly API to show available slots inline and confirm a booking without leaving the conversation. Zero friction between "I'm interested" and a confirmed meeting in the calendar.

**5. Returning visitor recognition**
Store caller profiles by phone/browser fingerprint. When someone returns, the agent knows who they are: "Hey, weren't you working on a logistics platform last time we spoke?" — a significant differentiator for a sales tool.

**6. Multi-agent handoff**
A "scheduling agent" that takes over after the discovery agent closes — handles calendar booking, sends a confirmation, and sets up a pre-call brief for Husain. The LiveKit Agents framework supports this natively.

---

## Architecture decisions worth explaining

**Why one agent class, not multi-agent handoff:**
The discovery → close flow is linear enough that one agent with two modes (discovery + Q&A) handles it cleanly. A second agent would add latency at the handoff point with no user-visible benefit for a 5–8 minute call. This can be added later when the scheduling flow becomes complex enough to justify it.

**Why LLM Extraction Instead of Python Regex:**
Initial prototypes used Python Regex to extract lead data from transcripts in order to save LLM tokens. However, real humans on voice calls rarely speak in perfectly structured sentences.
People stutter, interrupt themselves, use filler words, and speak in fragments, for example:
```text
"I run, well, it's a... logistics thing."
```
Regex-based extraction fails quickly on conversational speech because it depends on rigid sentence patterns and exact keyword matching.
Upgrading to an LLM-driven `update_lead_info` tool leverages the model’s semantic understanding instead of pattern matching. This allows the system to accurately interpret messy, natural speech and reliably extract structured lead data in real time.

**Why Groq for both STT and LLM:**
Same provider = one API key, one failure point, consistent sub-300ms latency for both. Groq's LPU hardware is the reason voice feels real-time. The alternative (Deepgram STT + OpenAI LLM) adds a second paid dependency and ~200ms of extra latency.

