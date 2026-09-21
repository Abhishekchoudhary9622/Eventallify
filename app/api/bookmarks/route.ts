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

    const savedEvents = await collections
      .bookmarks()
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
        {
          $project: {
            id: "$eventDoc.id",
            title: "$eventDoc.title",
            description: "$eventDoc.description",
            shortDescription: "$eventDoc.shortDescription",
            date: "$eventDoc.date",
            endDate: "$eventDoc.endDate",
            venue: "$eventDoc.venue",
            category: "$eventDoc.category",
            imageUrl: "$eventDoc.imageUrl",
            registrationDeadline: "$eventDoc.registrationDeadline",
            maxParticipants: "$eventDoc.maxParticipants",
            organizerName: "$eventDoc.organizerName",
            status: "$eventDoc.status",
            savedAt: "$createdAt",
          },
        },
        { $sort: { savedAt: -1 } },
      ])
      .toArray();

    const formatted = savedEvents.map((e) => ({
      ...e,
      imageUrl: getEventImageUrl(e.imageUrl, e.category),
      isBookmarked: true,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Fetch saved events error:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved events" },
      { status: 500 }
    );
  }
}
