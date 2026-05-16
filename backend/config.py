import os
from dotenv import load_dotenv
from openai import AsyncOpenAI

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
MCP_SERVER_URL = os.getenv("MCP_SERVER_URL")
FRONTEND_URL = os.getenv("FRONTEND_URL", "")

MAX_ITERATIONS = 5
MAX_HISTORY_MESSAGES = 20
LLM_MODEL = "openai/gpt-4o"

llm_client = AsyncOpenAI(
    api_key=OPENROUTER_API_KEY,
    base_url="https://openrouter.ai/api/v1",
)
