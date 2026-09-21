import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { collections, ensureIndexes } from "@/lib/db";
import { RegistrationDoc } from "@/db/schema";
import { sendEventRegistrationEmail } from "@/lib/email";
import QRCode from "qrcode";
import { format } from "date-fns";

function generateFriendlyRegId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "REG-";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

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
      return NextResponse.json(
        { error: "Please sign in to register" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { department, collegeYear, customAnswers } = body;

    const event = await collections.events().findOne({ id });
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (new Date(event.registrationDeadline) < new Date()) {
      return NextResponse.json(
        { error: "Registration deadline has passed" },
        { status: 400 }
      );
    }

    if (new Date(event.date) < new Date()) {
      return NextResponse.json(
        { error: "This event has already ended" },
        { status: 400 }
      );
    }

    const existing = await collections.registrations().findOne({
      userId: session.user.id,
      eventId: id,
    });

    if (existing) {
      if (existing.status === "cancelled") {
        // Allow re-registering if cancelled
        await collections.registrations().deleteOne({ id: existing.id });
      } else {
        return NextResponse.json(
          {
            error:
              existing.status === "waitlisted"
                ? "You are already on the waitlist for this event"
                : "You are already registered for this event",
            registration: existing,
          },
          { status: 400 }
        );
      }
    }

    const confirmedCount = await collections
      .registrations()
      .countDocuments({ eventId: id, status: "confirmed" });

    const isFull =
      event.maxParticipants && confirmedCount >= event.maxParticipants;

    let registrationStatus: "confirmed" | "waitlisted" = "confirmed";
    let waitlistPosition: number | undefined = undefined;

    if (isFull) {
      if (event.allowWaitlist === false) {
        return NextResponse.json(
          { error: "This event is full and waitlist is closed" },
          { status: 400 }
        );
      }
      registrationStatus = "waitlisted";
      const currentWaitlistCount = await collections
        .registrations()
        .countDocuments({ eventId: id, status: "waitlisted" });
      waitlistPosition = currentWaitlistCount + 1;
    }

    const regId = generateFriendlyRegId();
    const verificationToken = crypto.randomUUID();

    // Generate secure QR payload
    const qrPayload = JSON.stringify({
      v: "1",
      regId,
      eventId: id,
      t: verificationToken,
    });

    const qrCodeDataUrl = await QRCode.toDataURL(qrPayload, {
      width: 320,
      margin: 2,
      color: { dark: "#09090b", light: "#ffffff" },
    });

    const newReg: RegistrationDoc = {
      id: regId,
      userId: session.user.id,
      eventId: id,
      status: registrationStatus,
      waitlistPosition,
      customAnswers: customAnswers || {},
      qrCode: qrCodeDataUrl,
      verificationToken,
      checkedIn: false,
      checkedInAt: null,
      registeredAt: new Date(),
      studentName: session.user.name || "Student",
      studentEmail: session.user.email,
      department: department || "",
      collegeYear: collegeYear || "",
    };

    await collections.registrations().insertOne(newReg);

    // Create In-App Notification
    await collections.notifications().insertOne({
      id: crypto.randomUUID(),
      userId: session.user.id,
      title:
        registrationStatus === "confirmed"
          ? `Registration Confirmed: ${event.title}`
          : `Added to Waitlist: ${event.title}`,
      message:
        registrationStatus === "confirmed"
          ? `You're confirmed for ${event.title}. Your pass ID is ${regId}.`
          : `You are #${waitlistPosition} on the waitlist for ${event.title}. We'll notify you if a spot opens up!`,
      type: "registration",
      link: `/my-events`,
      read: false,
      createdAt: new Date(),
    });

    // Send Confirmation Email if confirmed
    if (registrationStatus === "confirmed") {
      try {
        await sendEventRegistrationEmail({
          email: session.user.email,
          userName: session.user.name || "Student",
          eventTitle: event.title,
          eventDate: format(new Date(event.date), "EEEE, MMMM d, yyyy 'at' h:mm a"),
          eventVenue: event.venue,
          eventDescription: event.description,
          registrationId: regId,
          eventId: id,
        });
      } catch (err) {
        console.warn("[email] Registration email notice:", err);
      }
    }

    return NextResponse.json(
      {
        registration: newReg,
        message:
          registrationStatus === "confirmed"
            ? `Successfully registered for ${event.title}!`
            : `Added to the waitlist (Position #${waitlistPosition})`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to register" },
      { status: 500 }
    );
  }
}
