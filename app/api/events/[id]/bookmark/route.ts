import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { collections, ensureIndexes, buildIdQuery } from "@/lib/db";
import { BookmarkDoc, EventDoc } from "@/db/schema";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureIndexes();
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Please sign in to save events" }, { status: 401 });
    }

    const { id } = await params;
    const event = await collections.events().findOne(buildIdQuery<EventDoc>(id));
    const canonicalId = event?.id || id;
    const idList = Array.from(new Set([id, canonicalId, event ? String(event._id) : ""].filter(Boolean)));

    const existing = await collections.bookmarks().findOne({
      userId: session.user.id,
      eventId: { $in: idList },
    });

    if (existing) {
      // Unsave / Remove bookmark
      await collections.bookmarks().deleteOne({ id: existing.id });
      return NextResponse.json({ bookmarked: false, message: "Event removed from saved" });
    } else {
      // Save / Add bookmark
      const bookmark: BookmarkDoc = {
        id: crypto.randomUUID(),
        userId: session.user.id,
        eventId: canonicalId,
        createdAt: new Date(),
      };
      await collections.bookmarks().insertOne(bookmark);
      return NextResponse.json({ bookmarked: true, message: "Event saved to bookmarks!" });
    }
  } catch (error) {
    console.error("Bookmark toggle error:", error);
    return NextResponse.json(
      { error: "Failed to update bookmark" },
      { status: 500 }
    );
  }
}
