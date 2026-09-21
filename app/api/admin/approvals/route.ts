import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { collections, ensureIndexes, buildIdQuery } from "@/lib/db";
import { getEventImageUrl } from "@/lib/event-images";

export async function GET(request: NextRequest) {
  try {
    await ensureIndexes();
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending_approval";

    const filter: Record<string, any> = {};
    if (status && status !== "all") {
      filter.status = status;
    }

    const events = await collections
      .events()
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    const formatted = events.map((e) => ({
      ...e,
      imageUrl: getEventImageUrl(e.imageUrl, e.category),
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Admin approvals fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch approvals queue" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureIndexes();
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { eventId, action, feedback } = body;

    if (!eventId || !action) {
      return NextResponse.json(
        { error: "Event ID and action ('approve' | 'request_changes' | 'reject') are required" },
        { status: 400 }
      );
    }

    const event = await collections.events().findOne(buildIdQuery(eventId));
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    let newStatus = event.status;
    let notifTitle = "";
    let notifMsg = "";

    if (action === "approve") {
      newStatus = "published";
      notifTitle = `Event Approved: ${event.title}`;
      notifMsg = `Congratulations! "${event.title}" has been approved and published to the campus catalog.`;
    } else if (action === "request_changes") {
      newStatus = "draft";
      notifTitle = `Changes Requested: ${event.title}`;
      notifMsg = `Admin review notes: ${feedback || "Please review event details and re-submit."}`;
    } else if (action === "reject") {
      newStatus = "rejected";
      notifTitle = `Event Submission Update: ${event.title}`;
      notifMsg = `Reason: ${feedback || "Event does not meet campus criteria."}`;
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await collections.events().updateOne(
      buildIdQuery(eventId),
      {
        $set: {
          status: newStatus,
          approvalFeedback: action === "request_changes" ? feedback : undefined,
          rejectionReason: action === "reject" ? feedback : undefined,
          updatedAt: new Date(),
        },
      }
    );

    // Notify Organizer
    await collections.notifications().insertOne({
      id: crypto.randomUUID(),
      userId: event.createdBy,
      title: notifTitle,
      message: notifMsg,
      type: "approval",
      link: `/organizer`,
      read: false,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      status: newStatus,
      message: `Event status updated to ${newStatus}.`,
    });
  } catch (error) {
    console.error("Admin action error:", error);
    return NextResponse.json(
      { error: "Failed to process admin action" },
      { status: 500 }
    );
  }
}
