import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { collections, ensureIndexes } from "@/lib/db";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    await ensureIndexes();
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    const [
      totalEvents,
      upcomingEvents,
      totalRegistrations,
      totalUsers,
      totalAnnouncements,
      allEvents,
      allRegistrations,
    ] = await Promise.all([
      collections.events().countDocuments(),
      collections.events().countDocuments({
        $or: [{ startDate: { $gte: now } }, { date: { $gte: now } }],
      }),
      collections.registrations().countDocuments(),
      collections.users().countDocuments(),
      collections.announcements().countDocuments(),
      collections.events().find({}).toArray(),
      collections.registrations().find({}).toArray(),
    ]);

    // Map registrations by event
    const regCountsMap: Record<string, { eventTitle: string; count: number }> = {};
    for (const reg of allRegistrations) {
      const eId = reg.eventId;
      const matchedEvent = allEvents.find(
        (e) => e.id === eId || e._id?.toString() === eId
      );
      const title = matchedEvent?.title || "Special Event";
      if (!regCountsMap[title]) {
        regCountsMap[title] = { eventTitle: title, count: 0 };
      }
      regCountsMap[title].count++;
    }

    const registrationsByEvent = Object.values(regCountsMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Group events by category
    const catCountsMap: Record<string, number> = {};
    for (const e of allEvents) {
      const cat = e.category || "General";
      catCountsMap[cat] = (catCountsMap[cat] || 0) + 1;
    }

    const categoryCounts = Object.entries(catCountsMap).map(([category, count]) => ({
      category,
      count,
    }));

    return NextResponse.json({
      totalEvents,
      upcomingEvents,
      totalRegistrations,
      totalUsers,
      totalAnnouncements,
      registrationsByEvent,
      categoryCounts,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
