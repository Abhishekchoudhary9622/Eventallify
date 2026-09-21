import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { collections, ensureIndexes } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    await ensureIndexes();
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userData = await collections.users().findOne({
      $or: [{ id: session.user.id }, { _id: session.user.id }],
    });

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user stats (registrations, certificates, organized)
    const [registeredCount, attendedCount, certCount, organizedCount] = await Promise.all([
      collections.registrations().countDocuments({ userId: session.user.id, status: "confirmed" }),
      collections.registrations().countDocuments({ userId: session.user.id, checkedIn: true }),
      collections.certificates().countDocuments({ userId: session.user.id }),
      collections.events().countDocuments({ createdBy: session.user.id }),
    ]);

    return NextResponse.json({
      id: userData.id || userData._id,
      name: userData.name,
      email: userData.email,
      role: userData.role || "student",
      image: userData.image,
      department: userData.department || "",
      collegeYear: userData.collegeYear || "",
      bio: userData.bio || "",
      interests: userData.interests || [],
      notificationPreferences: userData.notificationPreferences || {
        email: true,
        reminders: true,
        announcements: true,
      },
      stats: {
        registeredCount,
        attendedCount,
        certCount,
        organizedCount,
      },
      createdAt: userData.createdAt,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await ensureIndexes();
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      image,
      department,
      collegeYear,
      bio,
      interests,
      notificationPreferences,
    } = body;

    const updateFields: Record<string, any> = {
      updatedAt: new Date(),
    };
    if (name !== undefined) updateFields.name = name;
    if (image !== undefined) updateFields.image = image;
    if (department !== undefined) updateFields.department = department;
    if (collegeYear !== undefined) updateFields.collegeYear = collegeYear;
    if (bio !== undefined) updateFields.bio = bio;
    if (interests !== undefined) updateFields.interests = interests;
    if (notificationPreferences !== undefined) {
      updateFields.notificationPreferences = notificationPreferences;
    }

    const updated = await collections.users().findOneAndUpdate(
      {
        $or: [{ id: session.user.id }, { _id: session.user.id }],
      },
      { $set: updateFields },
      { returnDocument: "after" }
    );

    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update user profile" },
      { status: 500 }
    );
  }
}
