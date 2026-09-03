import app from "../../../../apps/api/src/index.js";

type Feature = "health" | "openapi" | "submissions-contact";

async function readJson(res: Response): Promise<unknown> {
  return res.json();
}

async function driveHealth(): Promise<object> {
  const health = await app.request("/health");
  const root = await app.request("/");
  const healthBody = (await readJson(health)) as { status?: string };
  const rootBody = (await readJson(root)) as {
    status?: string;
    endpoints?: Record<string, string>;
  };
  const listsContact = Boolean(rootBody.endpoints?.contact);
  const ok =
    health.status === 200 &&
    healthBody.status === "ok" &&
    root.status === 200 &&
    rootBody.status === "healthy" &&
    listsContact;
  return {
    ok,
    feature: "health",
    healthStatus: health.status,
    healthOk: healthBody.status === "ok",
    rootStatus: root.status,
    rootHealthy: rootBody.status === "healthy",
    listsContact,
    harness: "hono-app.request",
  };
}

async function driveOpenapi(): Promise<object> {
  const res = await app.request("/openapi.json");
  const body = (await readJson(res)) as { paths?: Record<string, unknown> };
  const paths = body.paths ?? {};
  const present = {
    "/api/contact": "/api/contact" in paths,
    "/api/jd": "/api/jd" in paths,
    "/api/comments": "/api/comments" in paths,
  };
  const ok = res.status === 200 && Object.values(present).every(Boolean);
  return {
    ok,
    feature: "openapi",
    status: res.status,
    paths: present,
    harness: "hono-app.request",
  };
}

async function driveContact(): Promise<object> {
  const headers = { "Content-Type": "application/json" };
  const env = {};
  const contact = await app.request(
    "/api/contact",
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: "Ada",
        email: "ada@example.test",
        message: "hello",
      }),
    },
    env
  );
  const honeypot = await app.request(
    "/api/contact",
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: "Ada",
        email: "ada@example.test",
        message: "hello",
        website: "http://spam.example",
      }),
    },
    env
  );
  const contactBody = (await readJson(contact)) as { error?: string };
  const notFound =
    contact.status === 404 || contactBody.error === "Not Found";
  const ok =
    (contact.status === 202 || contact.status === 503) &&
    honeypot.status === 202 &&
    !notFound;
  return {
    ok,
    feature: "submissions-contact",
    contactStatus: contact.status,
    honeypotStatus: honeypot.status,
    notFound,
    harness: "hono-app.request",
  };
}

function isFeature(id: string): id is Feature {
  return id === "health" || id === "openapi" || id === "submissions-contact";
}

async function drive(id: Feature): Promise<object> {
  switch (id) {
    case "health":
      return driveHealth();
    case "openapi":
      return driveOpenapi();
    case "submissions-contact":
      return driveContact();
    default: {
      const _exhaustive: never = id;
      throw new Error(`unhandled feature: ${_exhaustive}`);
    }
  }
}

async function main(): Promise<void> {
  const feature = process.argv[2] ?? "";
  if (!isFeature(feature)) {
    process.stderr.write(
      "usage: tsx drive-http.ts health|openapi|submissions-contact\n"
    );
    process.exit(2);
  }
  const report = await drive(feature);
  process.stdout.write(`${JSON.stringify(report)}\n`);
  process.exit((report as { ok?: boolean }).ok ? 0 : 1);
}

void main();
