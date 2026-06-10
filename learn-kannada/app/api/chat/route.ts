import OpenAI from "openai";
import { NextRequest } from "next/server";
import { roleplayPrompts } from "@/content/roleplayPrompts";

export async function POST(req: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return new Response("GEMINI_API_KEY is not configured", { status: 500 });
  }

  const client = new OpenAI({
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    apiKey: process.env.GEMINI_API_KEY,
  });
  const { messages, unitId } = await req.json() as {
    messages: { role: "user" | "assistant"; content: string }[];
    unitId: string;
  };

  const character = roleplayPrompts[unitId];
  if (!character) {
    return new Response("Unknown unit", { status: 400 });
  }

  let stream;
  try {
    stream = await client.chat.completions.create({
      model: process.env.GEMINI_CHAT_MODEL ?? "gemini-3.1-flash-lite",
      max_tokens: 80,
      messages: [
        { role: "system", content: character.systemPrompt },
        ...messages,
      ],
      stream: true,
    });
  } catch (error) {
    const status = error instanceof OpenAI.APIError ? error.status : 502;
    const message =
      status === 429
        ? "Gemini returned 429. The selected model is rate limited or out of free quota."
        : "Gemini chat request failed.";

    return new Response(message, { status });
  }

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? "";
          if (text) controller.enqueue(new TextEncoder().encode(text));
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
