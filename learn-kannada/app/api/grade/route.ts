import OpenAI from "openai";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const client = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
  });
  const { prompt, correctAnswer, userAnswer } = await req.json() as {
    prompt: string;
    correctAnswer: string;
    userAnswer: string;
  };

  const response = await client.chat.completions.create({
    model: "google/gemma-4-31b-it:free",
    max_tokens: 128,
    messages: [
      {
        role: "system",
        content: `You grade Kannada fill-in-the-blank exercises. Accept transliteration variations and minor typos as correct. Return ONLY valid JSON: {"correct": boolean, "feedback": "one short sentence"}`,
      },
      {
        role: "user",
        content: `Exercise: ${prompt}\nCorrect answer: ${correctAnswer}\nStudent's answer: ${userAnswer}\n\nReturn JSON only.`,
      },
    ],
  });

  const text = response.choices[0]?.message?.content ?? "{}";

  try {
    const result = JSON.parse(text) as { correct: boolean; feedback: string };
    return Response.json(result);
  } catch {
    const correct = userAnswer.trim().toLowerCase() === correctAnswer.toLowerCase();
    return Response.json({ correct, feedback: correct ? "Correct!" : `Answer: ${correctAnswer}` });
  }
}
