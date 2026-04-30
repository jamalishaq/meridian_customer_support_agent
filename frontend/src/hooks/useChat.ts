import { useState, useRef, useCallback, useEffect } from "react";
import type { Message } from "@/types";
import { streamChat, deleteSession } from "@/api/chat";
import { useSession } from "@/hooks/useSession";
import { generateUUID } from "@/lib/utils";

export function useChat() {
  const {
    conversations,
    activeConversationId,
    startNewConversation: sessionStartNew,
    switchConversation,
    updateConversationTitle,
  } = useSession();

  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const raw = localStorage.getItem(`messages_${activeConversationId}`);
      return raw ? (JSON.parse(raw) as Message[]) : [];
    } catch {
      return [];
    }
  });

  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Keep a ref to the active conversation id so callbacks always have the latest value
  // without being recreated. Updated synchronously on every render.
  const activeConvIdRef = useRef(activeConversationId);
  activeConvIdRef.current = activeConversationId;

  // Keep a ref to messages to avoid stale closures in sendMessage
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  // Load messages from localStorage whenever the active conversation changes
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`messages_${activeConversationId}`);
      setMessages(raw ? (JSON.parse(raw) as Message[]) : []);
    } catch {
      setMessages([]);
    }
  }, [activeConversationId]);

  // Persist messages to localStorage after every change.
  // Uses ref so we always write to the currently active conversation key,
  // even if activeConversationId hasn't re-rendered yet.
  useEffect(() => {
    localStorage.setItem(
      `messages_${activeConvIdRef.current}`,
      JSON.stringify(messages)
    );
  }, [messages]);

  const appendChunk = useCallback((id: string, chunk: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, content: m.content + chunk } : m))
    );
  }, []);

  const addToolCall = useCallback((id: string, toolName: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, toolsCalled: [...(m.toolsCalled ?? []), toolName] }
          : m
      )
    );
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;

      // Set title from first user message
      if (messagesRef.current.length === 0) {
        updateConversationTitle(
          activeConvIdRef.current,
          text.trim().slice(0, 40)
        );
      }

      const userMessage: Message = {
        id: generateUUID(),
        role: "user",
        content: text.trim(),
      };

      const assistantId = generateUUID();
      const assistantMessage: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
        toolsCalled: [],
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setIsStreaming(true);

      abortControllerRef.current = new AbortController();

      try {
        await streamChat(
          { message: text.trim(), session_id: activeConvIdRef.current },
          (chunk) => appendChunk(assistantId, chunk),
          (toolName) => addToolCall(assistantId, toolName),
          abortControllerRef.current.signal
        );
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, isStreaming: false } : m
          )
        );
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, isStreaming: false } : m
            )
          );
        } else {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    isStreaming: false,
                    error: true,
                    content:
                      m.content || "Something went wrong. Please try again.",
                  }
                : m
            )
          );
        }
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [isStreaming, updateConversationTitle, appendChunk, addToolCall]
  );

  const abort = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  const startNewConversation = useCallback(() => {
    const currentSessionId = activeConvIdRef.current;
    deleteSession(currentSessionId).catch(() => {});
    sessionStartNew();
  }, [sessionStartNew]);

  return {
    messages,
    isStreaming,
    sendMessage,
    abort,
    conversations,
    activeConversationId,
    startNewConversation,
    switchConversation,
  };
}
