import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  generateAIDescription,
  suggestAISchedule,
  generateAIFaqs,
  generateAIAnnouncement,
} from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, title, category, targetAudience, updateType } = body;

    if (!title) {
      return NextResponse.json({ error: "Event title is required" }, { status: 400 });
    }

    const cleanCategory = category || "general";

    if (type === "description") {
      const description = await generateAIDescription({
        title,
        category: cleanCategory,
        targetAudience,
      });
      return NextResponse.json({ result: description });
    }

    if (type === "schedule") {
      const schedule = await suggestAISchedule({
        title,
        category: cleanCategory,
      });
      return NextResponse.json({ result: schedule });
    }

    if (type === "faqs") {
      const faqs = await generateAIFaqs({
        title,
        category: cleanCategory,
      });
      return NextResponse.json({ result: faqs });
    }

    if (type === "announcement") {
      const announcement = await generateAIAnnouncement({
        eventTitle: title,
        updateType,
      });
      return NextResponse.json({ result: announcement });
    }

    return NextResponse.json({ error: "Invalid generator type" }, { status: 400 });
  } catch (error) {
    console.error("AI generator error:", error);
    return NextResponse.json(
      { error: "AI generation failed" },
      { status: 500 }
    );
  }
}
