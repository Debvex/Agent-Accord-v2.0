import os
import json
import httpx
from dotenv import load_dotenv
from openai import OpenAI
from PyPDF2 import PdfReader
from bs4 import BeautifulSoup

from rag import rag_instance
from agents_graph import run_debate

load_dotenv()

if not os.getenv("OPENAI_API_KEY"):
    raise ValueError("CRITICAL ERROR: OPENAI_API_KEY is missing in .env file.")
if not os.getenv("SERPER_API_KEY"):
    raise ValueError("CRITICAL ERROR: SERPER_API_KEY is missing in .env file.")

client = OpenAI()

def extract_pdf_text(file_path: str) -> str:
    ext = os.path.splitext(file_path)[1].lower()
    
    if ext == '.txt':
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    elif ext == '.pdf':
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    else:
        raise ValueError(f"Unsupported file type: {ext}")


async def run_debate_with_agents(proposal: str, user_role: str, document_text: str):
    if document_text.strip():
        rag_instance.ingest_document(document_text)
    
    async for event in run_debate(proposal, user_role, document_text):
        yield event
    
    rag_instance.clear()


async def generate_agent_response(
    agent_type: str,
    user_role: str,
    document_text: str,
    proposal: str,
    conversation_history: list[dict],
    task_description: str
) -> str:
    async for event in run_debate_with_agents(proposal, user_role, document_text):
        if event["type"] == "turn":
            return event["text"]
    return "No response generated."


async def generate_challenger_response_with_search(
    user_role: str,
    document_text: str,
    proposal: str,
    conversation_history: list[dict],
    task_description: str
) -> tuple[str, str]:
    async for event in run_debate_with_agents(proposal, user_role, document_text):
        if event["type"] == "turn" and event["speaker"] == "challenger":
            return event["text"], "Web search results integrated into response."
    return "No response generated.", ""
