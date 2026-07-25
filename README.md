# AgentAccord v2.0 — The Sentient 1v1 Dialectic Engine

An autonomous AI governance platform where two AI agents debate high-stakes proposals in a live 3D WebGL environment. One agent defends institutional authority using internal documents; the other challenges with live web search and ethical reasoning. They debate until reaching an egalitarian compromise.

---

## Prerequisites

### Required Software
- **Python 3.10+** (tested on 3.14.6)
- **Node.js 18+** (tested on 24.18.0)
- **npm 9+** (tested on 12.0.1)

### API Keys (for Live Mode)
- **OpenAI API Key** — Powers GPT-4o agent reasoning and document embeddings
  - Get one: https://platform.openai.com/api-keys
- **Serper API Key** — Powers live Google Search for fact-checking
  - Get one: https://serper.dev/ (free tier available)

---

## Installation

### 1. Clone or Download the Project
```powershell
cd "C:\Users\settd\OneDrive\Desktop\Projects"
# If cloning from git:
# git clone <repository-url>
cd "Agent Accord-v2.0"
```

### 2. Backend Setup

#### Install Python Dependencies
```powershell
cd backend
pip install -r requirements.txt
```

This installs:
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
# Copy the example file
copy .env.example .env

# Edit .env and add your API keys
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

This installs:
- **React 19** — UI framework
- **Vite 8** — Build tool
- **Tailwind CSS 4** — Utility-first CSS
- **React Three Fiber** — React renderer for Three.js
- **@react-three/drei** — Helpers for R3F
- **three** — 3D graphics library
- **lucide-react** — Icon library

---

## Running the Application

You need **two terminals** — one for backend, one for frontend.

### Terminal 1: Start Backend
```powershell
cd "C:\Users\settd\OneDrive\Desktop\Projects\Agent Accord-v2.0\backend"
python main.py
```

Expected output:
```
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

Verify backend is running:
```powershell
# In a new terminal or browser
curl http://localhost:8000/health
# Should return: {"status":"ok","version":"2.0"}
```

### Terminal 2: Start Frontend
```powershell
cd "C:\Users\settd\OneDrive\Desktop\Projects\Agent Accord-v2.0\frontend"
npm run dev
```

Expected output:
```
  VITE v8.1.5  ready in 333 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Open your browser: **http://localhost:5173**

---

## Usage

### Mock Mode (Offline Demo — No API Credits Required)

Perfect for hackathon demos or when API credits are exhausted.

1. **Open the app**: http://localhost:5173
2. **Enable Mock Mode**: Press `Ctrl+M` (you'll see "Mock Mode Active" indicator)
3. **Enter your role**: e.g., "CEO of Apex Labs" or "Mayor of New York"
4. **Enter your proposal**: e.g., "Cut R&D by 20% immediately"
5. **File upload is optional** in mock mode
6. **Click "INITIATE DEBATE"**

**What happens**:
- A pre-scripted 4-turn debate plays automatically (4 seconds per turn)
- **Blue orb** (Institutional Advocate) defends the proposal using "internal document" quotes
- **Green orb** (Egalitarian Conscience) challenges with "web search" data and ethical arguments
- Both orbs animate: scale up, pulse, and glow when speaking
- After 4 turns, orbs merge into a **gold sphere**
- **Accord Ledger** modal appears showing the final compromise

### Live Mode (Real AI Debate — Requires API Credits)

For actual AI-powered debates with real-time web search.

1. **Ensure API keys are set** in `backend/.env`:
   ```env
   OPENAI_API_KEY=sk-proj-...
   SERPER_API_KEY=...
   ```

2. **Upload a document**: Drag & drop a PDF or TXT file containing context for your proposal
   - Example: Financial reports, policy documents, strategic plans
   - The system extracts text and uses it as the "internal document"

3. **Enter your role**: Your institutional position (e.g., "CFO of TechCorp")

4. **Enter your proposal**: The controversial decision to debate

5. **Click "INITIATE DEBATE"**

**What happens**:
- Backend extracts text from your uploaded document
- **Turn 1**: Proxy agent defends proposal using document quotes (GPT-4o)
- **Turn 2**: Challenger agent performs live Serper web search, fact-checks claims, rebuts with external data
- **Turn 3**: Proxy responds, defends non-negotiable points, offers concession
- **Turn 4**: Challenger synthesizes debate into final Egalitarian Accord
- All turns stream in real-time via Server-Sent Events (SSE)
- 3D orbs animate as each agent speaks
- Final accord displayed in gold ledger

---

## API Endpoints

### Backend API (http://localhost:8000)

#### `POST /upload`
Upload a document for the debate.

**Request**:
```bash
curl -X POST http://localhost:8000/upload \
  -F "file=@/path/to/document.pdf"
```

**Response**:
```json
{
  "status": "ready",
  "path": "C:\\...\\backend\\uploads\\session_doc.pdf",
  "filename": "document.pdf"
}
```

#### `GET /negotiate`
Start the debate (SSE stream).

**Query Parameters**:
- `role` (string): User's role (e.g., "CEO of Apex Labs")
- `prompt` (string): The proposal to debate
- `file_path` (string): Path to uploaded document

**Example**:
```bash
curl -N "http://localhost:8000/negotiate?role=CEO&prompt=Cut%20R%26D&file_path=uploads/session_doc.pdf"
```

**SSE Events**:
```
data: {"type": "turn", "speaker": "proxy", "name": "Institutional Advocate", "color": "#3b82f6", "text": "..."}

data: {"type": "turn", "speaker": "challenger", "name": "Egalitarian Conscience", "color": "#10b981", "text": "..."}

data: {"type": "accord", "title": "Egalitarian Policy Accord v1.0", "summary": "..."}
```

#### `GET /health`
Health check endpoint.

**Response**:
```json
{
  "status": "ok",
  "version": "2.0"
}
```

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
│   ├── agents.py                # OpenAI agent engine + Serper search
│   ├── tasks.py                 # 4-turn debate task definitions
│   └── main.py                  # FastAPI server with SSE streaming
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── SetupModal.jsx       # File upload + role/prompt form
    │   │   ├── Stage3D.jsx          # R3F canvas with 3D scene
    │   │   ├── AgentOrb.jsx         # Animated orb (pulse/scale/glow)
    │   │   ├── LiveTranscript.jsx   # Scrolling debate log
    │   │   └── AccordLedger.jsx     # Gold compromise overlay
    │   ├── App.jsx                  # Main app state machine
    │   ├── mockData.js              # Pre-scripted debate for offline demo
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
- `serper_search()` — Async Serper API calls for live web search
- `scrape_website()` — Web page content extraction
- `generate_agent_response()` — OpenAI GPT-4o chat completions
- `generate_challenger_response_with_search()` — Challenger with mandatory web search

**tasks.py** — Debate structure:
- Defines 4 sequential debate turns
- Each turn has speaker, description, and expected output
- Turn 1: Proxy opening thesis (document-based)
- Turn 2: Challenger rebuttal (web search + document)
- Turn 3: Proxy defense + concession
- Turn 4: Challenger synthesis (final accord)

**main.py** — FastAPI server:
- CORS middleware (allows localhost:5173)
- `POST /upload` — File upload handler
- `GET /negotiate` — SSE streaming endpoint
- Runs debate loop, emits JSON events per turn

### Frontend (React + Three.js)

**App.jsx** — State machine:
- Phases: `setup` → `debate` → `accord`
- Manages SSE connection to backend
- Handles mock mode (Ctrl+M toggle)
- Coordinates 3D stage + transcript + ledger

**Stage3D.jsx** — 3D scene:
- React Three Fiber `<Canvas>`
- Dark void with stars (`<Stars>`)
- Floating platform with glowing ring
- Two `<AgentOrb>` instances (left/right)
- `<OrbitControls>` with auto-rotation

**AgentOrb.jsx** — Animated sphere:
- Icosahedron geometry with emissive material
- Outer glow sphere (transparent)
- Point light for dynamic illumination
- `useFrame` animation:
  - Scale: 1.3x when active, 0.85x when idle
  - Emissive intensity pulses when speaking
  - Light intensity spikes to 5.0 when active
  - Floating motion (sine wave on Y-axis)
  - Merges to center + gold color on accord

**LiveTranscript.jsx** — Debate log:
- Scrolling sidebar with color-coded entries
- Auto-scrolls to latest turn
- Shows speaker name, color, timestamp, text

**AccordLedger.jsx** — Final overlay:
- Glassmorphism modal with gold accent
- Displays accord title + summary
- Metrics: 4 turns, 2 agents, 1 accord
- "ACKNOWLEDGE ACCORD" button

**mockData.js** — Offline demo:
- Pre-scripted 4-turn debate
- Realistic content about R&D budget cuts
- Final accord with specific terms
- Plays automatically in mock mode

---

## Troubleshooting

### Port 8000 Already in Use
```powershell
# Find the process using port 8000
netstat -ano | findstr :8000

# Kill the process (replace <PID> with the actual PID)
taskkill /F /PID <PID>
```

### Port 5173 Already in Use
```powershell
# Find the process using port 5173
netstat -ano | findstr :5173

# Kill the process
taskkill /F /PID <PID>
```

### Frontend Can't Connect to Backend
1. Ensure backend is running on port 8000:
   ```powershell
   curl http://localhost:8000/health
   ```
2. Check CORS settings in `backend/main.py` (already configured for localhost:5173)
3. Verify no firewall is blocking the connection

### API Key Errors
```
CRITICAL ERROR: OPENAI_API_KEY is missing in .env file.
```
- Ensure `backend/.env` exists and contains valid keys
- Check for typos in the key names
- Verify keys are not wrapped in quotes

### Document Upload Fails
- Only PDF and TXT files are supported
- Ensure file is not corrupted
- Check file size (no hard limit, but very large files may timeout)

### Mock Mode Not Working
- Press `Ctrl+M` to toggle (case-sensitive)
- Look for "Mock Mode Active" indicator in bottom-left of setup modal
- File upload is optional in mock mode
- Mock mode bypasses backend entirely

### 3D Stage Not Rendering
- Ensure WebGL is supported in your browser
- Try Chrome, Firefox, or Edge (Safari may have issues)
- Check browser console for errors (F12 → Console)
- Update graphics drivers if needed

### SSE Connection Drops
- Check backend logs for errors
- Ensure API keys are valid (if in live mode)
- Verify network stability
- Refresh the page and restart the debate

---

## Development

### Backend Development

#### Run with Auto-Reload
```powershell
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Test API Endpoints
```powershell
# Health check
curl http://localhost:8000/health

# Upload a file
curl -X POST http://localhost:8000/upload -F "file=@test.txt"

# Start debate (SSE stream)
curl -N "http://localhost:8000/negotiate?role=CEO&prompt=Test&file_path=uploads/session_doc.txt"
```

### Frontend Development

#### Run Dev Server with Hot Reload
```powershell
cd frontend
npm run dev
```

#### Build for Production
```powershell
cd frontend
npm run build
```

Output will be in `frontend/dist/`

#### Preview Production Build
```powershell
cd frontend
npm run preview
```

---

## Features

✅ **3D WebGL Stage** — React Three Fiber with atmospheric void, stars, and floating platform  
✅ **Two Animated Orbs** — Blue (proxy) and green (challenger) with pulse/scale/glow effects  
✅ **Real-Time SSE Streaming** — Backend streams debate turns to frontend instantly  
✅ **Live Web Search** — Challenger uses Serper API to fact-check claims against real-world data  
✅ **PDF/TXT Ingestion** — Upload internal documents for RAG-style context  
✅ **Mock Mode** — Pre-scripted debate for offline demos (Ctrl+M)  
✅ **Gold Merge Animation** — Orbs merge into gold sphere on accord  
✅ **Glassmorphism UI** — Modern dark-mode design with Tailwind CSS  
✅ **Auto-Rotating Camera** — Cinematic orbit controls for hands-free viewing  
✅ **Live Transcript** — Color-coded scrolling log of debate turns  
✅ **Accord Ledger** — Final compromise overlay with metrics  

---

## Tech Stack

### Backend
- **Python 3.10+**
- **FastAPI** — Web framework
- **Uvicorn** — ASGI server
- **OpenAI API** — GPT-4o agent reasoning
- **Serper API** — Live Google Search
- **httpx** — Async HTTP client
- **PyPDF2** — PDF text extraction
- **BeautifulSoup4** — HTML parsing
- **python-dotenv** — Environment management

### Frontend
- **React 19** — UI framework
- **Vite 8** — Build tool
- **Tailwind CSS 4** — Utility-first CSS
- **React Three Fiber** — React renderer for Three.js
- **@react-three/drei** — R3F helpers
- **three** — 3D graphics library
- **lucide-react** — Icon library

---

## Credits

Built for hackathon demos. Mock mode ensures flawless presentation even without API credits.

---

## License

MIT License — Use freely for demos, hackathons, and learning.

---

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review backend/frontend logs for errors
3. Verify API keys are valid (if using live mode)
4. Test mock mode first to isolate frontend vs backend issues

---

**Ready to demo?** Start both servers and open http://localhost:5173 🚀
