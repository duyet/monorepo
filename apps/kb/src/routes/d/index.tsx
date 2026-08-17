import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays } from "lucide-react";
import type { ReactElement } from "react";
import { getAllInbox } from "../../../lib/content";

export const Route = createFileRoute("/d/")({
  loader: () => {
    const notes = [...getAllInbox()].sort((a, b) =>
      b.date.localeCompare(a.date)
    );
    return { notes };
  },
  head: () => ({
    meta: [
      { title: "Daily | Knowledge Base | duyet.net" },
      {
        name: "description",
        content: "Daily inbox notes, newest first.",
      },
    ],
  }),
  component: DailyIndexPage,
});

function DailyIndexPage(): ReactElement {
  const { notes } = Route.useLoaderData();

  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
      <div className="mb-10">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">
          <Link to="/" className="hover:text-foreground transition-colors">
            KB
          </Link>{" "}
          / Daily
        </p>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Daily</h1>
        <p className="text-muted-foreground text-sm">
          {notes.length} inbox notes.
        </p>
      </div>

      <ul className="space-y-2 pl-4 border-l border-border">
        {notes.map((note) => (
          <li key={note.slug} className="flex items-center gap-2">
            <CalendarDays className="size-3.5 text-muted-foreground" />
            <Link
              to="/d/$date"
              params={{ date: note.date }}
              className="text-sm hover:underline underline-offset-4"
            >
              {note.title || note.date}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
