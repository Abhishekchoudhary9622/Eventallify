import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { collections, ensureIndexes } from "@/lib/db";
import { getEventImageUrl } from "@/lib/event-images";

export async function GET(request: NextRequest) {
  try {
    await ensureIndexes();
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const userRole = (session.user as any).role || "student";
    const isAdmin = userRole === "admin";

    // If admin, show all events; if organizer, show own events
    const eventFilter = isAdmin ? {} : { createdBy: userId };

    const events = await collections
      .events()
      .find(eventFilter)
      .sort({ createdAt: -1 })
      .toArray();

    const eventIds = events.map((e) => e.id);

    // Aggregate registrations & attendance
    const [registrations, certificates] = await Promise.all([
      collections.registrations().find({ eventId: { $in: eventIds } }).toArray(),
      collections.certificates().find({ eventId: { $in: eventIds } }).toArray(),
    ]);

    const totalConfirmedRegs = registrations.filter((r) => r.status === "confirmed").length;
    const totalCheckedIn = registrations.filter((r) => r.status === "confirmed" && r.checkedIn).length;
    const totalCerts = certificates.length;

    // Attach stats to each event
    const eventsWithStats = events.map((event) => {
      const eventRegs = registrations.filter((r) => r.eventId === event.id);
      const confirmed = eventRegs.filter((r) => r.status === "confirmed").length;
      const checkedIn = eventRegs.filter((r) => r.status === "confirmed" && r.checkedIn).length;
      const waitlisted = eventRegs.filter((r) => r.status === "waitlisted").length;
      const certCount = certificates.filter((c) => c.eventId === event.id).length;

      return {
        ...event,
        imageUrl: getEventImageUrl(event.imageUrl, event.category),
        confirmedRegistrations: confirmed,
        checkedInAttendees: checkedIn,
        waitlistCount: waitlisted,
        certificatesIssued: certCount,
        attendanceRate: confirmed > 0 ? Math.round((checkedIn / confirmed) * 100) : 0,
      };
    });

    return NextResponse.json({
      metrics: {
        totalEvents: events.length,
        totalRegistrations: totalConfirmedRegs,
        totalAttendance: totalCheckedIn,
        totalCertificates: totalCerts,
        overallAttendanceRate:
          totalConfirmedRegs > 0 ? Math.round((totalCheckedIn / totalConfirmedRegs) * 100) : 0,
      },
      events: eventsWithStats,
    });
  } catch (error) {
    console.error("Organizer dashboard fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch organizer dashboard data" },
      { status: 500 }
    );
  }
}
