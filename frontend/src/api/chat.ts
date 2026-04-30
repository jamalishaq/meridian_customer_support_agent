import type { ChatRequest, ToolInfo } from "@/types";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export async function streamChat(
  payload: ChatRequest,
  onChunk: (chunk: string) => void,
  onToolCall: (name: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const response = await fetch(`${BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const raw = decoder.decode(value, { stream: true });
    for (const line of raw.split("\n")) {
      if (!line.startsWith("data: ")) continue;
      const payload = line.slice(6).trim();
      if (payload === "[DONE]") return;
      try {
        const data = JSON.parse(payload) as Record<string, unknown>;
        if (typeof data.chunk === "string") onChunk(data.chunk);
        if (
          data.tool_call !== null &&
          typeof data.tool_call === "object" &&
          "name" in (data.tool_call as object)
        ) {
          onToolCall((data.tool_call as { name: string }).name);
        }
      } catch {
        // skip malformed lines
      }
    }
  }
}

export async function fetchTools(): Promise<ToolInfo[]> {
  const response = await fetch(`${BASE_URL}/tools`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = (await response.json()) as { tools: ToolInfo[] };
  return data.tools;
}

export async function fetchHealth(): Promise<{
  status: string;
  mcp_connected: boolean;
}> {
  const response = await fetch(`${BASE_URL}/health`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json() as Promise<{ status: string; mcp_connected: boolean }>;
}

export async function deleteSession(sessionId: string): Promise<void> {
  await fetch(`${BASE_URL}/session/${sessionId}`, { method: "DELETE" });
}
