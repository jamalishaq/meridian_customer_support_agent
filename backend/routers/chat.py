import json
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from config import logger
from models.schemas import ChatRequest
from services import mcp as mcp_service
from services.session import get_session, save_session
from agent.loop import stream_agent

router = APIRouter()


@router.post("/chat")
async def chat(request: ChatRequest):
    if mcp_service.mcp_session is None:
        raise HTTPException(status_code=503, detail="MCP server is unavailable")

    logger.info({"event": "request_start", "session_id": request.session_id, "message_len": len(request.message)})

    try:
        session = get_session(request.session_id)
        history = session["messages"]
        history.append({"role": "user", "content": request.message})

        accumulated: list[str] = []

        async def generate():
            async for chunk in stream_agent(messages=history, tools=mcp_service.available_tools, session=session):
                if chunk.startswith("data: "):
                    data = json.loads(chunk[6:])
                    if "chunk" in data:
                        accumulated.append(data["chunk"])
                yield chunk

            if request.session_id:
                history.append({"role": "assistant", "content": "".join(accumulated)})
                session["messages"] = history
                save_session(request.session_id, session)

        return StreamingResponse(generate(), media_type="text/event-stream")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/tools")
async def list_tools():
    return {"tools": mcp_service.available_tools}


@router.get("/health")
async def health():
    return {"status": "ok", "mcp_connected": mcp_service.mcp_session is not None}
