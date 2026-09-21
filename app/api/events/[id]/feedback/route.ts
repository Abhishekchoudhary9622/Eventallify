import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { collections, ensureIndexes, buildIdQuery } from "@/lib/db";
import { FeedbackDoc, EventDoc } from "@/db/schema";

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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const event = await collections.events().findOne(buildIdQuery<EventDoc>(id));
    const canonicalId = event?.id || id;
    const idList = Array.from(new Set([id, canonicalId, event ? String(event._id) : ""].filter(Boolean)));

    const body = await request.json();
    const { rating, comment } = body;

    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5 stars" },
        { status: 400 }
      );
    }

    // Check if attendee was registered & confirmed
    const reg = await collections.registrations().findOne({
      eventId: { $in: idList },
      userId: session.user.id,
    });

    if (!reg) {
      return NextResponse.json(
        { error: "Only attendees can provide feedback for this event" },
        { status: 403 }
      );
    }

    const feedbackDoc: FeedbackDoc = {
      id: crypto.randomUUID(),
      userId: session.user.id,
      eventId: canonicalId,
      rating: numRating,
      comment: comment?.trim() || "",
      userName: session.user.name || "Student",
      createdAt: new Date(),
    };

    // Upsert feedback
    await collections.feedback().updateOne(
      { userId: session.user.id, eventId: { $in: idList } },
      { $set: feedbackDoc },
      { upsert: true }
    );

    return NextResponse.json(
      { success: true, message: "Thank you for your feedback!", feedback: feedbackDoc },
      { status: 201 }
    );
  } catch (error) {
    console.error("Feedback error:", error);
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureIndexes();
    const { id } = await params;
    const event = await collections.events().findOne(buildIdQuery<EventDoc>(id));
    const canonicalId = event?.id || id;
    const idList = Array.from(new Set([id, canonicalId, event ? String(event._id) : ""].filter(Boolean)));

    const list = await collections
      .feedback()
      .find({ eventId: { $in: idList } })
      .sort({ createdAt: -1 })
      .toArray();

    const avg =
      list.length > 0
        ? Number((list.reduce((sum, item) => sum + item.rating, 0) / list.length).toFixed(1))
        : 0;

    return NextResponse.json({
      feedback: list,
      averageRating: avg,
      totalReviews: list.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}
