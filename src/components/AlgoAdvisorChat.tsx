import { useState, useRef, useEffect } from "react";
import type { AdvisorMessage } from "../types";
import {
  streamAlgoAdvisorResponse,
  HAS_ALGO_ADVISOR,
} from "../lib/algo-advisor";

interface Props {
  task: string | null;
  size: string | null;
  interp: string | null;
  features: string | null;
  topResults: string[];
}

const SUGGESTIONS = [
  "I have 10K labelled samples — which algorithm fits best?",
  "I need to explain predictions to stakeholders",
  "My dataset has 200+ features, many correlated",
  "Which is faster to train: Random Forest or XGBoost?",
];

export function AlgoAdvisorChat({
  task,
  size,
  interp,
  features,
  topResults,
}: Props) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<AdvisorMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lastSentRef = useRef<string>("");

  useEffect(() => {
    if (messages.length === 0) return;
    const el = containerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  if (!HAS_ALGO_ADVISOR) return null;

  async function sendMessage(text: string) {
    if (!text.trim() || isStreaming) return;

    const userMsg: AdvisorMessage = { role: "user", content: text.trim() };
    const updated = [...messages, userMsg];
    lastSentRef.current = text.trim();
    setMessages(updated);
    setInput("");
    setIsStreaming(true);
    setError(null);
    setMessages([...updated, { role: "assistant", content: "" }]);

    try {
      let accumulated = "";
      const stream = streamAlgoAdvisorResponse(updated, {
        task,
        size,
        interp,
        features,
        topResults,
      });
      for await (const chunk of stream) {
        accumulated += chunk;
        setMessages([...updated, { role: "assistant", content: accumulated }]);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      setMessages(updated);
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

  const chatContent = (
    <div className="border-t border-zinc-100 dark:border-zinc-800 flex flex-col">
      {/* Messages */}
      <div
        ref={containerRef}
        className={`overflow-y-auto p-4 space-y-3 ${expanded ? "min-h-[350px] max-h-[70vh]" : "min-h-[200px] max-h-[450px]"}`}
      >
        {messages.length === 0 && (
          <div className="space-y-1.5">
            <p
              className={`font-semibold text-zinc-400 uppercase tracking-wide mb-2 ${expanded ? "text-xs" : "text-xs"}`}
            >
              Ask about your ML problem:
            </p>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className={`block w-full text-left px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:text-violet-700 dark:hover:text-violet-300 transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-700 ${expanded ? "text-sm px-3 py-2" : "text-xs"}`}
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
              className={`max-w-[90%] px-3 py-2 rounded-xl leading-relaxed whitespace-pre-wrap ${expanded ? "text-sm" : "text-xs"} ${
                msg.role === "user"
                  ? "bg-violet-600 text-white rounded-br-sm"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-bl-sm"
              }`}
            >
              {msg.content}
              {msg.role === "assistant" &&
                isStreaming &&
                i === messages.length - 1 && (
                  <span className="inline-block w-1 h-3 bg-zinc-400 dark:bg-zinc-500 ml-0.5 animate-pulse rounded-sm" />
                )}
            </div>
          </div>
        ))}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 px-2.5 py-2 rounded-lg border border-red-200 dark:border-red-800 flex items-start justify-between gap-2">
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={() => {
                setError(null);
                sendMessage(lastSentRef.current);
              }}
              className="shrink-0 text-xs px-2.5 py-1 rounded bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors font-medium cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-zinc-100 dark:border-zinc-800">
        <div className="flex gap-1.5">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your data or ask a question…"
            disabled={isStreaming}
            rows={expanded ? 2 : 1}
            className={`flex-1 resize-none px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50 ${expanded ? "text-sm px-3 py-2" : "text-xs"}`}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isStreaming}
            className={`bg-violet-600 hover:bg-violet-700 disabled:bg-zinc-200 dark:disabled:bg-zinc-700 disabled:text-zinc-400 text-white rounded-lg transition-colors font-medium cursor-pointer disabled:cursor-not-allowed ${expanded ? "px-4 py-2 text-sm" : "px-3 py-1.5 text-xs"}`}
          >
            {isStreaming ? "…" : "Ask"}
          </button>
        </div>
      </div>
    </div>
  );

  // Expanded: full-screen modal overlay
  if (expanded) {
    return (
      <>
        {/* Inline collapsed placeholder */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
          <button
            onClick={() => setExpanded(true)}
            className="w-full flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">🤖</span>
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Algorithm Advisor
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium">
                AI
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 font-medium">
                Expanded
              </span>
            </div>
          </button>
        </div>

        {/* Modal overlay */}
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-lg">🤖</span>
                <span className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  Algorithm Advisor
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium">
                  AI
                </span>
              </div>
              <button
                onClick={() => setExpanded(false)}
                className="p-2 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Collapse"
                aria-label="Collapse advisor chat"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            {chatContent}
          </div>
        </div>
      </>
    );
  }

  // Default: inline collapsible
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
      {/* Toggle header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">🤖</span>
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Algorithm Advisor
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium">
            AI
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <>
          {/* Expand button */}
          <div className="flex justify-end px-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <button
              onClick={() => setExpanded(true)}
              className="text-xs px-2.5 py-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer flex items-center gap-1"
              title="Expand to full size"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
                />
              </svg>
              Expand
            </button>
          </div>
          {chatContent}
        </>
      )}
    </div>
  );
}
