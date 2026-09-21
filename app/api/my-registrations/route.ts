import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { collections } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const myRegistrations = await collections
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
        { $sort: { "eventDoc.date": -1 } },
        {
          $project: {
            registrationId: "$id",
            status: 1,
            checkedIn: 1,
            checkedInAt: 1,
            registeredAt: 1,
            eventId: "$eventDoc.id",
            title: "$eventDoc.title",
            description: "$eventDoc.description",
            date: "$eventDoc.date",
            endDate: "$eventDoc.endDate",
            venue: "$eventDoc.venue",
            category: "$eventDoc.category",
            imageUrl: "$eventDoc.imageUrl",
            registrationDeadline: "$eventDoc.registrationDeadline",
            maxParticipants: "$eventDoc.maxParticipants",
          },
        },
      ])
      .toArray();

    return NextResponse.json(myRegistrations);
  } catch (error) {
    console.error("My registrations fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}
