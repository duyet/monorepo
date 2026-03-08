import { getUserFromRequest } from "../../../lib/auth";

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

    const body = (await context.request.json()) as any;
    const public_metadata = {
      customInstructions: body.customInstructions,
      language: body.language,
      timezone: body.timezone,
    };

    // Clean undefined values
    for (const key of Object.keys(public_metadata)) {
      if ((public_metadata as any)[key] === undefined) {
        delete (public_metadata as any)[key];
      }
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
