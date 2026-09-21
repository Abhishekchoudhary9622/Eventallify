import Groq from "groq-sdk";
import { EventDoc } from "@/db/schema";

const groqApiKey = process.env.GROQ_API_KEY?.trim();
const groq = groqApiKey ? new Groq({ apiKey: groqApiKey }) : null;

export async function getAIRecommendations({
  userInterests = [],
  userRegisteredCategories = [],
  upcomingEvents = [],
}: {
  userInterests?: string[];
  userRegisteredCategories?: string[];
  upcomingEvents: EventDoc[];
}) {
  if (!upcomingEvents.length) return [];

  // If Groq is available, ask for smart scoring and personalized reason
  if (groq) {
    try {
      const prompt = `
You are Eventallify AI, a smart campus event assistant.
User interests: ${userInterests.join(", ") || "General campus events, tech, cultural, sports"}
User registered categories: ${userRegisteredCategories.join(", ") || "None"}
Available upcoming events:
${upcomingEvents
  .map(
    (e, idx) =>
      `[${idx}] ID: ${e.id} | Title: "${e.title}" | Category: ${e.category} | Venue: ${e.venue}`
  )
  .join("\n")}

Select the top 3-4 most relevant events for this student. Return JSON array strictly in this format:
[
  { "id": "event-id-here", "matchReason": "Recommended because you are interested in AI and tech workshops." }
]
Only valid JSON without markdown wrapping.
`;

      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content);
        const list = Array.isArray(parsed) ? parsed : parsed.recommendations || [];
        return list;
      }
    } catch (err) {
      console.warn("[AI] Groq recommendation fallback:", err);
    }
  }

  // Smart Algorithmic Fallback
  const preferredSet = new Set([
    ...userInterests.map((i) => i.toLowerCase()),
    ...userRegisteredCategories.map((c) => c.toLowerCase()),
  ]);

  const scored = upcomingEvents.map((event) => {
    let score = 0;
    const cat = event.category.toLowerCase();
    const title = event.title.toLowerCase();

    if (preferredSet.has(cat)) score += 5;
    for (const interest of preferredSet) {
      if (title.includes(interest)) score += 3;
    }

    // Default diversity boost
    score += Math.random() * 2;

    const matchReason = preferredSet.has(cat)
      ? `Matches your interest in ${event.category} events`
      : `Popular upcoming event on campus`;

    return {
      id: event.id,
      score,
      matchReason,
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 4).map(({ id, matchReason }) => ({ id, matchReason }));
}

export async function generateAIDescription({
  title,
  category,
  targetAudience,
}: {
  title: string;
  category: string;
  targetAudience?: string;
}) {
  if (groq) {
    try {
      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content:
              "You write engaging, professional descriptions for college campus events. Return a clean 2-3 paragraph description suitable for a student platform.",
          },
          {
            role: "user",
            content: `Write an engaging description for a college event titled "${title}", Category: "${category}", Target audience: "${targetAudience || "All college students"}".`,
          },
        ],
        temperature: 0.7,
      });

      const text = response.choices[0]?.message?.content;
      if (text) return text.trim();
    } catch (e) {
      console.warn("[AI] Groq description fallback:", e);
    }
  }

  return `Join us for "${title}", one of this semester's most anticipated ${category} events on campus! Designed specifically for passionate students and enthusiasts, this event offers a hands-on environment to learn, network, and showcase your skills.\n\nWhether you are looking to gain practical industry insights, collaborate with peers on exciting projects, or simply experience the vibrant campus spirit, "${title}" is the perfect opportunity. Attendees will have the chance to interact directly with mentors and peers.\n\nSeats are limited to maintain quality interaction. Register now to secure your digital pass and be part of this memorable campus milestone!`;
}

export async function suggestAISchedule({
  title,
  category,
}: {
  title: string;
  category: string;
}) {
  if (groq) {
    try {
      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content:
              "You are an event planning assistant. Return a JSON array of 4-6 agenda items with keys: time (string), activity (string), speaker (optional string). Output ONLY JSON.",
          },
          {
            role: "user",
            content: `Suggest a realistic event agenda schedule for: "${title}" (${category}).`,
          },
        ],
        temperature: 0.5,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content);
        const schedule = Array.isArray(parsed) ? parsed : parsed.schedule || parsed.items || [];
        if (schedule.length) return schedule;
      }
    } catch (e) {
      console.warn("[AI] Groq schedule fallback:", e);
    }
  }

  return [
    { time: "09:30 AM", activity: "Attendee Check-in & Welcome Kit Distribution", speaker: "Organizing Team" },
    { time: "10:00 AM", activity: "Opening Keynote & Objectives", speaker: "Faculty Advisor & Lead Speaker" },
    { time: "11:30 AM", activity: "Hands-on Workshop / Main Session Track", speaker: "Guest Mentors" },
    { time: "01:00 PM", activity: "Networking Lunch & Interactive Showcase", speaker: "" },
    { time: "02:30 PM", activity: "Project Presentations & Judging Round", speaker: "Review Panel" },
    { time: "04:30 PM", activity: "Awards, Certificate Distribution & Closing", speaker: "Organizers" },
  ];
}

export async function generateAIFaqs({
  title,
  category,
}: {
  title: string;
  category: string;
}) {
  return [
    {
      question: "Who is eligible to participate in this event?",
      answer: "All currently enrolled students with a valid college email address are welcome to register and participate.",
    },
    {
      question: "Is there any registration fee?",
      answer: "No, this event is completely free for college students. Registration is required to reserve your digital pass.",
    },
    {
      question: "What do I need to bring on the day of the event?",
      answer: "Please bring your student ID card and your Digital Event Pass (accessible on your Eventallify account with the QR code). If it is a tech workshop/hackathon, also bring your laptop and charger.",
    },
    {
      question: "Will I receive a certificate of participation?",
      answer: "Yes! Verified attendees who check in via their QR code will receive an official verifiable digital certificate issued directly to their Eventallify profile.",
    },
  ];
}

export async function generateAIAnnouncement({
  eventTitle,
  updateType = "general",
}: {
  eventTitle: string;
  updateType?: string;
}) {
  if (updateType === "venue") {
    return {
      title: `Venue Update for ${eventTitle}`,
      content: `Please note that the venue for ${eventTitle} has been updated. Please check the event page for the updated room and hall details. See you there!`,
      priority: "high" as const,
    };
  }
  if (updateType === "reminder") {
    return {
      title: `Reminder: ${eventTitle} is happening soon!`,
      content: `Get ready! ${eventTitle} is taking place soon. Make sure to have your Digital QR Pass ready for entrance check-in.`,
      priority: "normal" as const,
    };
  }
  return {
    title: `Important Update regarding ${eventTitle}`,
    content: `We're excited to welcome all registered students to ${eventTitle}. Please arrive 15 minutes prior to the start time for seamless check-in.`,
    priority: "normal" as const,
  };
}
