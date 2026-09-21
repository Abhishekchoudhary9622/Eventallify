import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { collections, ensureIndexes } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    ensureIndexes();
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
      categoryStats,
      popularStats,
    ] = await Promise.all([
      collections.events().countDocuments(),
      collections.events().countDocuments({ date: { $gte: now } }),
      collections.registrations().countDocuments(),
      collections.users().countDocuments(),
      collections.announcements().countDocuments(),
      collections.events().aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
      ]).toArray(),
      collections.registrations().aggregate([
        { $match: { status: "confirmed" } },
        { $group: { _id: "$eventId", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "events",
            localField: "_id",
            foreignField: "id",
            as: "eventDoc",
          },
        },
        { $unwind: { path: "$eventDoc", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            eventTitle: { $ifNull: ["$eventDoc.title", "Campus Event"] },
            count: 1,
          },
        },
      ]).toArray(),
    ]);

    const categoryCounts = categoryStats.map((c: any) => ({
      category: c._id || "General",
      count: c.count,
    }));

    const registrationsByEvent = popularStats.map((p: any) => ({
      eventTitle: p.eventTitle,
      count: p.count,
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
