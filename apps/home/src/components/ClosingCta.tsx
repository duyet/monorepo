import { Link } from "@tanstack/react-router";

export function ClosingCta() {
  return (
    <section className="home-closing">
      <h2 className="home-closing-title">
        Your next build should feel this boringly reliable.
      </h2>
      <div className="home-cta-row home-closing-actions">
        <Link to="/projects" className="rd-btn rd-btn-primary no-underline">
          View projects
        </Link>
        <Link to="/contact" className="rd-btn rd-btn-ghost no-underline">
          Say hello
        </Link>
      </div>
    </section>
  );
}
