// Single diff line component with color coding
interface DiffLineProps {
  line: {
    id: string;
    content: string;
    type: string;
  };
}

export function DiffLine({ line }: DiffLineProps) {
  const bgColor =
    line.type === "added"
      ? "bg-green-50 dark:bg-green-950/30"
      : line.type === "removed"
        ? "bg-red-50 dark:bg-red-950/30"
        : "";

  const textColor =
    line.type === "added"
      ? "text-green-700 dark:text-green-300"
      : line.type === "removed"
        ? "text-red-700 dark:text-red-300"
        : "text-neutral-700 dark:text-neutral-300";

  return (
    <div
      key={line.id}
      className={`font-mono text-sm leading-relaxed ${bgColor} ${textColor} px-3 py-1 border-l-2 ${
        line.type === "added"
          ? "border-green-500"
          : line.type === "removed"
            ? "border-red-500"
            : "border-neutral-300 dark:border-neutral-700"
      }`}
    >
      <span className="select-none inline-block w-4">{line.content[0]}</span>
      <span className="whitespace-pre-wrap break-words">
        {line.content.slice(1)}
      </span>
    </div>
  );
}
