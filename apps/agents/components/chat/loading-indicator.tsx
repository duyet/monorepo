import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function LoadingIndicator() {
  return (
    <div className="flex justify-start gap-3">
      <Avatar className="mt-0.5">
        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs">
          AI
        </AvatarFallback>
      </Avatar>
      <div className="flex items-center gap-1 px-4 py-2.5">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}
