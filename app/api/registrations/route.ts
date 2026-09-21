import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { collections, ensureIndexes } from "@/lib/db";
import { getEventImageUrl } from "@/lib/event-images";
import { sendEventRegistrationEmail } from "@/lib/email";
import { format } from "date-fns";

export async function DELETE(request: NextRequest) {
  try {
    await ensureIndexes();
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const registrationId = searchParams.get("registrationId");

    if (!registrationId) {
      return NextResponse.json(
        { error: "Registration ID required" },
        { status: 400 }
      );
    }

    const reg = await collections.registrations().findOne({
      id: registrationId,
      userId: session.user.id,
    });

    if (!reg) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    const wasConfirmed = reg.status === "confirmed";
    const eventId = reg.eventId;

    // Update status to cancelled
    await collections.registrations().updateOne(
      { id: registrationId },
      { $set: { status: "cancelled", waitlistPosition: undefined } }
    );

    // If confirmed registration was cancelled, auto-promote next in line from waitlist!
    if (wasConfirmed) {
      const nextWaitlisted = await collections
        .registrations()
        .find({ eventId, status: "waitlisted" })
        .sort({ waitlistPosition: 1, registeredAt: 1 })
        .limit(1)
        .toArray();

      if (nextWaitlisted.length > 0) {
        const promoted = nextWaitlisted[0];
        const event = await collections.events().findOne({ id: eventId });

        await collections.registrations().updateOne(
          { id: promoted.id },
          {
            $set: {
              status: "confirmed",
              waitlistPosition: undefined,
            },
          }
        );

        // Notify promoted student
        await collections.notifications().insertOne({
          id: crypto.randomUUID(),
          userId: promoted.userId,
          title: `🎉 You've been promoted from the waitlist!`,
          message: `A spot opened up for "${event?.title || "your event"}". Your registration is now confirmed!`,
          type: "waitlist_promoted",
          link: `/my-events`,
          read: false,
          createdAt: new Date(),
        });

        // Send email
        if (event && promoted.studentEmail) {
          try {
            await sendEventRegistrationEmail({
              email: promoted.studentEmail,
              userName: promoted.studentName || "Student",
              eventTitle: event.title,
              eventDate: format(new Date(event.date), "EEEE, MMMM d, yyyy 'at' h:mm a"),
              eventVenue: event.venue,
              eventDescription: event.description,
              registrationId: promoted.id,
              eventId: event.id,
            });
          } catch (e) {
            console.warn("[email] Waitlist promotion email warning:", e);
          }
        }
      }
    }

    return NextResponse.json({ success: true, message: "Registration cancelled successfully" });
  } catch (error) {
    console.error("Cancel registration error:", error);
    return NextResponse.json(
      { error: "Failed to cancel registration" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await ensureIndexes();
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const matchQuery: Record<string, any> = { userId: session.user.id };
    if (status) {
      matchQuery.status = status;
    }

    const regs = await collections
      .registrations()
      .aggregate([
        { $match: matchQuery },
        {
          $lookup: {
            from: "events",
            localField: "eventId",
            foreignField: "id",
            as: "eventDoc",
          },
        },
        { $unwind: "$eventDoc" },
        {
          $lookup: {
            from: "certificates",
            let: { regUser: "$userId", regEvent: "$eventId" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$userId", "$$regUser"] },
                      { $eq: ["$eventId", "$$regEvent"] },
                    ],
                  },
                },
              },
            ],
            as: "certificateDoc",
          },
        },
        {
          $lookup: {
            from: "feedback",
            let: { regUser: "$userId", regEvent: "$eventId" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$userId", "$$regUser"] },
                      { $eq: ["$eventId", "$$regEvent"] },
                    ],
                  },
                },
              },
            ],
            as: "feedbackDoc",
          },
        },
        {
          $project: {
            id: 1,
            status: 1,
            waitlistPosition: 1,
            qrCode: 1,
            verificationToken: 1,
            checkedIn: 1,
            checkedInAt: 1,
            registeredAt: 1,
            eventId: "$eventDoc.id",
            eventTitle: "$eventDoc.title",
            eventDescription: "$eventDoc.description",
            eventDate: "$eventDoc.date",
            eventEndDate: "$eventDoc.endDate",
            eventVenue: "$eventDoc.venue",
            eventCategory: "$eventDoc.category",
            eventImageUrl: "$eventDoc.imageUrl",
            organizerName: "$eventDoc.organizerName",
            certificate: { $arrayElemAt: ["$certificateDoc", 0] },
            feedback: { $arrayElemAt: ["$feedbackDoc", 0] },
          },
        },
        { $sort: { eventDate: -1 } },
      ])
      .toArray();

    const formatted = regs.map((r) => ({
      ...r,
      eventImageUrl: getEventImageUrl(r.eventImageUrl, r.eventCategory),
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("User registrations fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}
