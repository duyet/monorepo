import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    return NextResponse.json(user.publicMetadata || {});
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // Whitelist only the fields we care about
    const metadataToUpdate = {
      customInstructions: body.customInstructions,
      language: body.language,
      timezone: body.timezone,
    };

    // Clean undefined values
    Object.keys(metadataToUpdate).forEach((key) => {
      if ((metadataToUpdate as any)[key] === undefined) {
        delete (metadataToUpdate as any)[key];
      }
    });

    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: metadataToUpdate,
    });

    return NextResponse.json({ success: true, metadata: metadataToUpdate });
  } catch (error) {
    console.error("Error updating user settings:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
