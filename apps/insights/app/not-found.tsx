import Container from "@duyet/components/Container";
import Link from "next/link";

export default function NotFound() {
  return (
    <Container className="py-12">
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="max-w-md text-center">
          <h1 className="mb-4 font-serif text-6xl font-bold text-neutral-900 dark:text-neutral-100">
            404
          </h1>
          <h2 className="mb-4 text-xl font-semibold text-neutral-700 dark:text-neutral-300">
            Page not found
          </h2>
          <p className="mb-8 text-neutral-600 dark:text-neutral-400">
            Sorry, we couldn't find the page you're looking for.
          </p>
          <Link
            href="/"
            className="inline-block rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </Container>
  );
}
