import { useState, useMemo } from "react";
import type { Model } from "../types";

interface TimelineEvent {
  date: string; // YYYY-MM
  name: string;
  org: string;
  params: string;
  color: string;
  highlight: boolean;
  description: string;
  inDb?: boolean; // true if this model is in our static database
  isLive?: boolean; // true if auto-fetched from HF/Ollama
  hfUrl?: string;
}

const EVENTS: TimelineEvent[] = [
  {
    date: "2022-11",
    name: "ChatGPT",
    org: "OpenAI",
    params: "~175B",
    color: "#10a37f",
    highlight: true,
    description:
      "Launched the LLM era. First model to make conversational AI mainstream.",
  },
  {
    date: "2023-02",
    name: "LLaMA 1",
    org: "Meta",
    params: "7–65B",
    color: "#3b82f6",
    highlight: true,
    description:
      "First powerful open-weight model. Leaked weights sparked the open-source movement.",
  },
  {
    date: "2023-03",
    name: "Stanford Alpaca",
    org: "Stanford",
    params: "7B",
    color: "#8b5cf6",
    highlight: false,
    description:
      "First instruction-tuned LLaMA derivative. Showed fine-tuning on synthetic data works.",
  },
  {
    date: "2023-04",
    name: "Vicuna",
    org: "LMSYS",
    params: "13B",
    color: "#8b5cf6",
    highlight: false,
    description:
      "Strong chat model fine-tuned on ShareGPT conversations. 90% of GPT-4 on MT-Bench.",
  },
  {
    date: "2023-06",
    name: "Falcon",
    org: "TII",
    params: "7–40B",
    color: "#f59e0b",
    highlight: false,
    description:
      "First truly open commercial model (Apache 2.0). Released with a large curated dataset.",
  },
  {
    date: "2023-07",
    name: "LLaMA 2",
    org: "Meta",
    params: "7–70B",
    color: "#3b82f6",
    highlight: true,
    description:
      "Commercial use permitted. Became the default open-source base model for 2023.",
    inDb: false,
  },
  {
    date: "2023-09",
    name: "Mistral 7B",
    org: "Mistral AI",
    params: "7B",
    color: "#f97316",
    highlight: true,
    description:
      "Outperformed LLaMA 2 13B despite being half the size. Sliding window attention.",
    inDb: true,
  },
  {
    date: "2023-11",
    name: "Orca 2",
    org: "Microsoft",
    params: "7–13B",
    color: "#6366f1",
    highlight: false,
    description:
      "Showed smaller models can reason well with careful training on reasoning traces.",
  },
  {
    date: "2023-12",
    name: "Mixtral 8x7B",
    org: "Mistral AI",
    params: "46.7B",
    color: "#f97316",
    highlight: true,
    description:
      "Mixture-of-Experts breakthrough — 46.7B params but only 12.9B active per token.",
    inDb: true,
  },
  {
    date: "2023-12",
    name: "Phi-2",
    org: "Microsoft",
    params: "2.7B",
    color: "#8b5cf6",
    highlight: false,
    description:
      "Tiny model trained on synthetic 'textbook quality' data. Surprisingly strong at reasoning.",
  },
  {
    date: "2024-01",
    name: "DeepSeek Coder",
    org: "DeepSeek",
    params: "6.7–33B",
    color: "#ef4444",
    highlight: false,
    description:
      "Coding-specialist model that surpassed GPT-3.5 on HumanEval benchmarks.",
  },
  {
    date: "2024-02",
    name: "Gemma",
    org: "Google",
    params: "2–7B",
    color: "#34d399",
    highlight: true,
    description:
      "Google's first truly open model (non-commercial restrictions later lifted). Clean architecture.",
  },
  {
    date: "2024-04",
    name: "LLaMA 3",
    org: "Meta",
    params: "8–70B",
    color: "#3b82f6",
    highlight: true,
    description:
      "Major jump in quality. 8B outperformed many 70B models from 2023.",
    inDb: false,
  },
  {
    date: "2024-05",
    name: "Phi-3 Mini",
    org: "Microsoft",
    params: "3.8B",
    color: "#8b5cf6",
    highlight: false,
    description:
      "Best small model at launch. 128K context, strong reasoning in 3.8B.",
    inDb: false,
  },
  {
    date: "2024-06",
    name: "Qwen 2",
    org: "Alibaba",
    params: "0.5–72B",
    color: "#06b6d4",
    highlight: false,
    description:
      "Strong multilingual model with excellent coding. Full family from 0.5B to 72B.",
  },
  {
    date: "2024-07",
    name: "LLaMA 3.1",
    org: "Meta",
    params: "8–405B",
    color: "#3b82f6",
    highlight: true,
    description:
      "First open-source frontier model (405B). 128K context across the full family.",
    inDb: true,
  },
  {
    date: "2024-09",
    name: "Gemma 2",
    org: "Google",
    params: "2–27B",
    color: "#34d399",
    highlight: false,
    description:
      "Novel architecture with sliding window + global attention. Strong reasoning per parameter.",
    inDb: true,
  },
  {
    date: "2024-09",
    name: "Qwen 2.5",
    org: "Alibaba",
    params: "0.5–72B",
    color: "#06b6d4",
    highlight: true,
    description:
      "Massive leap in coding and math. 72B rivals frontier closed models.",
    inDb: true,
  },
  {
    date: "2024-09",
    name: "LLaMA 3.2",
    org: "Meta",
    params: "1–11B",
    color: "#3b82f6",
    highlight: false,
    description:
      "Multimodal vision models (11B) plus ultra-small 1B/3B edge models.",
    inDb: true,
  },
  {
    date: "2024-11",
    name: "Phi-4 14B",
    org: "Microsoft",
    params: "14B",
    color: "#8b5cf6",
    highlight: false,
    description:
      "Research breakthrough — trained on curated synthetic data, surpasses larger models on STEM.",
    inDb: true,
  },
  {
    date: "2025-01",
    name: "DeepSeek R1",
    org: "DeepSeek",
    params: "1.5–671B",
    color: "#ef4444",
    highlight: true,
    description:
      "Reasoning revolution. Explicit chain-of-thought trained via RL, matches OpenAI o1 at a fraction of cost.",
    inDb: true,
  },
  {
    date: "2025-01",
    name: "Phi-3.5 Mini",
    org: "Microsoft",
    params: "3.8B",
    color: "#8b5cf6",
    highlight: false,
    description:
      "Updated Phi mini with 128K context and improved multilingual support.",
    inDb: true,
  },
  {
    date: "2025-03",
    name: "Gemma 3",
    org: "Google",
    params: "1–27B",
    color: "#34d399",
    highlight: false,
    description:
      "Redesigned architecture with 128K context across entire family. Strong multilingual.",
    inDb: true,
  },
  {
    date: "2025-03",
    name: "Mistral Small 3.1",
    org: "Mistral AI",
    params: "24B",
    color: "#f97316",
    highlight: false,
    description:
      "Vision + text model with best-in-class quality at the 24B size range.",
    inDb: true,
  },
  {
    date: "2025-04",
    name: "Qwen 3",
    org: "Alibaba",
    params: "0.6–235B",
    color: "#06b6d4",
    highlight: true,
    description:
      "Hybrid thinking mode (toggle reasoning on/off). Tops leaderboards at each size tier.",
    inDb: true,
  },
  {
    date: "2025-04",
    name: "LLaMA 4",
    org: "Meta",
    params: "Scout/Maverick",
    color: "#3b82f6",
    highlight: true,
    description:
      "MoE multimodal architecture. Scout (17B active) handles 10M token context.",
    inDb: false,
  },
];

const ORG_COLORS: Record<string, string> = {
  Meta: "#3b82f6",
  "Mistral AI": "#f97316",
  Microsoft: "#8b5cf6",
  Google: "#34d399",
  Alibaba: "#06b6d4",
  DeepSeek: "#ef4444",
  OpenAI: "#10a37f",
  Stanford: "#8b5cf6",
  LMSYS: "#8b5cf6",
  TII: "#f59e0b",
  Cohere: "#14b8a6",
};

function parseDate(d: string): Date {
  const [y, m] = d.split("-").map(Number);
  return new Date(y, m - 1);
}

function formatDate(d: string): string {
  const date = parseDate(d);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

interface Props {
  liveModels?: Model[];
}

export function ModelTimeline({ liveModels = [] }: Props) {
  const [filter, setFilter] = useState<string | null>(null);
  const [highlightOnly, setHighlightOnly] = useState(false);
  const [showLive, setShowLive] = useState(true);
  const [yearZoom, setYearZoom] = useState<string | null>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [horizontal, setHorizontal] = useState(false);

  // Convert live Model objects → TimelineEvent, skip ones with no date or already in static EVENTS
  const liveEvents = useMemo<TimelineEvent[]>(() => {
    const staticNames = new Set(EVENTS.map((e) => e.name.toLowerCase()));
    return liveModels
      .filter((m) => m.releaseDate && !staticNames.has(m.name.toLowerCase()))
      .map((m) => ({
        date: m.releaseDate!,
        name: m.name,
        org: m.family,
        params: `${m.parameters}B`,
        color: ORG_COLORS[m.family] ?? "#8b5cf6",
        highlight: false,
        description: m.description,
        isLive: true,
        hfUrl: m.huggingFace,
      }));
  }, [liveModels]);

  const allEvents = useMemo(() => {
    const combined = showLive ? [...EVENTS, ...liveEvents] : [...EVENTS];
    return combined.sort((a, b) => a.date.localeCompare(b.date));
  }, [liveEvents, showLive]);

  const orgs = useMemo(
    () => Array.from(new Set(allEvents.map((e) => e.org))).sort(),
    [allEvents],
  );

  const years = useMemo(
    () => Array.from(new Set(allEvents.map((e) => e.date.slice(0, 4)))).sort(),
    [allEvents],
  );

  const filtered = allEvents.filter((e) => {
    if (filter && e.org !== filter) return false;
    if (highlightOnly && !e.highlight) return false;
    if (yearZoom && !e.date.startsWith(yearZoom)) return false;
    return true;
  });

  return (
    <div>
      {/* Controls row 1: orgs */}
      <div className="flex flex-wrap gap-2 mb-3 items-center">
        <button
          onClick={() => setFilter(null)}
          className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer ${
            !filter
              ? "bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
          }`}
        >
          All orgs
        </button>
        {orgs.map((org) => (
          <button
            key={org}
            onClick={() => setFilter(filter === org ? null : org)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer ${
              filter === org
                ? "text-white"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
            style={
              filter === org
                ? { backgroundColor: ORG_COLORS[org] ?? "#8b5cf6" }
                : {}
            }
          >
            {org}
          </button>
        ))}
      </div>

      {/* Controls row 2: year zoom + toggles */}
      <div className="flex flex-wrap gap-2 mb-6 items-center">
        <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide mr-1">
          Year:
        </span>
        <button
          onClick={() => setYearZoom(null)}
          className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer ${
            !yearZoom
              ? "bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
          }`}
        >
          All
        </button>
        {years.map((yr) => (
          <button
            key={yr}
            onClick={() => setYearZoom(yearZoom === yr ? null : yr)}
            className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer ${
              yearZoom === yr
                ? "bg-violet-600 text-white"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            {yr}
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setHorizontal((v) => !v)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer border ${
              horizontal
                ? "bg-blue-600 text-white border-blue-600"
                : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-blue-400"
            }`}
          >
            {horizontal ? "↕ Vertical" : "↔ Horizontal"}
          </button>
          {liveModels.length > 0 && (
            <button
              onClick={() => setShowLive((v) => !v)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer border flex items-center gap-1.5 ${
                showLive
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-emerald-400"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
              Live ({liveEvents.length})
            </button>
          )}
          <button
            onClick={() => setHighlightOnly((v) => !v)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer border ${
              highlightOnly
                ? "bg-violet-600 text-white border-violet-600"
                : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-violet-400"
            }`}
          >
            ★ Milestones only
          </button>
        </div>
      </div>

      {/* Timeline — vertical or horizontal */}
      {horizontal ? (
        <div className="overflow-x-auto pb-4">
          <div
            className="flex items-start gap-0 min-w-max relative"
            style={{ paddingTop: 12 }}
          >
            {/* Horizontal line */}
            <div className="absolute top-[18px] left-0 right-0 h-0.5 bg-zinc-200 dark:bg-zinc-700" />

            {filtered.map((event, i) => {
              const color = ORG_COLORS[event.org] ?? "#8b5cf6";
              const isHovered = hoveredIdx === i;
              return (
                <div
                  key={i}
                  className="flex flex-col items-center relative shrink-0"
                  style={{ width: 140 }}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  {/* Dot */}
                  <div
                    className={`w-3 h-3 rounded-full border-2 border-white dark:border-zinc-950 z-10 ${event.highlight ? "ring-2 ring-offset-1 dark:ring-offset-zinc-950" : ""}`}
                    style={{
                      backgroundColor: color,
                      ...(event.highlight ? { ringColor: color } : {}),
                    }}
                  />
                  {/* Date label */}
                  <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono mt-2 leading-none">
                    {formatDate(event.date)}
                  </span>
                  {/* Compact label */}
                  <span className="text-[10px] font-semibold text-zinc-700 dark:text-zinc-300 mt-1 text-center leading-tight max-w-[120px] truncate">
                    {event.name}
                  </span>
                  <span
                    className="text-[8px] px-1.5 py-0.5 rounded-full font-medium text-white mt-1"
                    style={{ backgroundColor: color }}
                  >
                    {event.org}
                  </span>

                  {/* Hover detail card */}
                  {isHovered && (
                    <div className="absolute top-16 z-30 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl p-3 pointer-events-none">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                          {event.name}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-mono">
                          {event.params}
                        </span>
                        {event.highlight && (
                          <span className="text-[9px] text-amber-500 font-bold">
                            ★
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        {event.description}
                      </p>
                      {event.inDb && (
                        <span className="inline-block mt-1.5 text-[9px] px-1.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 font-medium">
                          in this app
                        </span>
                      )}
                      {event.isLive && (
                        <span className="inline-block mt-1.5 text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium">
                          Live · HF
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[88px] top-0 bottom-0 w-0.5 bg-zinc-200 dark:bg-zinc-700" />

          <div className="space-y-1">
            {filtered.map((event, i) => {
              const color = ORG_COLORS[event.org] ?? "#8b5cf6";
              const isHovered = hoveredIdx === i;
              return (
                <div
                  key={i}
                  className="flex gap-0 items-start group"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  {/* Date */}
                  <div className="w-20 shrink-0 pt-3 pr-3 text-right">
                    <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono leading-none">
                      {formatDate(event.date)}
                    </span>
                  </div>

                  {/* Dot */}
                  <div className="shrink-0 relative z-10 mt-3.5">
                    <div
                      className={`w-3 h-3 rounded-full border-2 border-white dark:border-zinc-950 transition-transform ${event.highlight ? "ring-2 ring-offset-1 dark:ring-offset-zinc-950" : ""} ${isHovered ? "scale-150" : ""}`}
                      style={{
                        backgroundColor: color,
                        ...(event.highlight ? { ringColor: color } : {}),
                      }}
                    />
                  </div>

                  {/* Card */}
                  <div className="flex-1 ml-4 mb-2 relative">
                    <div
                      className={`rounded-xl border px-4 py-3 transition-all ${
                        isHovered
                          ? "bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-600 shadow-md scale-[1.01]"
                          : event.highlight
                            ? "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 shadow-sm"
                            : "bg-zinc-50 dark:bg-zinc-900/50 border-zinc-100 dark:border-zinc-800"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                              {event.name}
                            </span>
                            <span
                              className="text-[10px] px-2 py-0.5 rounded-full font-medium text-white"
                              style={{ backgroundColor: color }}
                            >
                              {event.org}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-mono">
                              {event.params}
                            </span>
                            {event.highlight && (
                              <span className="text-[10px] text-amber-500 font-bold">
                                ★ Milestone
                              </span>
                            )}
                            {event.inDb && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 font-medium">
                                in this app ↗
                              </span>
                            )}
                            {event.isLive && (
                              <a
                                href={event.hfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium hover:underline"
                              >
                                Live · HF ↗
                              </a>
                            )}
                          </div>
                          <p
                            className={`text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed transition-all ${isHovered ? "max-h-40" : "max-h-5 overflow-hidden"}`}
                          >
                            {event.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-6 text-center">
        Showing {filtered.length} of {allEvents.length} models.{" "}
        {yearZoom && (
          <button
            onClick={() => setYearZoom(null)}
            className="underline cursor-pointer"
          >
            Show all years
          </button>
        )}
      </p>
    </div>
  );
}
