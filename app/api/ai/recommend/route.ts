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
        status: "published",
      })
      .sort({ date: 1 })
      .limit(20)
      .toArray();

    if (upcomingEvents.length === 0) {
      return NextResponse.json({ recommendations: [] });
    }

    let userInterests: string[] = [];
    let userRegisteredCategories: string[] = [];

    if (session) {
      const user = await collections.users().findOne({
        id: session.user.id,
      });

      userInterests = user?.interests ?? [];

      const userRegs = await collections
        .registrations()
        .aggregate<{ category?: string }>([
          {
            $match: {
              userId: session.user.id,
            },
          },
          {
            $lookup: {
              from: "events",
              localField: "eventId",
              foreignField: "id",
              as: "eventDoc",
            },
          },
          {
            $unwind: "$eventDoc",
          },
          {
            $project: {
              _id: 0,
              category: "$eventDoc.category",
            },
          },
        ])
        .toArray();

      userRegisteredCategories = userRegs
        .map((r) => r.category)
        .filter((category): category is string => Boolean(category));
    }

    const recs = await getAIRecommendations({
      userInterests,
      userRegisteredCategories,
      upcomingEvents,
    });

    const eventMap = new Map(
      upcomingEvents.map((event) => [event.id, event])
    );

    const enriched = recs
      .map((recommendation: { id: string; matchReason: string }) => {
        const event = eventMap.get(recommendation.id);

        if (!event) {
          return null;
        }

        return {
          ...event,
          imageUrl: getEventImageUrl(
            event.imageUrl,
            event.category
          ),
          matchReason: recommendation.matchReason,
        };
      })
      .filter(
        (
          event
        ): event is NonNullable<typeof event> => event !== null
      );

    return NextResponse.json({
      recommendations: enriched,
    });
  } catch (error) {
    console.error("AI recommend error:", error);

    return NextResponse.json(
      {
        error: "Failed to generate recommendations",
      },
      {
        status: 500,
      }
    );
  }
}
