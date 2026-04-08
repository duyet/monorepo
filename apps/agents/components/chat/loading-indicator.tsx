import { Message, MessageContent } from "@/components/ai-elements/message";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingIndicator() {
  return (
    <Message from="assistant">
      <MessageContent from="assistant">
        <Card className="max-w-2xl border-border/70 bg-background/80 shadow-sm">
          <CardContent className="flex flex-col gap-3 p-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      </MessageContent>
    </Message>
  );
}
