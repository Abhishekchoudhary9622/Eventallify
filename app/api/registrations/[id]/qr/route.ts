import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { collections } from "@/lib/db";
import QRCode from "qrcode";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const regs = await collections
      .registrations()
      .aggregate([
        {
          $match: {
            id,
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
        { $unwind: "$eventDoc" },
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
        { $unwind: "$userDoc" },
        {
          $project: {
            registrationId: "$id",
            userId: "$userId",
            eventId: "$eventId",
            eventTitle: "$eventDoc.title",
            eventDate: "$eventDoc.date",
            venue: "$eventDoc.venue",
            userName: "$userDoc.name",
            userEmail: "$userDoc.email",
          },
        },
      ])
      .toArray();

    if (!regs.length) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    const r = regs[0];
    const qrData = JSON.stringify({
      type: "registration",
      registrationId: r.registrationId,
      eventId: r.eventId,
      userId: r.userId,
      eventTitle: r.eventTitle,
      userName: r.userName,
      userEmail: r.userEmail,
      venue: r.venue,
      date: r.eventDate,
    });

    const qrCode = await QRCode.toDataURL(qrData, {
      width: 400,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    });

    return NextResponse.json({ qrCode });
  } catch (error) {
    console.error("QR generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate QR code" },
      { status: 500 }
    );
  }
}
