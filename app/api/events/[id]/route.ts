import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { collections, ensureIndexes, buildIdQuery } from "@/lib/db";
import { EventDoc } from "@/db/schema";
import { getEventImageUrl } from "@/lib/event-images";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureIndexes();
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const { id } = await params;
    const event = await collections.events().findOne(buildIdQuery<EventDoc>(id));

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const canonicalId = event.id || String(event._id);
    const idList = Array.from(new Set([id, canonicalId, String(event._id)].filter(Boolean)));

    const [
      registrationCount,
      waitlistCount,
      feedbackList,
      userRegistration,
      userBookmark,
    ] = await Promise.all([
      collections.registrations().countDocuments({ eventId: { $in: idList }, status: "confirmed" }),
      collections.registrations().countDocuments({ eventId: { $in: idList }, status: "waitlisted" }),
      collections.feedback().find({ eventId: { $in: idList } }).sort({ createdAt: -1 }).toArray(),
      session
        ? collections.registrations().findOne({ eventId: { $in: idList }, userId: session.user.id })
        : Promise.resolve(null),
      session
        ? collections.bookmarks().findOne({ eventId: { $in: idList }, userId: session.user.id })
        : Promise.resolve(null),
    ]);

    const averageRating =
      feedbackList.length > 0
        ? Number(
            (
              feedbackList.reduce((acc, curr) => acc + (curr.rating || 5), 0) /
              feedbackList.length
            ).toFixed(1)
          )
        : 0;

    return NextResponse.json({
      ...event,
      id: canonicalId,
      imageUrl: getEventImageUrl(event.imageUrl, event.category),
      registrationCount,
      waitlistCount,
      averageRating,
      feedbackCount: feedbackList.length,
      feedback: feedbackList.slice(0, 10),
      isBookmarked: Boolean(userBookmark),
      userRegistration: userRegistration
        ? {
            id: userRegistration.id,
            status: userRegistration.status,
            waitlistPosition: userRegistration.waitlistPosition,
            checkedIn: userRegistration.checkedIn,
            checkedInAt: userRegistration.checkedInAt,
            registeredAt: userRegistration.registeredAt,
          }
        : null,
    });
  } catch (error) {
    console.error("Event fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const existing = await collections.events().findOne(buildIdQuery<EventDoc>(id));
    if (!existing) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const userRole = (session.user as any).role || "student";
    const isOwner = existing.createdBy === session.user.id;
    const isAdmin = userRole === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const updateData: Record<string, any> = {
      ...body,
      updatedAt: new Date(),
    };

    if (body.date) updateData.date = new Date(body.date);
    if (body.endDate) updateData.endDate = new Date(body.endDate);
    if (body.registrationDeadline) {
      updateData.registrationDeadline = new Date(body.registrationDeadline);
    }
    if (body.maxParticipants !== undefined) {
      updateData.maxParticipants = body.maxParticipants ? Number(body.maxParticipants) : null;
    }

    // Status safety check
    if (body.status === "published" && !isAdmin && existing.status !== "published") {
      updateData.status = "pending_approval";
    }

    delete updateData._id;
    delete updateData.id;
    delete updateData.createdBy;

    const result = await collections
      .events()
      .findOneAndUpdate(
        buildIdQuery<EventDoc>(id),
        { $set: updateData },
        { returnDocument: "after" }
      );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Event update error:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await collections.events().findOne(buildIdQuery<EventDoc>(id));
    if (!existing) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const userRole = (session.user as any).role || "student";
    const isOwner = existing.createdBy === session.user.id;
    const isAdmin = userRole === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const canonicalId = existing.id || String(existing._id);
    const idList = Array.from(new Set([id, canonicalId, String(existing._id)].filter(Boolean)));

    await collections.events().deleteOne(buildIdQuery<EventDoc>(id));

    // Clean up associated registrations, bookmarks, certificates, feedback
    await Promise.all([
      collections.registrations().deleteMany({ eventId: { $in: idList } }),
      collections.bookmarks().deleteMany({ eventId: { $in: idList } }),
      collections.certificates().deleteMany({ eventId: { $in: idList } }),
      collections.feedback().deleteMany({ eventId: { $in: idList } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Event delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
