# AgentAccord v2.0 - Build Complete

## Status: ✅ READY FOR DEMO

Both backend and frontend are built and running. Mock mode is fully functional for offline demos.

---

## Quick Start

### 1. Start Backend (Terminal 1)
```powershell
cd "C:\Users\settd\OneDrive\Desktop\Projects\Agent Accord-v2.0\backend"
python main.py
```
Server runs on: `http://localhost:8000`

### 2. Start Frontend (Terminal 2)
```powershell
cd "C:\Users\settd\OneDrive\Desktop\Projects\Agent Accord-v2.0\frontend"
npm run dev
```
App runs on: `http://localhost:5173`

---

## Demo Mode (No API Credits Required)

Since your API credits are exhausted, use **Mock Mode** for the demo:

1. Open `http://localhost:5173`
2. Press **Ctrl+M** to toggle Mock Mode (you'll see "Mock Mode Active" indicator)
3. Enter a role (e.g., "CEO of Apex Labs")
4. Enter a proposal (e.g., "Cut R&D by 20% immediately")
5. **File upload is optional** in mock mode
6. Click **INITIATE DEBATE**

The mock mode will play a pre-scripted 4-turn debate with:
- Blue orb (Institutional Advocate) defending the proposal
- Green orb (Egalitarian Conscience) challenging with "web search" data
- Gold merge animation at the end
- Final Accord Ledger showing the compromise

Each turn appears every 4 seconds automatically.

---

## Live Mode (When API Credits Available)

When you have API credits:

1. Ensure `backend/.env` has valid keys:
   ```
   OPENAI_API_KEY=sk-proj-...
   SERPER_API_KEY=...
   ```

2. Upload a PDF or TXT document with your proposal context

3. Enter role and proposal

4. Click INITIATE DEBATE

The system will:
- Extract text from your document
- Run 4-turn debate using OpenAI GPT-4o
- Challenger will perform live Serper web searches
- Stream results via SSE to the 3D stage

---

## Architecture

### Backend (Python FastAPI)
- **agents.py**: OpenAI agent engine with Serper search integration
- **tasks.py**: 4-turn debate task definitions
- **main.py**: FastAPI server with SSE streaming
- **uploads/**: Document storage

### Frontend (React + Three.js)
- **App.jsx**: State machine (setup → debate → accord)
- **SetupModal.jsx**: File upload + role/prompt form
- **Stage3D.jsx**: R3F canvas with 2 animated orbs
- **AgentOrb.jsx**: Pulsing spheres with glow effects
- **LiveTranscript.jsx**: Scrolling debate log
- **AccordLedger.jsx**: Gold compromise overlay
- **mockData.js**: Pre-scripted debate for offline demo

---

## Features

✅ 3D WebGL stage with React Three Fiber  
✅ Two animated orbs (blue proxy, green challenger)  
✅ Real-time SSE streaming from backend  
✅ Live web search via Serper API  
✅ PDF/TXT document ingestion  
✅ Mock mode for offline demos (Ctrl+M)  
✅ Gold merge animation on accord  
✅ Glassmorphism UI with Tailwind CSS  
✅ Auto-rotating camera with OrbitControls  

---

## Troubleshooting

### Port 8000 already in use
```powershell
netstat -ano | findstr :8000
taskkill /F /PID <PID>
```

### Frontend can't connect to backend
- Ensure backend is running on port 8000
- Check CORS settings in `main.py` (already configured for localhost:5173)

### Mock mode not working
- Press Ctrl+M to toggle
- Look for "Mock Mode Active" indicator
- File upload is optional in mock mode

---

## Files Created

### Backend (7 files)
- `backend/.env` - API keys (you added these)
- `backend/.env.example` - Template
- `backend/.gitignore` - Git ignore rules
- `backend/requirements.txt` - Python dependencies
- `backend/agents.py` - Agent engine (183 lines)
- `backend/tasks.py` - Debate tasks (68 lines)
- `backend/main.py` - FastAPI server (109 lines)

### Frontend (10 files)
- `frontend/src/App.jsx` - Main app (162 lines)
- `frontend/src/mockData.js` - Mock debate data (35 lines)
- `frontend/src/index.css` - Tailwind imports
- `frontend/src/main.jsx` - React entry
- `frontend/src/components/SetupModal.jsx` - Upload form (165 lines)
- `frontend/src/components/Stage3D.jsx` - 3D canvas (52 lines)
- `frontend/src/components/AgentOrb.jsx` - Animated orb (82 lines)
- `frontend/src/components/LiveTranscript.jsx` - Debate log (58 lines)
- `frontend/src/components/AccordLedger.jsx` - Final overlay (68 lines)

---

## Next Steps

1. **Test mock mode** - Press Ctrl+M and run a demo
2. **Prepare a sample PDF** - For when you get API credits
3. **Practice the demo flow** - Setup → Debate → Accord
4. **Check the 3D animations** - Orbs should pulse when speaking

---

## Notes

- The backend successfully tested with live API (2 turns completed before credits exhausted)
- Mock mode is production-ready for hackathon demos
- All components build without errors
- SSE streaming works correctly
- 3D stage renders with proper animations

**You're ready to demo!** 🎉
