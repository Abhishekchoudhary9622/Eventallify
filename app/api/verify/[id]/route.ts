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

    const cert = await collections.certificates().findOne({
      $or: [
        { id: cleanId },
        { verificationCode: cleanId },
        { id: cleanId.toUpperCase() },
        { verificationCode: cleanId.toUpperCase() },
      ],
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

    const event = cert.eventId
      ? await collections.events().findOne({
          id: cert.eventId,
        })
      : null;

    return NextResponse.json({
      valid: true,
      certificate: {
        _id: cert._id,
        id: cert.id,
        certificateNumber: cert.id,
        studentName: cert.studentName,
        userName: cert.studentName,
        studentEmail: cert.studentEmail,
        userEmail: cert.studentEmail,
        eventTitle: cert.eventTitle,
        eventId: cert.eventId,
        eventDate: cert.eventDate,
        issueDate: cert.issuedAt,
        issuedAt: cert.issuedAt,
        organizerName: cert.organizerName,
        verificationCode: cert.verificationCode,
        venue: event?.venue || "Campus Main Hall",
        category: event?.category || "Workshop",
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
