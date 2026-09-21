import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { collections, ensureIndexes } from "@/lib/db";
import { CertificateDoc } from "@/db/schema";

function generateCertificateId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "CERT-";
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
        { error: "Only the organizer or admin can issue certificates" },
        { status: 403 }
      );
    }

    // Find all checked-in attendees
    const attendees = await collections
      .registrations()
      .find({ eventId: id, status: "confirmed", checkedIn: true })
      .toArray();

    if (!attendees.length) {
      return NextResponse.json(
        { error: "No checked-in attendees found to issue certificates for." },
        { status: 400 }
      );
    }

    let issuedCount = 0;
    const now = new Date();

    for (const attendee of attendees) {
      const existingCert = await collections.certificates().findOne({
        userId: attendee.userId,
        eventId: id,
      });

      if (!existingCert) {
        const certId = generateCertificateId();
        const verificationCode = crypto.randomUUID().slice(0, 8).toUpperCase();

        const certDoc: CertificateDoc = {
          id: certId,
          userId: attendee.userId,
          eventId: id,
          studentName: attendee.studentName || "Participant",
          studentEmail: attendee.studentEmail,
          eventTitle: event.title,
          eventDate: event.date,
          organizerName: event.organizerName || session.user.name || "Eventallify Organizers",
          verificationCode,
          issuedAt: now,
        };

        await collections.certificates().insertOne(certDoc);

        // Notify attendee
        await collections.notifications().insertOne({
          id: crypto.randomUUID(),
          userId: attendee.userId,
          title: `🎓 Certificate Available: ${event.title}`,
          message: `Your Certificate of Participation for "${event.title}" is ready to view and download!`,
          type: "certificate",
          link: `/verify/${certId}`,
          read: false,
          createdAt: now,
        });

        issuedCount++;
      }
    }

    // Mark event as completed if not already
    await collections.events().updateOne(
      { id },
      { $set: { status: "completed", updatedAt: now } }
    );

    return NextResponse.json({
      success: true,
      message: `Successfully issued ${issuedCount} certificate(s)!`,
      issuedCount,
      totalAttendees: attendees.length,
    });
  } catch (error) {
    console.error("Certificate generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate certificates" },
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
    const certs = await collections
      .certificates()
      .find({ eventId: id })
      .sort({ issuedAt: -1 })
      .toArray();

    return NextResponse.json(certs);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch certificates" },
      { status: 500 }
    );
  }
}
