from typing import List, Dict, Any, Optional, TypedDict, Annotated
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.prebuilt import create_react_agent
from langgraph.graph import StateGraph, START, END, MessagesState
from langchain_core.messages import SystemMessage, HumanMessage
from services.mcp_service import mcp_service
from config import get_settings
import os

# State definition
class AgentState(MessagesState):
    datasource_id: str
    connection_uri: str
    manifest: Optional[str] = None # Stringified context for LLM

class AgentService:
    def __init__(self):
        settings = get_settings()
        self.llm = ChatGoogleGenerativeAI(
            model=settings.llm_model,
            google_api_key=settings.google_api_key
        )

    async def get_agent_for_datasource(self, datasource_id: str, connection_uri: str):
        # Dynamically load tools via MCP for this specific datasource
        tools = await mcp_service.get_tools_for_datasource(datasource_id, connection_uri)
        
        # Create a prebuilt ReAct agent for tool invocation
        return create_react_agent(self.llm, tools)

    async def run_query(self, datasource_id: str, connection_uri: str, prompt: str, schema_context: str):
        agent = await self.get_agent_for_datasource(datasource_id, connection_uri)
        
        system_prompt = f"""
        You are a highly skilled SQL analyst for Architect AI.
        Your goal is to answer the user's natural language question by:
        1. Using available database tools to inspect schema if not provided.
        2. Generating a query using standard PostgreSQL.
        3. ALWAYS use a `{{{{date_filter}}}}` placeholder in your WHERE clause if the user refers to a time period (e.g., "last month", "current year").
        4. Return a clear result JSON structure:
           {{
             "sql": "The raw PostgreSQL query text here...",
             "title": "A summary title for the chart/data...",
             "chart_type": "one of: bar, line, table"
           }}
        
        Here is the schema context learned so far:
        {schema_context}
        """
        
        # In a real app we would use more robust structured outputs, but let's use the react agent loop
        response = await agent.ainvoke({
            "messages": [
                SystemMessage(content=system_prompt),
                HumanMessage(content=prompt)
            ]
        })
        
        # Return the last response from the agent
        return response["messages"][-1].content

    async def scan_schema(self, datasource_id: str, connection_uri: str):
        """
        Specialized agent flow to crawl tables and columns to build the manifest.
        """
        agent = await self.get_agent_for_datasource(datasource_id, connection_uri)
        
        # Instruct the agent to systematically explore the database
        scan_prompt = "Perform a thorough scan of all tables and their column schemas. Return a structured list of table names and column details."
        
        response = await agent.ainvoke({"messages": [HumanMessage(content=scan_prompt)]})
        return response["messages"][-1].content

agent_service = AgentService()
