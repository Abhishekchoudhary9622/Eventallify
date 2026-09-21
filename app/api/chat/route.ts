import Groq from "groq-sdk";
import { NextRequest } from "next/server";
import { getGroqApiKeys } from "@/lib/ai";

const SYSTEM_PROMPT = `You are the Eventallify Assistant, a helpful AI chatbot for a modern college event management platform.
Eventallify lets students discover, register for, and track campus events, with QR-code digital passes,
calendar views, verifiable certificates, and admin-posted announcements. Admins and organizers can create events, manage registrations, track attendance, and send announcements.

You are friendly, knowledgeable, and proactive:
- You help with: campus event planning, registration guidance, digital pass FAQs, writing event announcements, advice for hackathons/workshops, and general questions.
- Keep answers engaging, helpful, and concise.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "messages must be an array" }),
        { status: 400 }
      );
    }

    const keys = getGroqApiKeys();
    if (!keys.length) {
      console.error("[AI Chat] No GROQ API keys configured");
      return new Response(
        JSON.stringify({ error: "Server misconfigured: missing GROQ API key" }),
        { status: 500 }
      );
    }

    const models = ["qwen/qwen3.8-27b", "groq/compound-mini", "llama-3.3-70b-versatile", "llama-3.1-8b-instant"];
    let stream: any = null;
    let lastError: any = null;

    keyLoop: for (const key of keys) {
      for (const model of models) {
        try {
          const client = new Groq({ apiKey: key });
          stream = await client.chat.completions.create({
            model,
            messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
            stream: true,
            temperature: 0.7,
          });
          if (stream) break keyLoop;
        } catch (err: any) {
          lastError = err;
          if (!err?.message?.includes("does not exist") && !err?.message?.includes("model_not_found")) {
            break; // Try next key
          }
        }
      }
    }

    if (!stream) {
      console.error("[AI Chat] All Groq keys failed to start stream:", lastError);
      return new Response(
        JSON.stringify({ error: "AI service currently unavailable. Please try again." }),
        { status: 500 }
      );
    }

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
          console.error("[AI Chat] Streaming chunk error:", err);
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
    console.error("[AI Chat] API error:", err);
    return new Response(JSON.stringify({ error: "Something went wrong" }), {
      status: 500,
    });
  }
}