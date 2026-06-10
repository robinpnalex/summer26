import OpenAI from "openai";
import { NextRequest } from "next/server";
import { roleplayPrompts } from "@/content/roleplayPrompts";

export async function POST(req: NextRequest) {
  const client = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
  });
  const { messages, unitId } = await req.json() as {
    messages: { role: "user" | "assistant"; content: string }[];
    unitId: string;
  };

  const character = roleplayPrompts[unitId];
  if (!character) {
    return new Response("Unknown unit", { status: 400 });
  }

  const stream = await client.chat.completions.create({
    model: "meta-llama/llama-3.2-3b-instruct:free",
    max_tokens: 80,
    messages: [
      { role: "system", content: character.systemPrompt },
      ...messages,
    ],
    stream: true,
  });

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
