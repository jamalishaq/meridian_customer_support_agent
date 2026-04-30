import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppShell } from "@/components/layout/AppShell";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { ChatInput } from "@/components/chat/ChatInput";
import { useChat } from "@/hooks/useChat";

function ChatPage() {
  const {
    messages,
    isStreaming,
    sendMessage,
    abort,
    conversations,
    activeConversationId,
    startNewConversation,
    switchConversation,
  } = useChat();

  return (
    <AppShell
      conversations={conversations}
      activeConversationId={activeConversationId}
      onNewConversation={startNewConversation}
      onSwitchConversation={switchConversation}
    >
      <ChatWindow messages={messages} />
      <ChatInput onSend={sendMessage} onAbort={abort} isStreaming={isStreaming} />
    </AppShell>
  );
}

export default function App() {
  return (
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ChatPage />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
}
