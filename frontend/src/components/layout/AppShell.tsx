import { useState, type ReactNode } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { Conversation } from "@/types";

interface AppShellProps {
  children: ReactNode;
  conversations: Conversation[];
  activeConversationId: string;
  onNewConversation: () => void;
  onSwitchConversation: (id: string) => void;
}

export function AppShell({
  children,
  conversations,
  activeConversationId,
  onNewConversation,
  onSwitchConversation,
}: AppShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  function closeSidebar() {
    setIsSidebarOpen(false);
  }

  function handleSwitchConversation(id: string) {
    onSwitchConversation(id);
    closeSidebar();
  }

  function handleNewConversation() {
    onNewConversation();
    closeSidebar();
  }

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Mobile overlay — behind sidebar, above main content */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          // Mobile: fixed overlay, slides in from left
          "fixed inset-y-0 left-0 z-50 w-[280px] flex flex-col border-r border-border bg-background",
          "transition-transform duration-300",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop: always visible, static in flow
          "md:relative md:translate-x-0 md:w-65 md:shrink-0"
        )}
      >
        {/* Sidebar header — X button visible on mobile only */}
        <div className="p-3 shrink-0 flex items-center gap-2">
          <Button
            className="flex-1"
            onClick={handleNewConversation}
          >
            <span className="hidden sm:inline">New Conversation</span>
            <span className="sm:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 md:hidden"
            onClick={closeSidebar}
            aria-label="Close sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="px-2 pb-2">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                className={cn(
                  "w-full text-left rounded-md px-3 py-2 mb-1 transition-colors hover:bg-muted",
                  conv.id === activeConversationId
                    ? "bg-muted font-semibold"
                    : "font-normal"
                )}
                onClick={() => handleSwitchConversation(conv.id)}
              >
                <p className="text-sm truncate">{conv.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatRelativeTime(conv.createdAt)}
                </p>
              </button>
            ))}
          </div>
        </ScrollArea>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="shrink-0 flex items-center px-4 h-12 border-b border-border gap-3">
          {/* Hamburger — mobile only */}
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 md:hidden"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
          <span className="font-semibold text-sm truncate">Meridian Electronics Customer Support</span>
        </header>

        <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
