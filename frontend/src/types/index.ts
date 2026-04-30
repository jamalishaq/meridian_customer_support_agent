export type Role = "user" | "assistant";

export interface Message {
  id: string;
  role: Role;
  content: string;
  toolsCalled?: string[];
  isStreaming?: boolean;
  error?: boolean;
}

export interface ChatRequest {
  message: string;
  session_id: string;
}

export interface ToolInfo {
  name: string;
  description: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
}
