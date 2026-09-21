import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { collections, ensureIndexes } from "@/lib/db";
import { getAIRecommendations } from "@/lib/ai";
import { getEventImageUrl } from "@/lib/event-images";

export async function GET(request: NextRequest) {
  try {
    await ensureIndexes();
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // Fetch upcoming published events
    const upcomingEvents = await collections
      .events()
      .find({
        date: { $gte: new Date() },
        status: { $in: ["published", undefined] },
      })
      .sort({ date: 1 })
      .limit(20)
      .toArray();

    if (!upcomingEvents.length) {
      return NextResponse.json({ recommendations: [] });
    }

    let userInterests: string[] = [];
    let userRegisteredCategories: string[] = [];

    if (session) {
      const user = await collections.users().findOne({ id: session.user.id });
      userInterests = user?.interests || [];

      const userRegs = await collections
        .registrations()
        .aggregate([
          { $match: { userId: session.user.id } },
          {
            $lookup: {
              from: "events",
              localField: "eventId",
              foreignField: "id",
              as: "eventDoc",
            },
          },
          { $unwind: "$eventDoc" },
          { $project: { category: "$eventDoc.category" } },
        ])
        .toArray();

      userRegisteredCategories = userRegs.map((r) => r.category).filter(Boolean);
    }

    const recs = await getAIRecommendations({
      userInterests,
      userRegisteredCategories,
      upcomingEvents,
    });

    const eventMap = new Map(upcomingEvents.map((e) => [e.id, e]));

    const enriched = recs
      .map((r) => {
        const ev = eventMap.get(r.id);
        if (!ev) return null;
        return {
          ...ev,
          imageUrl: getEventImageUrl(ev.imageUrl, ev.category),
          matchReason: r.matchReason,
        };
      })
      .filter(Boolean);

    return NextResponse.json({ recommendations: enriched });
  } catch (error) {
    console.error("AI recommend error:", error);
    return NextResponse.json(
      { error: "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}
