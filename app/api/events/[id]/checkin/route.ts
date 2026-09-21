import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { collections, ensureIndexes } from "@/lib/db";

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
    const event = await collections.events().findOne({ id });
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const userRole = (session.user as any).role || "student";
    const isOwner = event.createdBy === session.user.id;
    const isAdmin = userRole === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Organizer or Admin access required to scan attendance" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { registrationId, registrationQrData } = body;

    if (!registrationId && !registrationQrData) {
      return NextResponse.json(
        { error: "Provide a valid Registration ID or scan a QR code" },
        { status: 400 }
      );
    }

    let resolvedRegId = registrationId?.trim();
    let qrToken: string | undefined = undefined;

    if (registrationQrData) {
      try {
        const qrData =
          typeof registrationQrData === "string"
            ? JSON.parse(registrationQrData)
            : registrationQrData;
        resolvedRegId = qrData.regId || qrData.registrationId || qrData.id;
        qrToken = qrData.t || qrData.token;

        if (qrData.eventId && qrData.eventId !== id) {
          return NextResponse.json(
            {
              error: `Invalid QR Code: This ticket is for a different event!`,
              isWrongEvent: true,
            },
            { status: 400 }
          );
        }
      } catch {
        // If raw string ID was passed in QR
        resolvedRegId = typeof registrationQrData === "string" ? registrationQrData.trim() : resolvedRegId;
      }
    }

    if (!resolvedRegId) {
      return NextResponse.json(
        { error: "Could not read registration ID from pass" },
        { status: 400 }
      );
    }

    // Lookup registration
    const reg = await collections.registrations().findOne({
      $or: [
        { id: resolvedRegId },
        { id: resolvedRegId.toUpperCase() },
        { _id: resolvedRegId as any },
      ],
      eventId: id,
    });

    if (!reg) {
      return NextResponse.json(
        {
          error: `Registration "${resolvedRegId}" not found for "${event.title}"`,
          notFound: true,
        },
        { status: 404 }
      );
    }

    if (reg.status !== "confirmed") {
      return NextResponse.json(
        {
          error: `Cannot check in: Registration is currently ${reg.status.toUpperCase()}`,
        },
        { status: 400 }
      );
    }

    if (reg.checkedIn) {
      return NextResponse.json(
        {
          error: `Already checked in on ${new Date(reg.checkedInAt!).toLocaleTimeString()}`,
          isAlreadyCheckedIn: true,
          registration: reg,
        },
        { status: 400 }
      );
    }

    const checkedInAt = new Date();
    const updated = await collections.registrations().findOneAndUpdate(
      { id: reg.id },
      {
        $set: {
          checkedIn: true,
          checkedInAt,
        },
      },
      { returnDocument: "after" }
    );

    // Notify attendee
    await collections.notifications().insertOne({
      id: crypto.randomUUID(),
      userId: reg.userId,
      title: `Checked In: ${event.title}`,
      message: `You have successfully checked in to ${event.title}. Enjoy the event!`,
      type: "reminder",
      link: `/my-events`,
      read: false,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: `Welcome, ${reg.studentName || "Attendee"}! Check-in verified.`,
      registration: updated,
    });
  } catch (error) {
    console.error("Check-in error:", error);
    return NextResponse.json(
      { error: "Check-in processing failed" },
      { status: 500 }
    );
  }
}
