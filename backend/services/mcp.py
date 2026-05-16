import json
import logging
from contextlib import asynccontextmanager
from mcp import ClientSession
from mcp.client.streamable_http import streamable_http_client
from config import MCP_SERVER_URL

logger = logging.getLogger(__name__)

mcp_session: ClientSession | None = None
available_tools: list = []
print(mcp_session, available_tools)


@asynccontextmanager
async def lifespan(app):
    global mcp_session, available_tools
    try:
        async with streamable_http_client(url=MCP_SERVER_URL) as (read, write, _):
            async with ClientSession(read, write) as session:
                await session.initialize()
                mcp_session = session
                available_tools = (await session.list_tools()).tools
                app.state.tools = available_tools
                logger.info(json.dumps({"event": "mcp_connected", "tool_count": len(available_tools)}))
                yield
    except Exception as e:
        raise RuntimeError(f"Failed to connect to MCP server: {e}")
