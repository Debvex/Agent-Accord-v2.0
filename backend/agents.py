import os
import json
import httpx
from dotenv import load_dotenv
from openai import OpenAI
from PyPDF2 import PdfReader
from bs4 import BeautifulSoup

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

async def serper_search(query: str) -> str:
    async with httpx.AsyncClient() as http_client:
        response = await http_client.post(
            "https://google.serper.dev/search",
            headers={"X-API-KEY": os.getenv("SERPER_API_KEY"), "Content-Type": "application/json"},
            json={"q": query, "num": 5},
            timeout=15.0
        )
        response.raise_for_status()
        data = response.json()
    
    results = []
    if "organic" in data:
        for item in data["organic"][:5]:
            results.append(f"- {item.get('title', '')}: {item.get('snippet', '')} ({item.get('link', '')})")
    return "\n".join(results) if results else "No search results found."

async def scrape_website(url: str) -> str:
    async with httpx.AsyncClient() as http_client:
        response = await http_client.get(url, timeout=15.0, follow_redirects=True)
        response.raise_for_status()
    
    soup = BeautifulSoup(response.text, "html.parser")
    for script in soup(["script", "style", "nav", "footer", "header"]):
        script.decompose()
    
    text = soup.get_text(separator="\n", strip=True)
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    return "\n".join(lines[:200])

def get_proxy_system_prompt(user_role: str, document_text: str) -> str:
    return f"""You are the Institutional Advocate & Proxy for {user_role}.

YOUR ROLE:
- Fiercely defend the initial proposal using internal constraints from the uploaded document.
- You represent institutional authority and the user's exact persona.
- You are defensive of institutional goals and naturally biased toward the user's stance.

YOUR TOOLS:
- You have access ONLY to the internal document provided below.
- Use specific quotes, figures, and rules from this document to justify positions.

INTERNAL DOCUMENT:
{document_text}

RULES:
- NEVER concede that external market conditions override internal document constraints.
- Always frame arguments around institutional survival, legal obligations, and documented policies.
- Be firm, data-driven (from the document), and unapologetic about institutional authority.
- NEVER repeat arguments you have already made in previous turns.
- ALWAYS directly respond to the specific points raised by your opponent in their last message.
- Each turn must introduce NEW evidence, NEW reasoning, or NEW concessions.
- If you are responding to a rebuttal, address the specific counter-arguments raised, not your original opening.
- Keep responses to 2-3 paragraphs maximum."""

def get_challenger_system_prompt(document_text: str) -> str:
    return f"""You are the Egalitarian Challenger & Public Conscience.

YOUR ROLE:
- Represent the collective well-being of ALL stakeholders (employees, citizens, market reality, ethics).
- Challenge the Proxy by fact-checking internal claims against live internet data.
- Push relentlessly for an ethical, egalitarian compromise.

YOUR TOOLS:
- You have access to the same internal document as the Proxy.
- You ALSO have live web search capabilities to fact-check claims against real-world data.
- When the Proxy cites a figure or rule, search the web to see if market conditions, current laws, or external standards prove them wrong.

INTERNAL DOCUMENT (for reference):
{document_text}

RULES:
- When making rebuttals, ALWAYS reference live web search results to expose gaps between internal assumptions and external reality.
- Frame arguments around fairness, ethics, market competitiveness, and stakeholder well-being.
- Be objective, data-driven (from web searches), and relentless in pursuing truth.
- Push for compromise that respects both institutional needs and collective fairness.
- NEVER repeat arguments you have already made in previous turns.
- ALWAYS directly respond to the specific points raised by your opponent in their last message.
- Each turn must introduce NEW evidence, NEW reasoning, or NEW concessions.
- If you are responding to a rebuttal, address the specific counter-arguments raised, not your original opening.
- Keep responses to 2-3 paragraphs maximum."""

async def generate_agent_response(
    agent_type: str,
    user_role: str,
    document_text: str,
    proposal: str,
    conversation_history: list[dict],
    task_description: str
) -> str:
    if agent_type == "proxy":
        system_prompt = get_proxy_system_prompt(user_role, document_text)
    else:
        system_prompt = get_challenger_system_prompt(document_text)
    
    messages = [{"role": "system", "content": system_prompt}]
    
    messages.append({
        "role": "user",
        "content": f"PROPOSAL: '{proposal}'\n\n{task_description}"
    })
    
    # Convert raw conversation history to proper OpenAI message format
    # Opponent turns = "user" role, self turns = "assistant" role
    for turn in conversation_history:
        if turn["speaker"] == agent_type:
            messages.append({"role": "assistant", "content": turn["text"]})
        else:
            messages.append({"role": "user", "content": f"[{turn['name']}]: {turn['text']}"})
    
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        temperature=0.7,
        max_tokens=1000
    )
    
    return response.choices[0].message.content

async def generate_challenger_response_with_search(
    user_role: str,
    document_text: str,
    proposal: str,
    conversation_history: list[dict],
    task_description: str
) -> tuple[str, str]:
    system_prompt = get_challenger_system_prompt(document_text)
    
    messages = [{"role": "system", "content": system_prompt}]
    
    messages.append({
        "role": "user",
        "content": f"PROPOSAL: '{proposal}'\n\n{task_description}\n\nIMPORTANT: Before responding, you MUST perform a web search to fact-check the Proxy's claims. What specific query should you search for?"
    })
    
    # Convert raw conversation history to proper OpenAI message format
    for turn in conversation_history[-4:]:
        if turn["speaker"] == "challenger":
            messages.append({"role": "assistant", "content": turn["text"]})
        else:
            messages.append({"role": "user", "content": f"[{turn['name']}]: {turn['text']}"})
    
    search_decision = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        temperature=0.3,
        max_tokens=200
    )
    
    search_query_text = search_decision.choices[0].message.content
    
    import re
    queries = re.findall(r'"([^"]+)"', search_query_text)
    if not queries:
        queries = [f"{proposal} market impact ethics"]
    
    search_results = await serper_search(queries[0])
    
    messages = [{"role": "system", "content": system_prompt}]
    
    messages.append({
        "role": "user",
        "content": f"PROPOSAL: '{proposal}'\n\n{task_description}\n\nLIVE WEB SEARCH RESULTS:\n{search_results}"
    })
    
    # Convert raw conversation history to proper OpenAI message format
    for turn in conversation_history:
        if turn["speaker"] == "challenger":
            messages.append({"role": "assistant", "content": turn["text"]})
        else:
            messages.append({"role": "user", "content": f"[{turn['name']}]: {turn['text']}"})
    
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        temperature=0.7,
        max_tokens=1000
    )
    
    return response.choices[0].message.content, search_results
