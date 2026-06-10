"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import type { RoleplayCharacter } from "@/content/roleplayPrompts";

type Message = { role: "user" | "assistant"; content: string };

export default function RoleplayChat({
  unitId,
  character,
}: {
  unitId: string;
  character: RoleplayCharacter;
}) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: character.openingLine },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    // Add empty assistant message that we'll stream into
    setMessages([...next, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, unitId }),
      });

      if (!res.body) throw new Error("No stream");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last.role === "assistant") {
            return [...prev.slice(0, -1), { ...last, content: last.content + chunk }];
          }
          return prev;
        });
      }
    } catch {
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last.role === "assistant" && last.content === "") {
          return [...prev.slice(0, -1), { role: "assistant", content: "Sorry, something went wrong. Check your API key." }];
        }
        return prev;
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      <header className="bg-amber-500 text-white px-4 py-3 flex items-center gap-3">
        <Link href="/" className="text-amber-100 hover:text-white text-sm">← Home</Link>
        <div>
          <p className="font-bold leading-tight">{character.name}</p>
          <p className="text-amber-100 text-xs">{character.description}</p>
        </div>
        <span className="ml-auto text-2xl">🎭</span>
      </header>

      <div className="bg-amber-100 border-b border-amber-200 px-4 py-2 text-xs text-amber-800">
        Practice real Kannada conversation — there are no wrong answers here. Just talk!
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 max-w-lg mx-auto w-full">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                msg.role === "user"
                  ? "bg-amber-500 text-white rounded-br-sm"
                  : "bg-white border border-amber-100 text-gray-800 rounded-bl-sm shadow-sm"
              }`}
            >
              {msg.content || (
                <span className="flex gap-1">
                  <span className="animate-bounce delay-0">•</span>
                  <span className="animate-bounce delay-75">•</span>
                  <span className="animate-bounce delay-150">•</span>
                </span>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="sticky bottom-0 bg-white border-t border-amber-100 px-4 py-3">
        <div className="flex gap-2 max-w-lg mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type in Kannada or English..."
            disabled={loading}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 disabled:bg-gray-50"
            autoFocus
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            className="px-4 py-2.5 bg-amber-500 text-white rounded-xl font-medium text-sm hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
