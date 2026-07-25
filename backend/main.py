import os
import json
import asyncio
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from agents import extract_pdf_text, generate_agent_response, generate_challenger_response_with_search
from tasks import DEBATE_TASKS

app = FastAPI(title="AgentAccord v2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path(__file__).parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    ext = Path(file.filename).suffix.lower()
    if ext not in [".pdf", ".txt"]:
        raise HTTPException(status_code=400, detail="Only PDF and TXT files are accepted")
    
    file_path = UPLOAD_DIR / f"session_doc{ext}"
    
    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)
    
    return {"status": "ready", "path": str(file_path), "filename": file.filename}

@app.get("/negotiate")
async def negotiate(
    role: str = Query(..., description="User's role (e.g., 'CEO of Apex Labs')"),
    prompt: str = Query(..., description="The proposal to debate"),
    file_path: str = Query(..., description="Path to uploaded document")
):
    doc_path = Path(file_path)
    if not doc_path.exists():
        raise HTTPException(status_code=404, detail="Document not found")
    
    document_text = extract_pdf_text(str(doc_path))
    if not document_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from document")
    
    async def event_stream():
        conversation_history = []
        
        for task in DEBATE_TASKS:
            speaker = task["speaker"]
            task_desc = task["description"]
            
            if speaker == "proxy":
                response_text = await generate_agent_response(
                    "proxy", role, document_text, prompt, conversation_history, task_desc
                )
            else:
                response_text, search_results = await generate_challenger_response_with_search(
                    role, document_text, prompt, conversation_history, task_desc
                )
            
            event_data = {
                "type": "turn",
                "speaker": speaker,
                "name": task["name"],
                "color": task["color"],
                "text": response_text
            }
            
            yield f"data: {json.dumps(event_data)}\n\n"
            
            conversation_history.append({
                "role": "assistant",
                "content": f"[{task['name']}]: {response_text}"
            })
            
            await asyncio.sleep(0.5)
        
        accord_event = {
            "type": "accord",
            "title": "Egalitarian Policy Accord v1.0",
            "summary": conversation_history[-1]["content"] if conversation_history else "Accord reached."
        }
        yield f"data: {json.dumps(accord_event)}\n\n"
    
    return StreamingResponse(event_stream(), media_type="text/event-stream")

@app.get("/health")
async def health_check():
    return {"status": "ok", "version": "2.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
