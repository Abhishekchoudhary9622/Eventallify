import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { collections, ensureIndexes } from "@/lib/db";
import { EventDoc } from "@/db/schema";
import { getEventImageUrl } from "@/lib/event-images";

export async function GET(request: NextRequest) {
  try {
    await ensureIndexes();
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const upcoming = searchParams.get("upcoming") === "true";
    const statusParam = searchParams.get("status") || "";
    const organizerOnly = searchParams.get("organizerOnly") === "true";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { venue: { $regex: search, $options: "i" } },
      ];
    }
    if (category && category !== "all") {
      filter.category = category;
    }
    if (upcoming) {
      filter.date = { $gte: new Date() };
    }

    const isAdmin = (session?.user as any)?.role === "admin";
    const isOrganizer = (session?.user as any)?.role === "organizer";

    if (organizerOnly && session) {
      filter.createdBy = session.user.id;
      if (statusParam) filter.status = statusParam;
    } else if (statusParam) {
      filter.status = statusParam;
    } else if (!isAdmin) {
      // Students / Public only see published, completed, or approved events
      filter.status = { $in: ["published", "completed", "approved"] };
    }

    const eventsCol = collections.events();
    const [allEvents, total] = await Promise.all([
      eventsCol
        .find(filter)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      eventsCol.countDocuments(filter),
    ]);

    // Fetch user bookmarks & registration counts if logged in
    let userBookmarks = new Set<string>();
    let userRegistrations = new Map<string, string>();

    if (session) {
      const [bks, regs] = await Promise.all([
        collections.bookmarks().find({ userId: session.user.id }).toArray(),
        collections.registrations().find({ userId: session.user.id }).toArray(),
      ]);
      bks.forEach((b) => userBookmarks.add(b.eventId));
      regs.forEach((r) => userRegistrations.set(r.eventId, r.status));
    }

    // Attach registration counts, bookmark flag, and resolved image URLs
    const eventsWithMeta = await Promise.all(
      allEvents.map(async (event) => {
        const count = await collections
          .registrations()
          .countDocuments({ eventId: event.id, status: "confirmed" });

        return {
          ...event,
          imageUrl: getEventImageUrl(event.imageUrl, event.category),
          registrationCount: count,
          isBookmarked: userBookmarks.has(event.id),
          userRegistrationStatus: userRegistrations.get(event.id) || null,
        };
      })
    );

    return NextResponse.json({
      events: eventsWithMeta,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Events fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureIndexes();
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role || "student";
    // Allow admin or organizer to create events (students can also create as draft/pending if permitted)
    const body = await request.json();
    const {
      title,
      shortDescription,
      description,
      date,
      endDate,
      venue,
      locationDetails,
      category,
      imageUrl,
      registrationDeadline,
      maxParticipants,
      organizerName,
      organizerContact,
      schedule,
      rules,
      prizes,
      speakers,
      faqs,
      allowWaitlist,
      customQuestions,
      status: requestedStatus,
    } = body;

    if (!title || !description || !date || !venue || !registrationDeadline) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Admins can publish directly; Organizers submit for approval or save as draft
    let initialStatus = requestedStatus || "pending_approval";
    if (userRole === "admin") {
      initialStatus = requestedStatus || "published";
    } else if (initialStatus === "published") {
      initialStatus = "pending_approval";
    }

    const newEvent: EventDoc = {
      id: crypto.randomUUID(),
      title,
      shortDescription: shortDescription || "",
      description,
      date: new Date(date),
      endDate: endDate ? new Date(endDate) : null,
      venue,
      locationDetails: locationDetails || "",
      category: category || "general",
      imageUrl: imageUrl || getEventImageUrl(imageUrl, category),
      registrationDeadline: new Date(registrationDeadline),
      maxParticipants: maxParticipants ? Number(maxParticipants) : null,
      organizerName: organizerName || session.user.name || "Event Organizer",
      organizerContact: organizerContact || session.user.email || "",
      status: initialStatus,
      schedule: schedule || [],
      rules: rules || [],
      prizes: prizes || [],
      speakers: speakers || [],
      faqs: faqs || [],
      allowWaitlist: allowWaitlist !== false,
      customQuestions: customQuestions || [],
      createdBy: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await collections.events().insertOne(newEvent);

    // If submitted for approval, create a notification for admins
    if (initialStatus === "pending_approval") {
      const adminUsers = await collections.users().find({ role: "admin" }).toArray();
      for (const admin of adminUsers) {
        await collections.notifications().insertOne({
          id: crypto.randomUUID(),
          userId: admin.id || admin._id!,
          title: "New Event Pending Approval",
          message: `"${title}" has been submitted for review by ${session.user.name}.`,
          type: "approval",
          link: `/admin/approvals`,
          read: false,
          createdAt: new Date(),
        });
      }
    }

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error("Event creation error:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
