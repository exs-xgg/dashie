from typing import List, Dict, Any, Optional
import asyncio
from mcp import StdioServerParameters
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain_mcp_adapters.tools import load_mcp_tools
import os

class MCPService:
    def __init__(self):
        self.clients: Dict[str, MultiServerMCPClient] = {}

    async def get_tools_for_datasource(self, datasource_id: str, connection_uri: str) -> List[Any]:
        # Build stdio server parameters for the official @modelcontextprotocol/server-postgres
        server_params = StdioServerParameters(
            command="npx",
            args=["-y", "@modelcontextprotocol/server-postgres", connection_uri],
            env=os.environ.copy()
        )
        
        # Connect and load tools using langchain_mcp_adapters
        # Note: In a real app, you might want to cache these or manage the lifecycle better
        client = MultiServerMCPClient({datasource_id: server_params})
        await client.__aenter__()
        self.clients[datasource_id] = client
        
        tools = await load_mcp_tools(client)
        return tools

    async def cleanup(self):
        for client in self.clients.values():
            await client.__aexit__(None, None, None)
        self.clients.clear()

mcp_service = MCPService()
