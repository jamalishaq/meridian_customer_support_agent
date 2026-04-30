import json
import jsonschema
from config import logger
import services.mcp as mcp_service

def parse_customer_from_result(result: str) -> dict | None:
                try:
                    customer_id = None
                    customer_name = None
                    for line in result.splitlines():
                        if line.startswith("Customer ID:"):
                            customer_id = line.split(":", 1)[1].strip()
                        elif line.startswith("✓ Customer verified:"):
                            customer_name = line.split(":", 1)[1].strip()
                    if customer_id and customer_name:
                        return {"customer_id": customer_id, "customer_name": customer_name}
                    return None
                except Exception:
                    return None

def format_tools(tools: list) -> list:
    formatted = []
    for tool in tools:
        formatted.append({
            "type": "function",
            "function": {
                "name": tool.name,
                "description": tool.description,
                "parameters": {
                "type": tool.inputSchema.get("type", "object"),
                "properties": tool.inputSchema.get("properties", {}),
                "required": tool.inputSchema.get("required", []),
                "additionalProperties": tool.inputSchema.get("additionalProperties", False),},
            },
        })
    return formatted


async def handle_tool_calls(tool_calls: list[dict], tools: list, session: dict) -> list[dict]:
    valid_tool_names = {tool.name for tool in tools}
    results = []

    for tc in tool_calls:
        tool_name = tc["name"]

        if tool_name not in valid_tool_names:
            results.append({
                "role": "tool",
                "content": f"Error: Tool '{tool_name}' does not exist. Available tools: {', '.join(valid_tool_names)}",
                "tool_call_id": tc["id"],
            })
            continue

        try:
            arguments = json.loads(tc["arguments"])
        except json.JSONDecodeError as e:
            results.append({
                "role": "tool",
                "content": f"Error: Invalid arguments for tool '{tool_name}': {str(e)}",
                "tool_call_id": tc["id"],
            })
            continue

        tool_schema = next(t for t in tools if t.name == tool_name)
        try:
            jsonschema.validate(instance=arguments, schema=tool_schema.inputSchema)
        except jsonschema.ValidationError as e:
            results.append({
                "role": "tool",
                "content": f"Error: Invalid arguments for tool '{tool_name}': {e.message}",
                "tool_call_id": tc["id"],
            })
            continue

        logger.info({"event": "tool_call", "tool": tool_name, "arguments": arguments})
        try:
            result = await mcp_service.mcp_session.call_tool(tool_name, arguments)
            content = result.content[0].text if result.content else ""
            logger.info({"event": "tool_result", "tool": tool_name, "success": True, "chars": len(content)})
        except Exception as e:
            logger.error({"event": "tool_error", "tool": tool_name, "error": str(e)})
            content = f"Tool error: {str(e)}"
            
                # ← catch auth success here
        if tool_name == "verify_customer_pin" and "error" not in content.lower():
            parsed = parse_customer_from_result(content)
            if parsed:
                session["customer_id"] = parsed["customer_id"]
                session["customer_name"] = parsed["customer_name"]

        results.append({"role": "tool", "content": content, "tool_call_id": tc["id"]})

    return results
