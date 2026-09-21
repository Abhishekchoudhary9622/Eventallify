import { NextRequest, NextResponse } from "next/server";
import { collections } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const regs = await collections
      .registrations()
      .aggregate([
        { $match: { eventId: id } },
        {
          $lookup: {
            from: "user",
            let: { uId: "$userId" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $or: [
                      { $eq: ["$id", "$$uId"] },
                      { $eq: ["$_id", "$$uId"] },
                    ],
                  },
                },
              },
            ],
            as: "userDoc",
          },
        },
        { $unwind: { path: "$userDoc", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            id: 1,
            userId: 1,
            eventId: 1,
            status: 1,
            checkedIn: 1,
            checkedInAt: 1,
            registeredAt: 1,
            userName: "$userDoc.name",
            userEmail: "$userDoc.email",
          },
        },
      ])
      .toArray();

    return NextResponse.json(regs);
  } catch (error) {
    console.error("Registrations fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}
