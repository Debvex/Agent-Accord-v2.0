import os
from typing import List, Dict
from pathlib import Path
from dotenv import load_dotenv
from openai import OpenAI


env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)


client = OpenAI()


def summarize_messages(messages: List[Dict[str, str]]) -> str:
    if not messages:
        return ""
    
    conversation_text = "\n".join([f"{m['role']}: {m['content']}" for m in messages])
    
    prompt = f"""Summarize the following debate conversation concisely, preserving key arguments, concessions, and points of contention:

{conversation_text}

Provide a clear summary that captures the essential points without losing important context:"""
    
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=500
    )
    
    return response.choices[0].message.content


def should_summarize(messages: List[Dict[str, str]], threshold: int = 8) -> bool:
    return len(messages) > threshold


def compress_history(messages: List[Dict[str, str]], threshold: int = 8) -> List[Dict[str, str]]:
    if not should_summarize(messages, threshold):
        return messages
    
    older_messages = messages[:-4]
    recent_messages = messages[-4:]
    
    summary = summarize_messages(older_messages)
    
    compressed = [{"role": "system", "content": f"Previous conversation summary:\n{summary}"}]
    compressed.extend(recent_messages)
    
    return compressed
