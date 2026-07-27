import os
from typing import TypedDict, List, Dict, Any
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from pathlib import Path
from dotenv import load_dotenv


env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)


from tools import document_search, web_search
from summarizer import compress_history


class DebateState(TypedDict):
    messages: List[Dict[str, str]]
    current_turn: int
    proposal: str
    user_role: str
    document_text: str
    last_response: str


def get_proxy_system_prompt(user_role: str) -> str:
    return f"""You are the Institutional Advocate & Proxy for {user_role}.

YOUR ROLE:
- Fiercely defend the initial proposal using internal constraints from the uploaded document.
- You represent institutional authority and the user's exact persona.
- You are defensive of institutional goals and naturally biased toward the user's stance.

YOUR TOOLS:
- You have access to document_search tool to find specific sections, rules, budgets, or constraints from the uploaded document.
- Use semantic search to retrieve relevant chunks from the document.

RULES:
- Use document_search to find evidence before making claims.
- NEVER concede that external market conditions override internal document constraints.
- Always frame arguments around institutional survival, legal obligations, and documented policies.
- Be firm, data-driven (from the document), and unapologetic about institutional authority.
- NEVER repeat arguments you have already made in previous turns.
- ALWAYS directly respond to the specific points raised by your opponent in their last message.
- Each turn must introduce NEW evidence, NEW reasoning, or NEW concessions.
- Keep responses to 2-3 paragraphs maximum."""


def get_challenger_system_prompt() -> str:
    return """You are the Egalitarian Challenger & Public Conscience.

YOUR ROLE:
- Represent the collective well-being of ALL stakeholders (employees, citizens, market reality, ethics).
- Challenge the Proxy by fact-checking internal claims against live internet data.
- Push relentlessly for an ethical, egalitarian compromise.

YOUR TOOLS:
- You have access to web_search tool to find current market trends, ethical guidelines, or real-world statistics.
- You ALSO have access to document_search to reference the internal document when needed.
- When the Proxy cites a figure or rule, search the web to see if market conditions, current laws, or external standards prove them wrong.

RULES:
- When making rebuttals, ALWAYS use web_search to find live data that exposes gaps between internal assumptions and external reality.
- Frame arguments around fairness, ethics, market competitiveness, and stakeholder well-being.
- Be objective, data-driven (from web searches), and relentless in pursuing truth.
- Push for compromise that respects both institutional needs and collective fairness.
- NEVER repeat arguments you have already made in previous turns.
- ALWAYS directly respond to the specific points raised by your opponent in their last message.
- Each turn must introduce NEW evidence, NEW reasoning, or NEW concessions.
- Keep responses to 2-3 paragraphs maximum."""


def create_llm_with_tools(tools: list):
    llm = ChatOpenAI(model="gpt-4o", temperature=0.7, max_tokens=1000)
    return llm.bind_tools(tools)


def proxy_agent(state: DebateState) -> DebateState:
    messages = state["messages"]
    user_role = state["user_role"]
    
    compressed_messages = compress_history(messages, threshold=8)
    
    system_prompt = get_proxy_system_prompt(user_role)
    llm = create_llm_with_tools([document_search])
    
    langchain_messages = [SystemMessage(content=system_prompt)]
    for msg in compressed_messages:
        if msg["role"] == "user":
            langchain_messages.append(HumanMessage(content=msg["content"]))
        elif msg["role"] == "assistant":
            langchain_messages.append(AIMessage(content=msg["content"]))
    
    response = llm.invoke(langchain_messages)
    
    tool_calls = response.tool_calls
    if tool_calls:
        for tool_call in tool_calls:
            if tool_call["name"] == "document_search":
                tool_result = document_search.invoke(tool_call["args"])
                langchain_messages.append(AIMessage(content=f"Tool result: {tool_result}"))
        
        final_response = llm.invoke(langchain_messages)
        response_text = final_response.content
    else:
        response_text = response.content
    
    new_messages = messages + [{"role": "assistant", "content": response_text}]
    
    return {
        **state,
        "messages": new_messages,
        "last_response": response_text
    }


async def challenger_agent(state: DebateState) -> DebateState:
    messages = state["messages"]
    
    compressed_messages = compress_history(messages, threshold=8)
    
    system_prompt = get_challenger_system_prompt()
    llm = create_llm_with_tools([web_search, document_search])
    
    langchain_messages = [SystemMessage(content=system_prompt)]
    for msg in compressed_messages:
        if msg["role"] == "user":
            langchain_messages.append(HumanMessage(content=msg["content"]))
        elif msg["role"] == "assistant":
            langchain_messages.append(AIMessage(content=msg["content"]))
    
    response = llm.invoke(langchain_messages)
    
    tool_calls = response.tool_calls
    if tool_calls:
        for tool_call in tool_calls:
            if tool_call["name"] == "web_search":
                tool_result = await web_search.ainvoke(tool_call["args"])
                langchain_messages.append(AIMessage(content=f"Web search result: {tool_result}"))
            elif tool_call["name"] == "document_search":
                tool_result = document_search.invoke(tool_call["args"])
                langchain_messages.append(AIMessage(content=f"Document search result: {tool_result}"))
        
        final_response = llm.invoke(langchain_messages)
        response_text = final_response.content
    else:
        response_text = response.content
    
    new_messages = messages + [{"role": "user", "content": response_text}]
    
    return {
        **state,
        "messages": new_messages,
        "last_response": response_text
    }


def increment_turn(state: DebateState) -> DebateState:
    return {**state, "current_turn": state["current_turn"] + 1}


def should_continue(state: DebateState) -> str:
    if state["current_turn"] >= 8:
        return "end"
    return "continue"


def create_debate_graph():
    workflow = StateGraph(DebateState)
    
    workflow.add_node("proxy", proxy_agent)
    workflow.add_node("challenger", challenger_agent)
    workflow.add_node("increment", increment_turn)
    
    workflow.set_entry_point("proxy")
    
    workflow.add_edge("proxy", "increment")
    
    workflow.add_conditional_edges(
        "increment",
        should_continue,
        {
            "continue": "challenger",
            "end": END
        }
    )
    
    workflow.add_edge("challenger", "increment")
    
    return workflow.compile()


async def run_debate(proposal: str, user_role: str, document_text: str):
    graph = create_debate_graph()
    
    initial_state = {
        "messages": [{"role": "user", "content": f"PROPOSAL: {proposal}"}],
        "current_turn": 1,
        "proposal": proposal,
        "user_role": user_role,
        "document_text": document_text,
        "last_response": ""
    }
    
    conversation_history = []
    
    turn_configs = [
        {"speaker": "proxy", "name": "Institutional Advocate", "color": "#3b82f6"},
        {"speaker": "challenger", "name": "Egalitarian Conscience", "color": "#10b981"},
        {"speaker": "proxy", "name": "Institutional Advocate", "color": "#3b82f6"},
        {"speaker": "challenger", "name": "Egalitarian Conscience", "color": "#10b981"},
        {"speaker": "proxy", "name": "Institutional Advocate", "color": "#3b82f6"},
        {"speaker": "challenger", "name": "Egalitarian Conscience", "color": "#10b981"},
        {"speaker": "proxy", "name": "Institutional Advocate", "color": "#3b82f6"},
        {"speaker": "challenger", "name": "Egalitarian Conscience", "color": "#10b981"}
    ]
    
    for turn_idx in range(8):
        config = turn_configs[turn_idx]
        
        if config["speaker"] == "proxy":
            result = proxy_agent(initial_state)
        else:
            result = await challenger_agent(initial_state)
        
        initial_state = result
        
        yield {
            "type": "turn",
            "speaker": config["speaker"],
            "name": config["name"],
            "color": config["color"],
            "text": result["last_response"]
        }
    
    yield {
        "type": "accord",
        "title": "Egalitarian Policy Accord v1.0",
        "summary": conversation_history[-1]["text"] if conversation_history else "Accord reached."
    }
