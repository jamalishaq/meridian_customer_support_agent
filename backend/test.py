import asyncio
from mcp import ClientSession
from mcp.client.streamable_http import streamable_http_client

async def test():
    async with streamable_http_client(url="https://order-mcp-74afyau24q-uc.a.run.app/mcp") as (read, write, _):
        async with ClientSession(read, write) as session:
            await session.initialize()
            result = await session.call_tool("verify_customer_pin", {
                "email": "donaldgarcia@example.net",
                "pin": "7912"
            })
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
            print(parse_customer_from_result(result.content[0].text if result.content else ""))

asyncio.run(test())