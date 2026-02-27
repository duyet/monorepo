export function LoadingIndicator() {
  return (
    <div className="flex justify-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--assistant-accent)]/15">
        <span className="text-[10px] font-bold text-[var(--assistant-accent)]">D</span>
      </div>
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-[var(--assistant-bubble)] px-4 py-3 shadow-sm">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}
