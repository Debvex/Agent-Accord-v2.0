import os
import json
import asyncio
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from agents import extract_pdf_text, run_debate_with_agents

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
    file_path: str = Query(None, description="Path to uploaded document (optional)")
):
    document_text = ""
    
    if file_path:
        doc_path = Path(file_path)
        if doc_path.exists():
            document_text = extract_pdf_text(str(doc_path))
    
    if not document_text.strip():
        document_text = "No internal document provided. The debate will proceed based on general knowledge and the proposal alone."
    
    async def event_stream():
        async for event in run_debate_with_agents(prompt, role, document_text):
            yield f"data: {json.dumps(event)}\n\n"
            await asyncio.sleep(0.5)
    
    return StreamingResponse(event_stream(), media_type="text/event-stream")

@app.get("/health")
async def health_check():
    return {"status": "ok", "version": "2.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
