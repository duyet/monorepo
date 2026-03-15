import { Message, MessageContent } from "@/components/ai-elements/message";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingIndicator() {
  return (
    <Message from="assistant">
      <MessageContent from="assistant">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </MessageContent>
    </Message>
  );
}
