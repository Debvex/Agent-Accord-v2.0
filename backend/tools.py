import os
import httpx
from typing import List
from langchain_core.tools import tool
from rag import rag_instance


@tool
def document_search(query: str) -> str:
    """Search the internal document for relevant information using semantic search.
    Use this to find specific sections, rules, budgets, or constraints from the uploaded document.
    
    Args:
        query: The search query to find relevant document sections
    """
    docs = rag_instance.search(query, k=3)
    if not docs:
        return "No relevant information found in the document."
    
    results = []
    for i, doc in enumerate(docs, 1):
        results.append(f"[Chunk {i}]\n{doc.page_content}")
    
    return "\n\n".join(results)


@tool
async def web_search(query: str) -> str:
    """Search the live internet for current information, market data, ethics guidelines, or real-world statistics.
    Use this to fact-check claims against external reality and find contradicting evidence.
    
    Args:
        query: The search query for web search
    """
    serper_api_key = os.getenv("SERPER_API_KEY")
    if not serper_api_key:
        return "Web search unavailable: SERPER_API_KEY not configured."
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://google.serper.dev/search",
                headers={"X-API-KEY": serper_api_key, "Content-Type": "application/json"},
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
    except Exception as e:
        return f"Web search failed: {str(e)}"
