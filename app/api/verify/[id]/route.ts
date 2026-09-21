import { NextRequest, NextResponse } from "next/server";
import { collections, ensureIndexes } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureIndexes();

    const { id } = await params;
    const cleanId = id.trim();

    const queryConditions = [
      { id: cleanId },
      { id: cleanId.toUpperCase() },
      { certificateId: cleanId },
      { certificateId: cleanId.toUpperCase() },
      { certificateNumber: cleanId },
      { certificateNumber: cleanId.toUpperCase() },
      { verificationCode: cleanId },
      { verificationCode: cleanId.toUpperCase() },
    ];

    const cert = await collections.certificates().findOne({
      $or: queryConditions,
    });

    if (!cert) {
      return NextResponse.json(
        {
          error: "Certificate not found or invalid credential ID",
          valid: false,
        },
        { status: 404 }
      );
    }

    let event: any = null;

    if (cert.eventId) {
      event = await collections.events().findOne({
        id: cert.eventId,
      });
    }

    return NextResponse.json({
      valid: true,
      certificate: {
        _id: cert._id,
        id: cert.id || cert.certificateNumber,
        certificateNumber:
          cert.certificateNumber ||
          cert.verificationCode ||
          cert.id,
        studentName: cert.studentName || cert.userName,
        userName: cert.studentName || cert.userName,
        userEmail: cert.userEmail,
        eventTitle: cert.eventTitle,
        eventId: cert.eventId,
        eventDate: cert.eventDate || cert.issueDate,
        issueDate:
          cert.issueDate ||
          cert.eventDate ||
          cert.createdAt,
        organizerName: cert.organizerName || "VIT Chennai",
        verificationCode:
          cert.verificationCode ||
          cert.certificateNumber,
        qrVerifyPayload: cert.qrVerifyPayload,
        venue: event?.venue || "Campus Main Hall",
        category:
          cert.category ||
          event?.category ||
          "Workshop",
      },
    });
  } catch (error) {
    console.error("Certificate verify error:", error);

    return NextResponse.json(
      {
        error: "Verification lookup failed",
        valid: false,
      },
      { status: 500 }
    );
  }
}
