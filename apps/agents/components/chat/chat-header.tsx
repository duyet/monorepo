interface ChatHeaderProps {
  title?: string;
  subtitle?: string;
}

export function ChatHeader({
  title = "@duyetbot",
  subtitle = "Virtual version of Duyet",
}: ChatHeaderProps) {
  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 shadow-sm">
              <span className="text-white text-sm">@</span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-green-500" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-semibold leading-none">{title}</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-green-500" />
              {subtitle}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
