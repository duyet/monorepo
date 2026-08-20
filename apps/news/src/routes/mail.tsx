import { createFileRoute, Link } from "@tanstack/react-router";
import { MailPanel } from "../components/mail/MailPanel";
import { useAdmin } from "../lib/admin";

export const Route = createFileRoute("/mail")({
  component: MailPage,
});

function MailPage() {
  const admin = useAdmin();

  if (admin.loading) {
    return (
      <p className="news-content mx-auto max-w-3xl py-16 text-sm text-muted-foreground">
        Checking admin…
      </p>
    );
  }

  if (!admin.isAdmin) {
    return (
      <div className="news-content mx-auto max-w-md py-16">
        <h1 className="text-lg font-semibold">Mail</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in with an admin account to manage the list and send notes.
        </p>
        <p className="mt-4 text-sm">
          <Link to="/subscribe" className="underline underline-offset-2">
            Public subscribe page
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="news-content py-6">
      <MailPanel admin={admin} />
    </div>
  );
}
