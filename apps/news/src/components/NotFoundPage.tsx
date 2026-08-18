import { useLang } from "../lib/lang-context";
import { notFoundCopy } from "../lib/not-found";

export function NotFoundPage() {
  const lang = useLang();
  const copy = notFoundCopy(lang);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="text-center">
        <h1 className="font-serif text-6xl tracking-tight">{copy.heading}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{copy.body}</p>
        <a
          href="/"
          className="mt-6 inline-block text-sm underline underline-offset-4 decoration-accent hover:decoration-2"
        >
          {copy.home}
        </a>
      </div>
    </div>
  );
}
