import { Link } from "@tanstack/react-router";
import { Link as ExternalLink, House as Home } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-lg border-border/70 bg-background shadow-sm">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto">
            <Badge variant="secondary">404</Badge>
          </div>
          <CardTitle className="text-3xl tracking-tight">
            Page not found
          </CardTitle>
          <CardDescription>
            The page you’re looking for doesn’t exist or has been moved.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link to="/">
              <Home />
              Go to agents
            </Link>
          </Button>
          <Button asChild variant="outline">
            <a
              href="https://duyet.net"
              rel="noopener noreferrer"
              target="_blank"
            >
              <ExternalLink />
              duyet.net
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
