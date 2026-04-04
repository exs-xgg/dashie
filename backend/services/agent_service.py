from typing import List, Dict, Any, Optional, TypedDict, Annotated, Literal
from pydantic import BaseModel, Field
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.prebuilt import create_react_agent
from langgraph.graph import StateGraph, START, END, MessagesState
from langchain_core.messages import SystemMessage, HumanMessage
from services.mcp_service import mcp_service
from config import get_settings
from sqlalchemy import create_engine, text
import os

class ChartConfig(BaseModel):
    sql: str = Field(description="The raw SQL query text.")
    title: str = Field(description="A summary title for the chart/data.")
    chart_type: Literal["bar", "line", "area", "table", "pie", "stacked_bar", "stacked_area"] = Field(description="The type of chart to display.")
    xaxis_column: str = Field(description="The column name to use for the X-axis.")
    yaxis_columns: List[str] = Field(description="A list of column names to use for the Y-axis.")

# State definition
class AgentState(MessagesState):
    datasource_id: str
    connection_uri: str
    manifest: Optional[str] = None
    prompt: str
    preferred_chart_type: Optional[str] = None
    chart_config: Optional[ChartConfig] = None
    retries: int = 0
    max_retries: int = 3
    error_message: Optional[str] = None

class AgentService:
    def __init__(self):
        settings = get_settings()
        self.llm = ChatGoogleGenerativeAI(
            model=settings.llm_model,
            google_api_key=settings.google_api_key,
            temperature=0.0
        )
        self.structured_llm = self.llm.with_structured_output(ChartConfig)
        self.graph = self._build_graph()

    def _build_graph(self):
        builder = StateGraph(AgentState)
        
        builder.add_node("generate_sql", self._generate_sql_node)
        builder.add_node("validate_sql", self._validate_sql_node)
        
        builder.add_edge(START, "generate_sql")
        builder.add_edge("generate_sql", "validate_sql")
        
        def route_validation(state: AgentState):
            if state.get("error_message") and state.get("retries", 0) < state.get("max_retries", 3):
                return "generate_sql"
            return END
            
        builder.add_conditional_edges("validate_sql", route_validation)
        
        return builder.compile()

    async def _generate_sql_node(self, state: AgentState):
        dialect = state['connection_uri'].split(':')[0]
        system_prompt = f"""
        You are a highly skilled SQL analyst for dashie.
        Your goal is to answer the user's natural language question by:
        1. Generating a query using standard {dialect} SQL syntax.
        2. ALWAYS use a `{{{{date_filter:table_name.column_name}}}}` placeholder in your WHERE clause if the user refers to a time period. Examples: `WHERE {{{{date_filter:orders.created_at}}}}` or `WHERE {{{{date_filter:users.registered_on}}}}`. Determine the correct date column from the schema.
        IMPORTANT: If you use an alias for a table (e.g., `FROM orders o`), you MUST use the exact alias in the date_filter (e.g., `{{{{date_filter:o.created_at}}}}`).
        3. When grouping data over a date or time dimension (e.g., "by month", "daily", "per year"), NEVER use standard database functions like DATE_TRUNC or DATE_FORMAT. INSTEAD, ALWAYS use the `{{{{date_group:table_name.column_name}}}}` macro in your SELECT and GROUP BY clauses.
        4. Ensuring the query is valid and matches the provided schema context.
        """

        if state.get("preferred_chart_type") and state["preferred_chart_type"] != "auto":
            system_prompt += f"\n5. The user has explicitly requested to see this data as a {state['preferred_chart_type']} chart if possible. Strongly bias towards generating a ChartConfig with chart_type='{state['preferred_chart_type']}' and structuring the SQL query appropriately to support that format.\n"

        system_prompt += f"""
        Here is the schema context learned so far:
        {state.get('manifest', '')}
        """

        messages = [SystemMessage(content=system_prompt), HumanMessage(content=state['prompt'])]
        
        if state.get("error_message"):
            error_msg = f"Your previous SQL query failed with this database error:\n{state['error_message']}\n\nPlease correct the SQL query and ensure column names and syntax are valid."
            messages.append(HumanMessage(content=error_msg))

        config: ChartConfig = await self.structured_llm.ainvoke(messages)
        
        return {"chart_config": config, "retries": state.get("retries", 0) + 1}
        
    async def _validate_sql_node(self, state: AgentState):
        import asyncio
        import re
        config = state["chart_config"]
        # Replace date_filter placeholders with an actual evaluable condition for validation
        def replace_for_validation(match):
            col_name = match.group(1).strip()
            return f"({col_name} >= '1970-01-01')"
            
        test_sql = re.sub(r"\{\{date_filter:(.+?)\}\}", replace_for_validation, config.sql)
        test_sql = test_sql.replace("{{date_filter}}", "TRUE")
        
        # Also replace date_group for validation
        def replace_group_for_validation(match):
            col_name = match.group(1).strip()
            return col_name # Just use raw column for validation
            
        test_sql = re.sub(r"\{\{date_group:(.+?)\}\}", replace_group_for_validation, test_sql)
        
        def run_test():
            engine = create_engine(state["connection_uri"])
            with engine.connect() as conn:
                conn.execute(text(test_sql))

        try:
            # We want to test but limit rows to 1 to avoid heavy queries during validation
            if test_sql.strip().upper().startswith("SELECT"):
                test_sql = f"SELECT * FROM ({test_sql.rstrip(';')}) AS subquery LIMIT 1"
                
            await asyncio.to_thread(run_test)
            
            # Query is valid
            return {"error_message": None}
        except Exception as e:
            return {"error_message": str(e)}

    async def get_agent_for_datasource(self, datasource_id: str, connection_uri: str):
        # Dynamically load tools via MCP for this specific datasource
        tools = await mcp_service.get_tools_for_datasource(datasource_id, connection_uri)
        
        # Create a prebuilt ReAct agent for tool invocation
        return create_react_agent(self.llm, tools)

    async def run_query(self, datasource_id: str, connection_uri: str, prompt: str, schema_context: str, preferred_chart_type: Optional[str] = None) -> Dict[str, Any]:
        final_state = await self.graph.ainvoke({
            "datasource_id": datasource_id,
            "connection_uri": connection_uri,
            "manifest": schema_context,
            "prompt": prompt,
            "preferred_chart_type": preferred_chart_type,
            "retries": 0,
            "max_retries": 3,
            "error_message": None,
            "messages": []
        })
        
        config = final_state.get("chart_config")
        if final_state.get("error_message"):
            raise ValueError(f"Could not generate a valid SQL query. Last DB error: {final_state.get('error_message')}")
            
        if not config:
            raise ValueError("Failed to generate robust query configuration")
            
        return config.model_dump()

    async def fix_query(self, datasource_id: str, connection_uri: str, failing_sql: str, error_message: str, schema_context: str) -> Dict[str, Any]:
        """
        Specialized agent flow to fix a broken SQL query using the error message.
        """
        prompt = f"""The following SQL query failed with an error. Please fix it.
Failing SQL:
{failing_sql}

Error Message:
{error_message}

Ensure the fixed query matches the schema context and provides valid columns for visualization.
"""
        # We can reuse run_query by passing the "Fix" prompt as the main prompt
        return await self.run_query(datasource_id, connection_uri, prompt, schema_context)
    async def suggest_queries(self, datasource_id: str, connection_uri: str, schema_context: str) -> List[str]:
        """
        Specialized agent flow to suggest up to 3 insightful queries based on the database schema.
        """
        prompt = f"""Based on the following database schema, suggest up to 3 insightful natural language questions or report descriptions that a user might want to ask to visualize the data.
Keep them concise, practical, and highly relevant to the tables and columns provided.
Return the suggestions EXACTLY as a JSON array of strings. Do not include markdown formatting like ```json.

Schema Context:
{schema_context}
"""
        response = await self.llm.ainvoke([HumanMessage(content=prompt)])
        content = response.content
        
        if isinstance(content, list):
            content = "".join([c.get("text", "") if isinstance(c, dict) else str(c) for c in content])
        elif not isinstance(content, str):
            content = str(content)
            
        if content.startswith("```json"):
            content = content.replace("```json\n", "").replace("```", "").strip()
        elif content.startswith("```"):
            content = content.replace("```\n", "").replace("```", "").strip()
            
        import json
        try:
            suggestions = json.loads(content)
            if isinstance(suggestions, list):
                return suggestions[:3]
        except Exception:
            pass
            
        # Fallback if json parsing fails
        lines = [line.strip().lstrip("-*1234567890. ") for line in content.split('\n') if line.strip() and len(line) > 5]
        return lines[:3]

    async def scan_schema(self, datasource_id: str, connection_uri: str):
        """
        Specialized agent flow to crawl tables and columns to build the manifest.
        """
        agent = await self.get_agent_for_datasource(datasource_id, connection_uri)
        
        # Instruct the agent to systematically explore the database
        scan_prompt = """Perform a thorough scan of all tables and their column schemas. 
Also retrieve up to 3 sample rows from each table. 
Return your findings EXACTLY as a raw structured JSON array without markdown formatting or code blocks. Each object in the array MUST have:
- 'table_name' (string)
- 'columns' (list of objects with 'name' and 'type' strings)
- 'sample_rows' (list of objects representing rows, keys are columns)
"""
        
        response = await agent.ainvoke({"messages": [HumanMessage(content=scan_prompt)]})
        # Strip markdown in case it puts it
        content = response["messages"][-1].content
        if content.startswith("```json"):
            content = content.replace("```json\\n", "").replace("```", "").strip()
        elif content.startswith("```"):
            content = content.replace("```\\n", "").replace("```", "").strip()
            
        return content

agent_service = AgentService()
