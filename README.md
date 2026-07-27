# AgentAccord v2.0 — No Decision Ships Unchallenged.

An autonomous AI governance platform where two AI agents engage in adversarial dialectic debate over high-stakes proposals in a cinematic 3D WebGL environment. One agent defends institutional authority using internal documents; the other challenges with live web search and ethical reasoning. They debate until reaching an auditable egalitarian compromise — exported as a PDF and persisted to MongoDB.

## Prerequisites

### Required Software
- **Python 3.10+**
- **Node.js 18+**
- **npm 9+**

### API Keys (for Live Mode)
- **OpenAI API Key** — Powers GPT-4o agent reasoning
  - Get one: https://platform.openai.com/api-keys
- **Serper API Key** — Powers live Google Search for fact-checking
  - Get one: https://serper.dev/ (free tier available)

### Optional: MongoDB History Server
The DecisionLedger auto-saves accord PDFs to a MongoDB backend at `http://localhost:5000/api/history`. This enables:
- **History Tab**: View all past debates in the sidebar
- **Accord Persistence**: Every accord is saved as a PDF to MongoDB Atlas
- **Audit Trail**: Complete record of all negotiations

**Setup:**
```powershell
cd db
npm install
```

**Run:**
```powershell
node server.js
```

**Configuration:**
- Edit `db/.env` to set your MongoDB Atlas connection string
- Default: `MONGODB_URI=mongodb+srv://...` (get from MongoDB Atlas)
- Server runs on port 5000 by default

If this server is not running, the app still works — PDF download and clipboard copy remain functional, but the History tab will be empty.

---

## Installation

### 1. Clone the Project
```powershell
git clone https://github.com/Debvex/Agent-Accord-v2.0.git
cd "Agent Accord-v2.0"
```

### 2. Backend Setup

#### Install Python Dependencies
```powershell
cd backend
pip install -r requirements.txt
```

Dependencies:
- `fastapi==0.115.6` — Web framework
- `uvicorn[standard]==0.34.0` — ASGI server
- `python-multipart==0.0.20` — File upload handling
- `python-dotenv==1.0.1` — Environment variable management
- `openai>=1.58.0` — OpenAI API client
- `httpx>=0.28.0` — Async HTTP client (for Serper API)
- `PyPDF2>=3.0.0` — PDF text extraction
- `beautifulsoup4>=4.12.0` — HTML parsing (web scraping)

#### Configure Environment Variables
```powershell
copy .env.example .env
notepad .env
```

Add your keys:
```env
OPENAI_API_KEY=sk-proj-your-actual-openai-key-here
SERPER_API_KEY=your-actual-serper-key-here
```

**Important**: Never commit `.env` to version control. It's already in `.gitignore`.

### 3. Frontend Setup

#### Install Node Dependencies
```powershell
cd ../frontend
npm install
```

Key dependencies:
- **React 18** — UI framework
- **Vite 5** — Build tool
- **Tailwind CSS 4** — Utility-first CSS
- **React Three Fiber 8** — React renderer for Three.js
- **@react-three/drei 9** — R3F helpers
- **three 0.163** — 3D graphics library
- **axios** — HTTP client (file uploads, MongoDB persistence)
- **jspdf** — PDF generation for Decision Ledger export
- **lucide-react** — Icon library

---

## Running the Application

You need **three terminals** — one for backend, one for frontend, and one for MongoDB (optional but recommended).

### Terminal 1: Start Backend
```powershell
cd backend
python main.py
```

Expected output:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

Verify:
```powershell
curl http://localhost:8000/health
# {"status":"ok","version":"2.0"}
```

### Terminal 2: Start Frontend
```powershell
cd frontend
npm run dev
```

Expected output:
```
  VITE v5.x.x  ready in ~400 ms
  ->  Local:   http://localhost:5173/
```

### Terminal 3: Start MongoDB Server (Optional)
The MongoDB server automatically saves debate accords to a persistent database. While optional, it enables the History tab and accord persistence.

```powershell
cd db
npm install  # Only needed first time
node server.js
```

Expected output:
```
MongoDB History Server running on http://localhost:5000
Connected to MongoDB Atlas
```

Verify:
```powershell
curl http://localhost:5000/health
# {"status":"ok","message":"MongoDB History Server is running"}
```

**What it does:**
- Runs on `http://localhost:5000`
- Automatically saves each accord as a PDF to MongoDB Atlas
- Enables the History tab in the sidebar to view past debates
- If not running, the app still works — PDF download and clipboard copy remain functional

Open your browser: **http://localhost:5173**

---

## Usage

### The Sidebar

The left sidebar has three tabs:

- **Setup** — Upload context documents, enter your role and proposal, then click INITIATE DEBATE
- **Dialogue** — Live streaming transcript of the debate (auto-switches when debate starts)
- **History** — Opens stored MongoDB history records (requires MongoDB server at localhost:5000)

### Mock Mode (Offline Demo — No API Credits Required)

1. **Toggle Mock Mode**: Click the toggle in the sidebar header, or press `Ctrl+M`
2. **Enter your role**: e.g., "CEO of Apex Labs"
3. **Enter your proposal**: e.g., "Cut R&D by 20% immediately"
4. **Click INITIATE DEBATE**

A pre-scripted 4-turn debate plays automatically (~2.4 seconds per turn). No backend connection required. If the backend is unreachable in live mode, the app auto-falls back to mock mode.

### Live Mode (Real AI Debate — Requires API Credits)

1. Ensure `backend/.env` has valid `OPENAI_API_KEY` and `SERPER_API_KEY`
2. Upload a PDF or TXT document in the Setup tab
3. Enter your role and proposal
4. Click INITIATE DEBATE

**What happens**:
- **Turn 1**: Proxy agent defends proposal using document quotes (GPT-4o)
- **Turn 2**: Challenger agent performs live Serper web search, fact-checks claims, rebuts
- **Turn 3**: Proxy responds, defends non-negotiable points, offers concession
- **Turn 4**: Challenger synthesizes debate into final Egalitarian Accord
- All turns stream in real-time via Server-Sent Events (SSE)
- 3D orbs animate as each agent speaks
- Final accord opens the Decision Ledger with metrics and PDF export

### The Decision Ledger

When the debate concludes, the Decision Ledger modal appears with:

- **Executive Overview** — Policy compromise summary, strategic resource allocation chart, governance guarantees checklist
- **Audit Transcript** — Full immutable record of all dialogue turns
- **Resilience Score** — Predictive market resilience metric (X / 10.0)
- **Fairness Score** — Governance & layoff fairness metric (X / 10.0)
- **Export PDF** — Downloads a professionally formatted A4 PDF of the entire accord
- **MongoDB Auto-Save** — Automatically persists the PDF to MongoDB history (if server is running)
- **Copy to Clipboard** — Copies the accord summary

---

## API Endpoints

### Backend API (http://localhost:8000)

#### `POST /upload`
Upload a document for the debate.

```bash
curl -X POST http://localhost:8000/upload -F "file=@document.pdf"
```

Response:
```json
{ "status": "ready", "path": "...\\uploads\\session_doc.pdf", "filename": "document.pdf" }
```

#### `GET /negotiate`
Start the debate (SSE stream).

| Parameter | Type | Description |
|-----------|------|-------------|
| `role` | string | User's role (e.g., "CEO of Apex Labs") |
| `prompt` | string | The proposal to debate |
| `file_path` | string | Path to uploaded document |

```bash
curl -N "http://localhost:8000/negotiate?role=CEO&prompt=Cut%20R%26D&file_path=uploads/session_doc.pdf"
```

SSE Events:
```
data: {"type": "turn", "speaker": "proxy", "name": "Institutional Advocate", "color": "#38bdf8", "text": "..."}
data: {"type": "turn", "speaker": "challenger", "name": "Egalitarian Conscience", "color": "#f43f5e", "text": "..."}
data: {"type": "accord", "title": "Egalitarian Policy Accord v1.0", "summary": "..."}
```

#### `GET /health`
Health check. Returns `{"status": "ok", "version": "2.0"}`

---

## Project Structure

```
Agent Accord-v2.0/
├── backend/
│   ├── uploads/                 # Uploaded documents (gitignored)
│   ├── .env                     # API keys (gitignored)
│   ├── .env.example             # Template for .env
│   ├── .gitignore               # Git ignore rules
│   ├── requirements.txt         # Python dependencies
│   ├── agents.py                # OpenAI agent engine + Serper web search
│   ├── tasks.py                 # 4-turn debate task definitions
│   └── main.py                  # FastAPI server with SSE streaming
│
├── db/
│   ├── .env                     # MongoDB Atlas connection string (gitignored)
│   ├── .env.example             # Template for MongoDB URI
│   ├── package.json             # Node dependencies for MongoDB server
│   ├── server.js                # Express server for MongoDB operations
│   ├── controllers/
│   │   └── historyController.js # CRUD operations for debate history
│   └── models/
│       └── History.js           # Mongoose schema for debate records
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Sidebar.jsx          # Tabbed control panel (Setup / Dialogue / History)
    │   │   ├── Scene.jsx            # R3F canvas with stars, particles, fixed camera
    │   │   ├── AgentOrb.jsx         # Minimalist orb with wavy glow rings (WaveRing)
    │   │   ├── DecisionLedger.jsx   # PDF export, MongoDB save, metrics dashboard
    │   │   └── FileManager.jsx      # Multi-format file upload with preview/share/delete
    │   ├── App.jsx                  # Main state: SSE listener, mock mode, auto-fallback
    │   ├── index.css                # Tailwind CSS imports
    │   └── main.jsx                 # React entry point
    ├── package.json                 # Node dependencies
    └── vite.config.js               # Vite + Tailwind config
```

---

## Architecture

### Backend (Python FastAPI)

**agents.py** — Core AI engine:
- `extract_pdf_text()` — Extracts text from PDF/TXT files
- `serper_search()` — Async Serper API calls for live Google search
- `scrape_website()` — Web page content extraction via BeautifulSoup
- `generate_agent_response()` — OpenAI GPT-4o chat completions for either agent
- `generate_challenger_response_with_search()` — Challenger with mandatory web search step before responding

**tasks.py** — Debate structure:
- 4 sequential debate turns with speaker, description, and color
- Turn 1: Proxy opening thesis (document-based)
- Turn 2: Challenger rebuttal (mandatory web search + document)
- Turn 3: Proxy defense + concession
- Turn 4: Challenger synthesis (final accord)

**main.py** — FastAPI server:
- CORS middleware (allows localhost:5173)
- `POST /upload` — File upload handler (PDF/TXT)
- `GET /negotiate` — SSE streaming endpoint with async generator
- `GET /health` — Health check

### MongoDB Server (Node.js Express)

**server.js** — MongoDB history server:
- Express server running on port 5000
- Connects to MongoDB Atlas cloud database
- Provides REST API for debate history CRUD operations
- Auto-saves accord PDFs with metadata

**API Endpoints:**
- `POST /api/history` — Save new debate accord (auto-called by DecisionLedger)
- `GET /api/history` — Retrieve all past debates (used by History tab)
- `GET /api/history/:id` — Get specific debate by ID
- `DELETE /api/history/:id` — Delete a debate record

**models/History.js** — Mongoose schema:
- `title` — Debate title
- `summary` — Accord summary text
- `resilience_score` — Predictive resilience metric
- `fairness_score` — Governance fairness metric
- `pdf_data` — Base64-encoded PDF
- `created_at` — Timestamp

**controllers/historyController.js** — Business logic:
- Handles PDF storage and retrieval
- Manages debate history records
- Error handling for MongoDB operations

### Frontend (React + Three.js)

**App.jsx** — State coordinator:
- Manages `role`, `prompt`, `selectedFiles`, `activeSpeaker`, `chatLog`, `accord`, `useMockMode`
- `runLiveSSENegotiation()` — Uploads files, opens EventSource to `/negotiate`, parses SSE events
- `runMockNegotiation()` — Pre-scripted 4-turn debate on `setInterval` (2.4s per turn)
- Auto-fallback: if SSE connection fails, automatically switches to mock mode
- `Ctrl+M` keyboard shortcut toggles mock mode

**Sidebar.jsx** — Tabbed control panel:
- **Setup tab**: FileManager, role input, proposal textarea, INITIATE DEBATE button
- **Dialogue tab**: Live streaming transcript with loading/empty/message states
- **History tab**: Opens stored MongoDB records
- Mock mode toggle in header
- Cyber-grid background pattern with cyan accent glow

**Scene.jsx** — 3D WebGL stage:
- React Three Fiber `<Canvas>` with fixed `PerspectiveCamera` at `[0, 3.5, 7.5]`
- `<Stars>` background (2500 count, radius 45)
- `ParticleField` — 350 ambient cyan particles with slow rotation (additive blending)
- Two `<AgentOrb>` instances at fixed positions: `[-2.5, 0.5, 0]` (proxy) and `[2.5, 0.5, 0]` (challenger)
- `<OrbitControls>` with manual zoom (no auto-rotate), clamped polar angle
- Dual directional lighting (white key + cyan fill)

**AgentOrb.jsx** — Animated agent sphere:
- Minimalist sphere (radius 0.32) with `MeshStandardMaterial` (subtle emissive glow)
- `WaveRing` component — Dual wavy glow rings that always face the camera:
  - 180-segment `BufferGeometry` with sine-wave deformation (primary + secondary waves)
  - 3 layered `lineLoop` meshes (sharp core, medium glow, outer soft glow)
  - Additive blending, opacity dampened in/out based on active state
  - Two rings offset by `Math.PI` for continuous visual movement
- Active state: subtle breathing scale (1.0 +/- 0.08), emissive intensity increase, rings appear
- Idle state: gentle floating sine wave, emissive fades to near-zero, rings fade out
- `Html` label from `@react-three/drei` — agent name + "Speaking" indicator

**DecisionLedger.jsx** — Golden accord modal:
- Two view modes: Executive Overview and Audit Transcript
- **Executive Overview**: Policy summary, stacked resource allocation bar chart, governance guarantees checklist, resilience score (progress bar), fairness score (progress bar), mini consensus trail
- **Audit Transcript**: Full dialogue log with turn numbers and color-coded speakers
- **PDF Export**: `jsPDF` generates a multi-page A4 document with header banner, scenario mandate, policy accord, metrics, and full transcript
- **MongoDB Auto-Save**: `POST` to `localhost:5000/api/history` with base64 PDF + metadata (auto-triggers on accord, also on manual download)
- **Copy to Clipboard**: Copies accord title, summary, and scores

**FileManager.jsx** — Document manager:
- Drag & drop upload zone
- Supports PDF, TXT, CSV, Excel, Word, JSON
- File list with search, size display, and type-specific icons
- Actions per file: View preview, Open in new tab, Share/copy link, Delete
- PDF viewer modal (inline `<object>` / `<iframe>`)
- Text file viewer modal with monospace pre-formatted display
- Toast notifications for upload/delete/share actions

---

## Features

- **3D WebGL Stage** — React Three Fiber with starfield, ambient particle cloud, and dual-agent orbs
- **Wavy Glow Rings** — Camera-facing animated rings with sine-wave deformation and additive blending
- **Real-Time SSE Streaming** — Backend streams debate turns to frontend with zero latency
- **Live Web Search** — Challenger uses Serper API to fact-check claims against real-world data
- **Multi-Format Document Upload** — PDF, TXT, CSV, Excel, Word, JSON with preview and sharing
- **Decision Ledger** — Full audit dashboard with resilience/fairness scores and allocation charts
- **PDF Export** — Professional A4 document generation via jsPDF with multi-page support
- **MongoDB Persistence** — Auto-saves accord PDFs to MongoDB history server
- **Mock Mode** — Pre-scripted debate for offline demos (Ctrl+M or sidebar toggle)
- **Auto-Fallback** — Automatically switches to mock mode if backend is unreachable
- **Tabbed Sidebar** — Setup, Dialogue, and History tabs in a cyber-themed control panel
- **Clipboard Copy** — One-click accord summary copy

---

## Tech Stack

### Backend
| Package | Version | Purpose |
|---------|---------|---------|
| Python | 3.10+ | Runtime |
| FastAPI | 0.115.6 | Web framework |
| Uvicorn | 0.34.0 | ASGI server |
| OpenAI SDK | >=1.58.0 | GPT-4o agent reasoning |
| httpx | >=0.28.0 | Async HTTP (Serper API) |
| PyPDF2 | >=3.0.0 | PDF text extraction |
| BeautifulSoup4 | >=4.12.0 | HTML parsing |
| python-dotenv | 1.0.1 | Environment management |

### Frontend
| Package | Version | Purpose |
|---------|---------|---------|
| React | 18 | UI framework |
| Vite | 5 | Build tool |
| Tailwind CSS | 4 | Utility-first CSS |
| React Three Fiber | 8 | React renderer for Three.js |
| @react-three/drei | 9 | R3F helpers (Html, Stars, OrbitControls) |
| three | 0.163 | 3D graphics library |
| axios | 1.x | HTTP client (uploads, MongoDB) |
| jsPDF | 4.x | PDF generation |
| lucide-react | 0.359 | Icon library |

---

## Troubleshooting

### Port 8000 Already in Use
```powershell
netstat -ano | findstr :8000
taskkill /F /PID <PID>
```

### Port 5173 Already in Use
```powershell
netstat -ano | findstr :5173
taskkill /F /PID <PID>
```

### Frontend Can't Connect to Backend
1. Ensure backend is running: `curl http://localhost:8000/health`
2. CORS is configured for `localhost:5173` in `main.py`
3. If backend is down, the app auto-falls back to mock mode

### API Key Errors
```
CRITICAL ERROR: OPENAI_API_KEY is missing in .env file.
```
- Ensure `backend/.env` exists with valid keys (no quotes around values)

### MongoDB History Not Saving
- Ensure MongoDB server is running: `cd db && node server.js`
- Check if port 5000 is available: `netstat -ano | findstr :5000`
- Verify MongoDB Atlas connection string in `db/.env`
- Check browser console for CORS or connection errors
- If server is not running, PDF download and clipboard copy still work

### MongoDB Connection Errors
```
Error: connect ECONNREFUSED 127.0.0.1:5000
```
- Start the MongoDB server: `cd db && node server.js`
- Expected output: "MongoDB History Server running on http://localhost:5000"

### MongoDB Atlas Configuration
1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a cluster and get your connection string
3. Edit `db/.env` and set:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/agentaccord?retryWrites=true&w=majority
   ```
4. Restart the MongoDB server

### Port 5000 Already in Use
```powershell
netstat -ano | findstr :5000
taskkill /F /PID <PID>
```

### 3D Stage Not Rendering
- Ensure WebGL is supported (try Chrome, Firefox, or Edge)
- Check browser console for errors (F12)
- Update graphics drivers if needed

### Build Fails with "jspdf" Missing
```powershell
cd frontend
npm install jspdf
```

---

## Development

### Backend with Auto-Reload
```powershell
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend with Hot Reload
```powershell
cd frontend
npm run dev
```

### Production Build
```powershell
cd frontend
npm run build
```
Output in `frontend/dist/`

### Test API Endpoints
```bash
# Health check
curl http://localhost:8000/health

# Upload a file
curl -X POST http://localhost:8000/upload -F "file=@test.txt"

# Start debate (SSE stream)
curl -N "http://localhost:8000/negotiate?role=CEO&prompt=Test&file_path=uploads/session_doc.txt"
```

---

## License

MIT
