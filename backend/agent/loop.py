import asyncio
import json
from typing import AsyncGenerator

from config import llm_client, MAX_ITERATIONS, MAX_HISTORY_MESSAGES, LLM_MODEL, logger
from agent.tools import format_tools, handle_tool_calls
from agent.prompt import build_system_message


def trim_history(history: list) -> list:
    return history[-MAX_HISTORY_MESSAGES:]


async def call_llm_with_retry(max_retries: int = 3, **kwargs):
    for attempt in range(max_retries):
        try:
            return await llm_client.chat.completions.create(**kwargs)
        except Exception as e:
            logger.error({"event": "llm_error", "attempt": attempt, "error": str(e)})
            is_rate_limit = "429" in str(e) or "rate" in str(e).lower()
            is_last_attempt = attempt == max_retries - 1
            if is_last_attempt or not is_rate_limit:
                raise
            wait = 2 ** attempt
            await asyncio.sleep(wait)


async def stream_agent(
    messages: list,
    tools: list,
    session: dict | None = None,
) -> AsyncGenerator[str, None]:
    if session is None:
        session = {}

    formatted_tools = format_tools(tools)
    all_messages = [build_system_message(session)] + trim_history(messages)

    for iteration_count in range(MAX_ITERATIONS):
        finish_reason = None

        stream = await call_llm_with_retry(
            model=LLM_MODEL,
            messages=all_messages,
            tools=formatted_tools,
            stream=True,
        )

        tool_calls_by_index: dict[int, dict] = {}
        async for chunk in stream:
            choice = chunk.choices[0]
            finish_reason = choice.finish_reason or finish_reason
            delta = choice.delta

            if delta.content:
                yield f"data: {json.dumps({'chunk': delta.content})}\n\n"

            if delta.tool_calls:
                for tc in delta.tool_calls:
                    entry = tool_calls_by_index.setdefault(tc.index, {"id": "", "name": "", "arguments": ""})
                    if tc.id:
                        entry["id"] = tc.id
                    if tc.function.name:
                        entry["name"] += tc.function.name
                    if tc.function.arguments:
                        entry["arguments"] += tc.function.arguments

        if finish_reason != "tool_calls":
            logger.info({
                "event": "request_complete",
                "session_id": session.get("customer_id"),
                "iterations": iteration_count + 1,
            })
            break

        for tc in tool_calls_by_index.values():
            yield f"data: {json.dumps({'tool_call': {'name': tc['name'], 'arguments': json.loads(tc['arguments'])}})}\n\n"

        assistant_message = {
            "role": "assistant",
            "tool_calls": [
                {"id": tc["id"], "type": "function", "function": {"name": tc["name"], "arguments": tc["arguments"]}}
                for tc in tool_calls_by_index.values()
            ],
        }

        results = await handle_tool_calls(list(tool_calls_by_index.values()), tools, session)
        all_messages.append(assistant_message)
        all_messages.extend(results)
    else:
        yield f"data: {json.dumps({'chunk': 'Sorry, I could not answer your question.'})}\n\n"
