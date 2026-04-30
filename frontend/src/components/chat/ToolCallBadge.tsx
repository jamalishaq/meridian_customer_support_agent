import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ToolCallBadgeProps {
  toolsCalled?: string[];
}

export function ToolCallBadge({ toolsCalled }: ToolCallBadgeProps) {
  if (!toolsCalled || toolsCalled.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {toolsCalled.map((tool, i) => (
        <Tooltip key={`${tool}-${i}`}>
          <TooltipTrigger>
            <Badge variant="outline" className="text-xs cursor-default">
              {tool}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Tool called: {tool}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
