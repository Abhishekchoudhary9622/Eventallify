import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { collections, ensureIndexes } from "@/lib/db";

export async function GET(
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
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const registrations = await collections
      .registrations()
      .find({ eventId: id })
      .sort({ registeredAt: -1 })
      .toArray();

    const confirmed = registrations.filter((r) => r.status === "confirmed");
    const waitlisted = registrations.filter((r) => r.status === "waitlisted");
    const cancelled = registrations.filter((r) => r.status === "cancelled");
    const checkedIn = confirmed.filter((r) => r.checkedIn);
    const notCheckedIn = confirmed.filter((r) => !r.checkedIn);

    const totalConfirmed = confirmed.length;
    const totalCheckedIn = checkedIn.length;
    const attendanceRate =
      totalConfirmed > 0 ? Math.round((totalCheckedIn / totalConfirmed) * 100) : 0;

    return NextResponse.json({
      event: {
        id: event.id,
        title: event.title,
        date: event.date,
        venue: event.venue,
        status: event.status,
        maxParticipants: event.maxParticipants,
      },
      stats: {
        totalConfirmed,
        totalCheckedIn,
        totalNotCheckedIn: notCheckedIn.length,
        totalWaitlisted: waitlisted.length,
        totalCancelled: cancelled.length,
        attendanceRate,
      },
      participants: registrations.map((r) => ({
        id: r.id,
        userId: r.userId,
        name: r.studentName || "Student",
        email: r.studentEmail || "",
        department: r.department || "",
        collegeYear: r.collegeYear || "",
        status: r.status,
        waitlistPosition: r.waitlistPosition,
        checkedIn: r.checkedIn,
        checkedInAt: r.checkedInAt,
        registeredAt: r.registeredAt,
      })),
    });
  } catch (error) {
    console.error("Attendance fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance data" },
      { status: 500 }
    );
  }
}
