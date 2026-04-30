import { useState, useCallback } from "react";
import type { Conversation } from "@/types";
import { generateUUID } from "@/lib/utils";

const CONVERSATIONS_KEY = "conversations";
const ACTIVE_ID_KEY = "activeConversationId";

function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(CONVERSATIONS_KEY);
    return raw ? (JSON.parse(raw) as Conversation[]) : [];
  } catch {
    return [];
  }
}

function saveConversations(conversations: Conversation[]): void {
  localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
}

function saveActiveId(id: string): void {
  localStorage.setItem(ACTIVE_ID_KEY, id);
}

interface SessionState {
  conversations: Conversation[];
  activeConversationId: string;
}

function initSessionState(): SessionState {
  const convs = loadConversations();
  const activeId = localStorage.getItem(ACTIVE_ID_KEY);
  const isValid = activeId && convs.some((c) => c.id === activeId);

  if (convs.length === 0 || !isValid) {
    if (convs.length > 0) {
      // Conversations exist but active id is missing/invalid — use first
      saveActiveId(convs[0].id);
      return { conversations: convs, activeConversationId: convs[0].id };
    }
    // No conversations at all — create the first one
    const first: Conversation = {
      id: generateUUID(),
      title: "New Conversation",
      createdAt: Date.now(),
    };
    saveConversations([first]);
    saveActiveId(first.id);
    return { conversations: [first], activeConversationId: first.id };
  }

  return { conversations: convs, activeConversationId: activeId! };
}

export function useSession() {
  const [state, setState] = useState<SessionState>(initSessionState);
  const { conversations, activeConversationId } = state;

  const startNewConversation = useCallback(() => {
    const newConv: Conversation = {
      id: generateUUID(),
      title: "New Conversation",
      createdAt: Date.now(),
    };
    setState((prev) => {
      const updated = [newConv, ...prev.conversations];
      saveConversations(updated);
      saveActiveId(newConv.id);
      return { conversations: updated, activeConversationId: newConv.id };
    });
  }, []);

  const switchConversation = useCallback((id: string) => {
    setState((prev) => {
      if (prev.activeConversationId === id) return prev;
      saveActiveId(id);
      return { ...prev, activeConversationId: id };
    });
  }, []);

  const updateConversationTitle = useCallback((id: string, title: string) => {
    setState((prev) => {
      const updated = prev.conversations.map((c) =>
        c.id === id ? { ...c, title } : c
      );
      saveConversations(updated);
      return { ...prev, conversations: updated };
    });
  }, []);

  return {
    conversations,
    activeConversationId,
    startNewConversation,
    switchConversation,
    updateConversationTitle,
  };
}
