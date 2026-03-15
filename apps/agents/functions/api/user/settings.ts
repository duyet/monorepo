import { z } from "zod";
import { getUserFromRequest } from "../../../lib/auth";

const settingsSchema = z.object({
  customInstructions: z.string().max(5000).optional(),
  language: z.string().max(10).optional(),
  timezone: z.string().max(50).optional(),
});

interface Env {
  CLERK_SECRET_KEY?: string;
  CLERK_ISSUER_URL?: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const user = await getUserFromRequest(
      context.request,
      context.env.CLERK_ISSUER_URL
    );
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const { CLERK_SECRET_KEY } = context.env;
    if (!CLERK_SECRET_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing CLERK_SECRET_KEY" }),
        { status: 500 }
      );
    }

    const res = await fetch(`https://api.clerk.com/v1/users/${user.userId}`, {
      headers: {
        Authorization: `Bearer ${CLERK_SECRET_KEY}`,
      },
    });

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch user from Clerk" }),
        { status: 500 }
      );
    }

    const clerkUser = (await res.json()) as any;
    return new Response(JSON.stringify(clerkUser.public_metadata || {}), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (_error) {
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const user = await getUserFromRequest(
      context.request,
      context.env.CLERK_ISSUER_URL
    );
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const { CLERK_SECRET_KEY } = context.env;
    if (!CLERK_SECRET_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing CLERK_SECRET_KEY" }),
        { status: 500 }
      );
    }

    const rawBody = await context.request.json();
    const parsed = settingsSchema.safeParse(rawBody);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Invalid request body", details: parsed.error.flatten() }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const public_metadata: Record<string, string> = {};
    if (parsed.data.customInstructions !== undefined) {
      public_metadata.customInstructions = parsed.data.customInstructions;
    }
    if (parsed.data.language !== undefined) {
      public_metadata.language = parsed.data.language;
    }
    if (parsed.data.timezone !== undefined) {
      public_metadata.timezone = parsed.data.timezone;
    }

    const res = await fetch(
      `https://api.clerk.com/v1/users/${user.userId}/metadata`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${CLERK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ public_metadata }),
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Clerk API Error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to update user in Clerk" }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ success: true, metadata: public_metadata }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (_error) {
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
};
