import { type ReactNode } from "react";
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
  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Sidebar — always visible, fixed 260px */}
      <aside className="w-[260px] shrink-0 flex flex-col border-r border-border">
        <div className="p-3 shrink-0">
          <Button className="w-full" onClick={onNewConversation}>
            New Conversation
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
                onClick={() => onSwitchConversation(conv.id)}
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
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="shrink-0 flex items-center px-4 h-12 border-b border-border">
          <span className="font-semibold text-sm">Meridian Electronics Customer Support</span>
        </header>

        <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
