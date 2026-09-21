import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { collections, ensureIndexes } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    await ensureIndexes();
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [notifications, unreadCount] = await Promise.all([
      collections
        .notifications()
        .find({ userId: session.user.id })
        .sort({ createdAt: -1 })
        .limit(30)
        .toArray(),
      collections
        .notifications()
        .countDocuments({ userId: session.user.id, read: false }),
    ]);

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Notifications fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await ensureIndexes();
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { id, markAll } = body;

    if (markAll) {
      await collections
        .notifications()
        .updateMany({ userId: session.user.id, read: false }, { $set: { read: true } });
      return NextResponse.json({ success: true, message: "All notifications marked as read" });
    }

    if (id) {
      await collections
        .notifications()
        .updateOne({ id, userId: session.user.id }, { $set: { read: true } });
      return NextResponse.json({ success: true, message: "Notification marked as read" });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error) {
    console.error("Update notifications error:", error);
    return NextResponse.json(
      { error: "Failed to update notifications" },
      { status: 500 }
    );
  }
}
