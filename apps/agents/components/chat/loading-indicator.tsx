import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function LoadingIndicator() {
  return (
    <div className="flex justify-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <Avatar className="mt-0.5 shrink-0">
        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs">
          @
        </AvatarFallback>
      </Avatar>
      <div className="flex items-center gap-1 px-4 py-2.5 rounded-2xl rounded-bl-sm border bg-background shadow-sm">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}
