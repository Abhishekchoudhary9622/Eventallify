import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { collections, ensureIndexes, buildIdQuery } from "@/lib/db";
import { RegistrationDoc, EventDoc } from "@/db/schema";

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
      const { id } = await params;

      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", `/events/${id}?qr=1`);

      return NextResponse.json(
        {
          error: "Please sign in to register",
          loginUrl: loginUrl.toString(),
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    const event = await collections.events().findOne(buildIdQuery<EventDoc>(id));

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    const canonicalId = event.id || String(event._id);
    const idList = Array.from(new Set([id, canonicalId, String(event._id)].filter(Boolean)));

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
      eventId: { $in: idList },
    });

    if (existing) {
      return NextResponse.json(
        {
          error: "You are already registered for this event",
          registration: existing,
        },
        { status: 400 }
      );
    }

    if (event.maxParticipants) {
      const count = await collections
        .registrations()
        .countDocuments({ eventId: { $in: idList } });

      if (count >= event.maxParticipants) {
        return NextResponse.json(
          { error: "This event is full" },
          { status: 400 }
        );
      }
    }

    const newReg: RegistrationDoc = {
      id: crypto.randomUUID(),
      userId: session.user.id,
      eventId: canonicalId,
      status: "confirmed",
      verificationToken: crypto.randomUUID(),
      qrCode: null,
      checkedIn: false,
      checkedInAt: null,
      registeredAt: new Date(),
    };

    await collections.registrations().insertOne(newReg);

    return NextResponse.json(
      {
        registration: newReg,
        message: `Successfully registered for ${event.title}!`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("QR register error:", error);

    return NextResponse.json(
      { error: "Failed to register" },
      { status: 500 }
    );
  }
}
