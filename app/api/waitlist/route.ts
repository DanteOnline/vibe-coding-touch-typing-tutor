import { NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/admin";
import { joinWaitlist } from "@/lib/waitlist";
import { waitlistSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = waitlistSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Invalid data" },
        { status: 400 },
      );
    }

    const result = await joinWaitlist(user.id, parsed.data.sessionId);
    if (!result) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      waitlistJoinedAt: result.waitlistJoinedAt,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to join waitlist" },
      { status: 500 },
    );
  }
}
