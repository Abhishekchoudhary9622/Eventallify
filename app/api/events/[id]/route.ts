import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { collections, ensureIndexes } from "@/lib/db";
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
    const event = await collections.events().findOne({ id });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const [
      registrationCount,
      waitlistCount,
      feedbackList,
      userRegistration,
      userBookmark,
    ] = await Promise.all([
      collections.registrations().countDocuments({ eventId: id, status: "confirmed" }),
      collections.registrations().countDocuments({ eventId: id, status: "waitlisted" }),
      collections.feedback().find({ eventId: id }).sort({ createdAt: -1 }).toArray(),
      session
        ? collections.registrations().findOne({ eventId: id, userId: session.user.id })
        : Promise.resolve(null),
      session
        ? collections.bookmarks().findOne({ eventId: id, userId: session.user.id })
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
    const existing = await collections.events().findOne({ id });
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
        { id },
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
    const existing = await collections.events().findOne({ id });
    if (!existing) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const userRole = (session.user as any).role || "student";
    const isOwner = existing.createdBy === session.user.id;
    const isAdmin = userRole === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await collections.events().deleteOne({ id });

    // Clean up associated registrations, bookmarks, certificates, feedback
    await Promise.all([
      collections.registrations().deleteMany({ eventId: id }),
      collections.bookmarks().deleteMany({ eventId: id }),
      collections.certificates().deleteMany({ eventId: id }),
      collections.feedback().deleteMany({ eventId: id }),
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
