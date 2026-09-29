/**
 * Slug → human-readable label.
 *
 * `/tag/$tag` renders this as the page's `<title>` and `<h1>`, and the
 * post-build tag-alias generator uses the *same* function to decide what text
 * to substitute into a copied page. If the two disagreed, an alias page at
 * `/tag/airflow` would keep the heading "Apache Airflow" — right URL, wrong
 * title, and a canonical pointing elsewhere.
 *
 * Dependency-free on purpose: the generator runs outside the bundler.
 */

/** `apache-airflow` -> `Apache Airflow`. */
export function slugToDisplay(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
