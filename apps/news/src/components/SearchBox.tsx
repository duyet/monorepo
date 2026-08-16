import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";

export function SearchBox({ placeholder }: { placeholder: string }) {
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  return (
    <form
      className="relative w-full max-w-xl"
      onSubmit={(e) => {
        e.preventDefault();
        if (q.trim()) navigate({ to: "/", search: { q: q.trim() } });
      }}
    >
      <Search
        className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground"
        aria-hidden
      />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-muted py-1 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
        aria-label="Search"
      />
    </form>
  );
}
