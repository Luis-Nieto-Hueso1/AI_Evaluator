import { useState, useRef, useEffect } from "react";
import type {
  AdvisorMessage,
  HardwareProfile,
  CompatibleModel,
} from "../types";
import { streamAdvisorResponse } from "../lib/advisor";
import { streamHfAdvisorResponse } from "../lib/hf-advisor";

const HAS_CLAUDE = Boolean(import.meta.env.VITE_ANTHROPIC_API_KEY);
const HAS_HF = Boolean(import.meta.env.VITE_HF_TOKEN);

// Auto-detect which backend to use
type Backend = "claude" | "hf" | null;
const BACKEND: Backend = HAS_CLAUDE ? "claude" : HAS_HF ? "hf" : null;

interface Props {
  hardware: HardwareProfile;
  compatible: CompatibleModel[];
  hasApiKey: boolean; // kept for parent compatibility — component auto-detects
}

const SUGGESTIONS = [
  "Which model is best for generating synthetic training data?",
  "I want to build a local coding assistant — what do you recommend?",
  "What's the fastest model I can run for simple chat?",
  "Which model handles long documents best on my hardware?",
];

export function AdvisorChat({ hardware, compatible }: Props) {
  const [messages, setMessages] = useState<AdvisorMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lastSentRef = useRef<string>("");

  useEffect(() => {
    if (messages.length === 0) return;
    const el = messagesContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  async function sendMessage(text: string) {
    if (!text.trim() || isStreaming || !BACKEND) return;

    const userMessage: AdvisorMessage = { role: "user", content: text.trim() };
    const updatedMessages = [...messages, userMessage];
    lastSentRef.current = text.trim();
    setMessages(updatedMessages);
    setInput("");
    setIsStreaming(true);
    setError(null);

    setMessages([...updatedMessages, { role: "assistant", content: "" }]);

    try {
      let accumulated = "";
      const stream =
        BACKEND === "claude"
          ? streamAdvisorResponse(updatedMessages, hardware, compatible)
          : streamHfAdvisorResponse(updatedMessages, hardware, compatible);

      for await (const chunk of stream) {
        accumulated += chunk;
        setMessages([
          ...updatedMessages,
          { role: "assistant", content: accumulated },
        ]);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      setMessages(updatedMessages);
    } finally {
      setIsStreaming(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  // No API key at all
  if (!BACKEND) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
          AI Advisor
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
          Get personalised model recommendations for your use case.
        </p>
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-sm text-amber-800 dark:text-amber-300 space-y-1">
          <p>
            Add a{" "}
            <code className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1 rounded">
              VITE_HF_TOKEN
            </code>{" "}
            (free) or{" "}
            <code className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1 rounded">
              VITE_ANTHROPIC_API_KEY
            </code>{" "}
            to{" "}
            <code className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1 rounded">
              .env.local
            </code>{" "}
            to enable the advisor.
          </p>
        </div>
      </div>
    );
  }

  if (compatible.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
          AI Advisor
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Set your hardware profile first to get recommendations.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm flex flex-col">
      <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          AI Advisor
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          {BACKEND === "claude"
            ? "Ask about use cases — powered by Claude"
            : "Ask about use cases — powered by Qwen 2.5 (free via HuggingFace)"}
        </p>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px] max-h-[400px]"
      >
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-3">
              Try asking:
            </p>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="block w-full text-left text-sm px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:text-violet-700 dark:hover:text-violet-300 transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-700"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] text-sm px-4 py-2.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-violet-600 text-white rounded-br-sm"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-bl-sm"
              }`}
            >
              {msg.content}
              {msg.role === "assistant" &&
                isStreaming &&
                i === messages.length - 1 && (
                  <span className="inline-block w-1 h-3.5 bg-zinc-400 dark:bg-zinc-500 ml-0.5 animate-pulse rounded-sm" />
                )}
            </div>
          </div>
        ))}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 px-3 py-2.5 rounded-xl border border-red-200 dark:border-red-800 flex items-start justify-between gap-3">
            <p className="text-sm text-red-600 dark:text-red-400 leading-snug">
              {error}
            </p>
            <button
              onClick={() => {
                setError(null);
                sendMessage(lastSentRef.current);
              }}
              className="shrink-0 text-xs px-2.5 py-1 rounded-lg bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors font-medium cursor-pointer border border-red-200 dark:border-red-800"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-zinc-100 dark:border-zinc-800">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What use case do you have in mind?"
            disabled={isStreaming}
            rows={1}
            className="flex-1 resize-none text-sm px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:opacity-50"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isStreaming}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:bg-zinc-200 dark:disabled:bg-zinc-700 disabled:text-zinc-400 text-white rounded-xl transition-colors font-medium text-sm cursor-pointer disabled:cursor-not-allowed"
          >
            {isStreaming ? "…" : "Ask"}
          </button>
        </div>
        <p className="text-xs text-zinc-400 mt-2">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
