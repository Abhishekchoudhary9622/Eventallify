import Groq from "groq-sdk";
import { NextRequest } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are the Eventallify Assistant, a helpful chatbot for a college event management platform.
Eventallify lets students discover, register for, and track campus events, with QR-code tickets,
a calendar view, and admin-posted announcements. Admins can create events, manage registrations,
and send announcements.

You currently do NOT have access to live event data or user accounts, so:
- Don't claim to know specific event dates, times, or registration counts.
- If asked about specific live data, tell the user to check the Events or Calendar page,
  or their Dashboard.
- You CAN help with: general questions about how the platform works, event-planning advice,
  writing announcement text, troubleshooting registration/login issues at a general level,
  and friendly small talk.
Keep answers concise and friendly.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "messages must be an array" }),
        { status: 400 },
      );
    }

    if (!process.env.GROQ_API_KEY) {
      console.error("GROQ_API_KEY is not set");
      return new Response(
        JSON.stringify({ error: "Server misconfigured: missing API key" }),
        { status: 500 },
      );
    }

    const stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      stream: true,
      temperature: 0.7,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || "";
            if (text) controller.enqueue(encoder.encode(text));
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("Chat API error:", err);
    return new Response(JSON.stringify({ error: "Something went wrong" }), {
      status: 500,
    });
  }
}