/**
 * Typing indicator component
 * Shows animated dots when the agent is "thinking"
 */
export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-sm max-w-[80px]">
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
  );
}
