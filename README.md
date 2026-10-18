# Scout — Multi-Agent Opportunity Radar

> **Every opportunity you qualify for. Found before the deadline.**  
> An autonomous multi-agent platform that dispatches web agents across scholarship, internship, hackathon, and fellowship portals with no public APIs, proves real eligibility with quoted evidence, deterministically scores matches, and drafts ready-to-refine applications.

---

## ⚡ Key Highlights & Architecture

- **Autonomous Web Crawling with TinyFish**: Cloud-based stealth Chromium sessions navigate dynamic Single-Page Apps (SPAs), bypass bot restrictions, and follow pagination via natural language goals.
- **Two-Stage Multi-Agent Swarm**:
  - **Stage A (Discovery)**: Fast parallel portal sweep capturing raw titles, links, and deadlines.
  - **Stage B (Deep Extraction)**: Deep evaluation of individual listings to extract ISO-8601 deadlines, benefits, and structured eligibility clauses.
- **Evidence-First Verification**: Every eligibility verdict (`eligible`, `likely`, `unclear`, `ineligible`) quotes the exact published sentence from the portal.
- **Deterministic Mathematical Ranker**:
  $$\text{Total Score} = 100 \times (0.50 \times \text{Fit} + 0.20 \times \text{Value} + 0.20 \times \text{Urgency} + 0.10 \times \text{Effort})$$
  *LLMs never compute numbers or hallucinate scores.*
- **Honest Rejections**: Ineligible opportunities are kept in a transparent *"Not for you, and why"* drawer highlighting exact unmet criteria (e.g. income thresholds or required tech stack).
- **Tailored Application Drafts**: Prepares a 120–180 word statement of purpose plus a required documents checklist using facts from the student's profile only.
- **Real-Time SSE Streaming**: Live status cards, agent log ticker, and stage progress stream directly to the frontend over Server-Sent Events.
- **30-Minute Disk Cache (`.cache`)**: Eliminates redundant web crawls and replays identical searches in milliseconds.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend** | Python 3.11+, FastAPI, Pydantic v2, `asyncio`, `sse-starlette`, `httpx`, `PyYAML`, `diskcache`, `pytest` |
| **Web Agents** | **TinyFish Web Agent API** (`agent.tinyfish.ai`) + MockClient with 40+ verified fixtures |
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, GSAP + ScrollTrigger, Lenis smooth scroll, Lucide icons |
| **Fonts** | Self-hosted `@fontsource-variable/inter`, `@fontsource/instrument-serif`, `@fontsource-variable/jetbrains-mono` |
| **Design System** | Dark editorial mission-control (`#09090B`), 1px geometric borders, electric lime signal (`#D4FF3A`), zero generic gradients |

---

## 📂 Project Structure

```
scout/
├── sources.yaml                      # 6 curated portals (NSP, Buddy4Study, Internshala, Unstop, Devfolio, Devpost)
├── .env.example                      # Environment defaults & key templates
├── .env                              # Active local config (MOCK_MODE, TINYFISH_API_KEY)
├── pytest.ini                        # Unit test configuration
├── README.md
├── scripts/
│   ├── test_pipeline.py              # CLI acceptance script running full pipeline end-to-end
│   └── test_source.py                # Standalone script to test live TinyFish crawling on any URL
├── backend/
│   ├── requirements.txt
│   ├── app/
│   │   ├── main.py                   # FastAPI server & CORS middleware
│   │   ├── config.py                 # Environment settings & .env loader
│   │   ├── models.py                 # Strict Pydantic v2 data models
│   │   ├── events.py                 # SSE event serialization
│   │   └── runs.py                   # Run manager, async queue & SSE streaming endpoints
│   ├── orchestrator/
│   │   ├── profile_parser.py         # Heuristic & semantic student bio parser
│   │   ├── planner.py                # Stage A task planner from sources.yaml
│   │   ├── executor.py               # Semaphore-controlled parallel agent executor
│   │   ├── prefilter.py              # Drops expired, duplicate & off-category items
│   │   ├── eligibility.py            # Evidence-backed criteria evaluation engine
│   │   ├── ranker.py                 # Mathematical formula ranking & sorting
│   │   └── drafts.py                 # Tailored application draft generator
│   ├── web_agent/
│   │   ├── base.py                   # WebAgentClient abstract interface
│   │   ├── mock_client.py            # High-fidelity fixture client with simulated latency & retries
│   │   ├── tinyfish_client.py        # Live TinyFish cloud browser agent client with disk caching
│   │   └── goals.py                  # Natural language prompts & strict JSON schemas for TinyFish
│   ├── fixtures/
│   │   └── opportunities.json        # 40+ rich opportunities (eligible, expired, duplicate, ineligible)
│   └── tests/
│       └── test_health_and_models.py # Pytest test suite for health, models, and pipeline
└── frontend/
    ├── package.json
    ├── tailwind.config.js            # Token-only theme mapping (no default Tailwind colors)
    └── src/
        ├── styles/
        │   ├── tokens.css            # Strict color, spacing, and radius tokens
        │   └── globals.css           # Typography, atmosphere, masked grid, and SVG film grain
        ├── lib/
        │   ├── types.ts              # Mirrored TypeScript data interfaces
        │   ├── motion.ts             # Easing curves, spring physics (300/20), and durations
        │   ├── scroll.ts             # Lenis smooth scroll + GSAP integration
        │   └── api.ts                # REST client functions
        ├── hooks/
        │   ├── useRunStream.ts       # SSE event consumer hook for real-time agent tracking
        │   ├── useSpotlight.ts       # Radial cursor spotlight hook
        │   └── useMagnetic.ts        # Spring physics magnetic button hook
        ├── components/ui/
        │   ├── Button.tsx            # Magnetic pill button with arrow animations
        │   ├── Card.tsx              # 22px radius card with radial spotlight and 2px lift
        │   ├── MatchRing.tsx         # 56px SVG score ring with 1.1s count-up
        │   ├── Badge.tsx             # VerdictBadge and CategoryBadge with 1.5 stroke icons
        │   └── Skeleton.tsx          # 1.6s sweep shimmer loader (no spinners)
        └── pages/
            ├── Landing.tsx           # Product Landing Page (Hero, How It Works, Sources, FAQ)
            ├── Radar.tsx             # 2-Screen Opportunity Hunter (Input Box + Live Results)
            └── Styleguide.tsx        # Design system & component showcase (/styleguide)
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Python**: 3.11 or higher
- **Node.js**: v18 or higher (v20+ recommended)
- **TinyFish API Key**: Obtainable from [agent.tinyfish.ai](https://agent.tinyfish.ai) (optional; mock mode works with zero keys)

---

### 2. Configuration (`.env`)

Create a `.env` file in the project root:

```env
# Mode: set to false for live TinyFish agents, true for offline fixtures
MOCK_MODE=false
MOCK_FAIL_RATE=0.0
MAX_PARALLEL_AGENTS=6
RUN_DEADLINE_S=180

# TinyFish Live Web Agent API
TINYFISH_API_KEY=sk-tinyfish-your-api-key-here
TINYFISH_API_BASE=https://agent.tinyfish.ai/v1

# Cache Configuration (30 minutes)
CACHE_DIR=.cache
CACHE_TTL_MINUTES=30
```

---

### 3. Running the Backend

From the project root:

```powershell
# Windows
.\.venv\Scripts\uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload

# Linux / macOS
source .venv/bin/activate
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
- API Base: `http://127.0.0.1:8000`
- Health Endpoint: `http://127.0.0.1:8000/api/health`

---

### 4. Running the Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```
- Open browser at: **`http://localhost:5173/`**

---

## 🧪 Testing & Verification

### Run End-to-End Pipeline in Terminal
Execute the complete pipeline locally and view full output with color-coded verdicts:

```powershell
.\.venv\Scripts\python scripts\test_pipeline.py
```

### Test Live TinyFish Web Agent on Any Portal
Send a real browser agent to any web portal:

```powershell
.\.venv\Scripts\python scripts\test_source.py https://devpost.com
```

### Run Unit Tests
Run backend unit tests with pytest:

```powershell
.\.venv\Scripts\pytest
```

---

## 🌐 Application Pages & Routes

| URL Route | Purpose | Description |
| :--- | :--- | :--- |
| **`/`** | **Landing Page** | Product overview, 4-stage pipeline explanation, supported portals, FAQ, and "Start Hunting" button. |
| **`/app`** | **Opportunity Radar** | 2-screen working app: plain-text input box with example chips $\to$ real-time mission control with live agent status, ranked cards, and application drafts. |
| **`/styleguide`** | **Design System** | Interactive design system showcasing color tokens, typography pairings, magnetic buttons, SVG match rings, and accessibility controls. |

---

## 🔒 Security & Privacy Notice
- Scout only interacts with **public web pages**. It does not perform logins or store private credentials.
- Drafted applications are **never auto-submitted**; users retain 100% human-in-the-loop control.
