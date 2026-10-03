"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, Sparkles, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Quais eventos acontecem este mês?",
  "Tem feirinha de artesanato em Maceió?",
  "Como faço para anunciar minha feirinha?",
];

export function AiChatWidget({ userName }: { userName: string | null }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Olá! Sou a FeiraIA, a assistente do FeirAL. Posso ajudar você a encontrar feirinhas, eventos e tirar dúvidas sobre a plataforma.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [engine, setEngine] = useState<"llm" | "local" | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;

    const history = messages.filter((m) => m.role !== "assistant" || messages.indexOf(m) > 0);
    setMessages((prev) => [...prev, { role: "user", content }]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/ia/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, history }),
      });
      const data = (await response.json()) as {
        reply?: string;
        error?: string;
        engine?: "llm" | "local";
      };
      if (data.engine) setEngine(data.engine);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply ?? data.error ?? "Não consegui responder agora." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Tive um problema de conexão. Tente novamente." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div
        className={cn(
          "fixed bottom-24 right-4 z-50 flex h-[28rem] w-[min(92vw,23rem)] flex-col overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-2xl transition-all duration-200 ease-out sm:right-6 sm:h-[30rem]",
          open ? "visible translate-y-0 scale-100 opacity-100" : "invisible pointer-events-none translate-y-2 scale-[0.98] opacity-0",
        )}
      >
        <div className="flex items-center justify-between gap-2 bg-ink-900 px-4 py-3 text-white">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-500">
              <Sparkles size={16} />
            </span>
            <div>
              <p className="text-sm font-semibold leading-tight">FeiraIA</p>
              <p className="text-[11px] text-white/70">
                {engine === "llm"
                  ? "Assistente de IA"
                  : engine === "local"
                    ? "Assistente local (offline)"
                    : "Assistente virtual"}
              </p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} aria-label="Fechar chat" className="rounded p-1 transition-colors hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        <div ref={scrollRef} className="thin-scroll flex-1 space-y-3 overflow-y-auto bg-ink-50 p-3">
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <div
                className={
                  m.role === "user"
                    ? "max-w-[85%] rounded-2xl rounded-br-sm bg-brand-500 px-3 py-2 text-sm text-white"
                    : "max-w-[85%] rounded-2xl rounded-bl-sm bg-white px-3 py-2 text-sm text-ink-700 shadow-sm"
                }
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading ? (
            <div className="flex justify-start">
              <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-sm text-ink-500 shadow-sm">
                <Loader2 size={14} className="animate-spin" /> digitando...
              </div>
            </div>
          ) : null}
        </div>

        <div
          className={cn(
            "grid transition-all duration-200 ease-out",
            messages.length <= 1 ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          )}
        >
          <div inert={messages.length > 1} className="overflow-hidden">
            <div className="flex flex-wrap gap-1.5 border-t border-ink-100 bg-white px-3 py-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-ink-200 px-2.5 py-1 text-[11px] text-ink-600 transition-colors hover:bg-ink-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
          className="flex items-center gap-2 border-t border-ink-200 bg-white p-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={userName ? `Pergunte algo, ${userName.split(" ")[0]}...` : "Escreva sua pergunta..."}
            className="flex-1 rounded-lg border border-ink-300 px-3 py-2 text-sm focus-ring"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="grid h-9 w-9 place-items-center rounded-lg bg-brand-500 text-white transition-all duration-150 hover:bg-brand-600 active:scale-95 disabled:opacity-50"
            aria-label="Enviar"
          >
            <Send size={16} />
          </button>
        </form>
        </div>

      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-4 z-50 inline-flex items-center gap-2 rounded-full bg-ink-900 px-4 py-3 text-sm font-semibold text-white shadow-xl transition-transform hover:scale-105 active:scale-95 sm:right-6"
        aria-label="Abrir assistente FeiraIA"
      >
        <MessageCircle size={18} />
        <span className="hidden sm:inline">Fale com a FeiraIA</span>
      </button>
    </>
  );
}