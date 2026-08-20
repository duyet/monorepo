export interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  subject: string;
  preheader: string;
  body_md: string;
  cta_label: string;
  cta_url: string;
}

/** Built-in Cursor-clean templates. Placeholders are {{name}}. */
export const BUILTIN_TEMPLATES: EmailTemplate[] = [
  {
    id: "note",
    name: "Note",
    description: "A short personal note. Body is the email.",
    subject: "",
    preheader: "",
    body_md: "Hi,\n\n{{body}}\n",
    cta_label: "",
    cta_url: "",
  },
  {
    id: "post",
    name: "New post",
    description: "Wrap a blog post: title, excerpt, read link.",
    subject: "{{title}}",
    preheader: "{{excerpt}}",
    body_md: "{{excerpt}}\n",
    cta_label: "Read the post",
    cta_url: "{{url}}",
  },
  {
    id: "digest",
    name: "Digest",
    description: "A numbered list of links or stories.",
    subject: "Notes — {{date}}",
    preheader: "{{preheader}}",
    body_md: "{{body}}\n",
    cta_label: "Open news.duyet.net",
    cta_url: "https://news.duyet.net",
  },
];

export function templateById(id: string): EmailTemplate | undefined {
  return BUILTIN_TEMPLATES.find((t) => t.id === id);
}

const PLACEHOLDER = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

export function applyPlaceholders(
  template: string,
  vars: Record<string, string>
): string {
  return template.replace(PLACEHOLDER, (_match, key: string) => {
    return vars[key] ?? "";
  });
}

export function applyTemplate(
  template: EmailTemplate,
  vars: Record<string, string>
): Pick<
  EmailTemplate,
  "subject" | "preheader" | "body_md" | "cta_label" | "cta_url"
> {
  return {
    subject: applyPlaceholders(template.subject, vars).trim(),
    preheader: applyPlaceholders(template.preheader, vars).trim(),
    body_md: applyPlaceholders(template.body_md, vars),
    cta_label: applyPlaceholders(template.cta_label, vars).trim(),
    cta_url: applyPlaceholders(template.cta_url, vars).trim(),
  };
}
