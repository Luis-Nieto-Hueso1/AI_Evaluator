import { useState, useMemo, useEffect, useCallback } from "react";
import type { Model } from "../types";
import modelsData from "../data/models.json";
import {
  fetchLiveBenchmarks,
  refreshLiveBenchmarks,
  getCachedBenchmarks,
  getBenchmarkCacheAge,
  type LiveBenchmarkEntry,
} from "../lib/live-benchmarks";

const ALL_MODELS = modelsData as Model[];

type SortCol =
  | "mmlu"
  | "humanEval"
  | "mtBench"
  | "math"
  | "gpqa"
  | "ifEval"
  | "bbh"
  | "musr"
  | "mmluPro"
  | "average"
  | "params";

type DataSource = "static" | "live";

function scoreColor(val: number, max: number): string {
  const ratio = val / max;
  if (ratio >= 0.75) return "text-emerald-600 dark:text-emerald-400";
  if (ratio >= 0.5) return "text-amber-600 dark:text-amber-400";
  return "text-red-500 dark:text-red-400";
}

function formatAge(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  if (hours < 1) return "just now";
  if (hours === 1) return "1 hour ago";
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "1 day ago" : `${days} days ago`;
}

const STATIC_BENCHMARKS = [
  {
    key: "mmlu",
    name: "MMLU",
    full: "Massive Multitask Language Understanding",
    scale: "0-100%",
    description:
      "Tests broad academic knowledge across 57 subjects including STEM, humanities, social sciences, and more. The model answers multiple-choice questions at difficulty levels ranging from elementary to professional. A high score means the model has strong general knowledge.",
  },
  {
    key: "humanEval",
    name: "HumanEval",
    full: "HumanEval Code Generation",
    scale: "0-100%",
    description:
      "Measures the ability to write correct Python functions from docstrings. The model is given a function signature and description, and must produce working code that passes unit tests. Tests practical programming ability, not just code understanding.",
  },
  {
    key: "math",
    name: "MATH",
    full: "Mathematics Problem Solving",
    scale: "0-100%",
    description:
      "Competition-level math problems covering algebra, geometry, number theory, combinatorics, and calculus. Problems require multi-step reasoning and symbolic manipulation. This is one of the hardest benchmarks — even top models score below 95%.",
  },
  {
    key: "gpqa",
    name: "GPQA",
    full: "Graduate-Level Google-Proof Q&A (Diamond)",
    scale: "0-100%",
    description:
      'PhD-difficulty science questions in physics, chemistry, and biology. Questions are designed to be "Google-proof" — you can\'t easily find the answer by searching. Tests deep domain reasoning, not just recall. Scores above 50% are considered very strong.',
  },
  {
    key: "ifEval",
    name: "IFEval",
    full: "Instruction Following Evaluation",
    scale: "0-100%",
    description:
      'Measures how precisely models follow specific formatting and constraint instructions — e.g., "write exactly 3 paragraphs", "include the word X at least twice", "respond in JSON". Tests compliance and attention to detail, not creativity.',
  },
  {
    key: "mtBench",
    name: "MT-Bench",
    full: "Multi-Turn Benchmark",
    scale: "1-10",
    description:
      "Evaluates conversation quality across multi-turn dialogues. A GPT-4 judge rates responses on helpfulness, relevance, and coherence. Covers writing, reasoning, math, coding, extraction, STEM, humanities, and roleplay. Scores above 8 indicate high quality.",
  },
];

const LIVE_BENCHMARKS = [
  {
    key: "average",
    name: "Average",
    full: "Open LLM Leaderboard v2 Average",
    scale: "0-100%",
    description:
      "The mean score across all six Open LLM Leaderboard v2 benchmarks (IFEval, BBH, MATH Lvl 5, GPQA, MUSR, MMLU-PRO). Provides a single number to compare overall model capability. Note: the benchmarks are harder than v1, so averages tend to be lower.",
  },
  {
    key: "ifEval",
    name: "IFEval",
    full: "Instruction Following Evaluation",
    scale: "0-100%",
    description:
      'Measures how precisely models follow specific formatting and constraint instructions — e.g., "write exactly 3 paragraphs", "include the word X at least twice", "respond in JSON". High scores mean the model is reliable for structured output tasks.',
  },
  {
    key: "bbh",
    name: "BBH",
    full: "Big Bench Hard",
    scale: "0-100%",
    description:
      "A curated subset of 23 challenging tasks from the BIG-Bench suite where language models previously fell below average human performance. Covers logical deduction, causal judgment, date understanding, disambiguation, sarcasm detection, and more. Tests core reasoning ability.",
  },
  {
    key: "math",
    name: "MATH Lvl 5",
    full: "MATH Benchmark (Level 5 — Hardest)",
    scale: "0-100%",
    description:
      "The hardest tier of the MATH competition benchmark. Problems require advanced algebra, calculus, number theory, and multi-step proofs. Only the most capable reasoning models score well here. This is significantly harder than the standard MATH benchmark.",
  },
  {
    key: "gpqa",
    name: "GPQA",
    full: "Graduate-Level Google-Proof Q&A",
    scale: "0-100%",
    description:
      "PhD-difficulty multiple-choice questions in physics, chemistry, and biology. Designed so that even domain experts with internet access struggle. Scores above 40% are impressive — random chance on 4-choice questions gives 25%.",
  },
  {
    key: "musr",
    name: "MUSR",
    full: "Multi-Step Soft Reasoning",
    scale: "0-100%",
    description:
      "Tests complex multi-hop reasoning across long contexts. Problems include murder mysteries, team allocation puzzles, and object placement tracking. Requires the model to integrate information across many paragraphs and reason through multiple steps.",
  },
  {
    key: "mmluPro",
    name: "MMLU-PRO",
    full: "MMLU Professional (10-choice)",
    scale: "0-100%",
    description:
      "A harder, more discriminative version of MMLU with 10 answer choices instead of 4, and more reasoning-intensive questions. Reduces the effectiveness of guessing and test-taking strategies. The difficulty jump from MMLU to MMLU-PRO is substantial.",
  },
];

export function Leaderboard() {
  const [sortCol, setSortCol] = useState<SortCol>("mmlu");
  const [sortAsc, setSortAsc] = useState(false);
  const [source, setSource] = useState<DataSource>("static");
  const [liveBenchmarks, setLiveBenchmarks] =
    useState<Record<string, LiveBenchmarkEntry>>(getCachedBenchmarks);
  const [liveStatus, setLiveStatus] = useState<
    "idle" | "loading" | "done" | "error"
  >("idle");
  const [cacheAge, setCacheAge] = useState<number | null>(getBenchmarkCacheAge);
  const [showInfo, setShowInfo] = useState(false);

  // Auto-fetch live data on mount
  useEffect(() => {
    setLiveStatus("loading");
    fetchLiveBenchmarks()
      .then((data) => {
        setLiveBenchmarks(data);
        setCacheAge(getBenchmarkCacheAge());
        setLiveStatus("done");
        // Auto-switch to live if we got data
        if (Object.keys(data).length > 0) {
          setSource("live");
          setSortCol("average");
        }
      })
      .catch(() => setLiveStatus("error"));
  }, []);

  const handleRefresh = useCallback(() => {
    setLiveStatus("loading");
    refreshLiveBenchmarks()
      .then((data) => {
        setLiveBenchmarks(data);
        setCacheAge(getBenchmarkCacheAge());
        setLiveStatus("done");
      })
      .catch(() => setLiveStatus("error"));
  }, []);

  function toggleSort(col: SortCol) {
    if (sortCol === col) setSortAsc((v) => !v);
    else {
      setSortCol(col);
      setSortAsc(false);
    }
  }

  // Merge static + live data
  const models = useMemo(() => {
    if (source === "static") {
      return ALL_MODELS.filter((m) => m.benchmarks);
    }
    // Live: show all models that have live benchmark data
    return ALL_MODELS.filter((m) => liveBenchmarks[m.id]);
  }, [source, liveBenchmarks]);

  const sorted = useMemo(() => {
    const list = [...models];
    const dir = sortAsc ? 1 : -1;

    function getVal(m: Model, col: SortCol): number {
      if (source === "live" && col !== "params") {
        const live = liveBenchmarks[m.id];
        if (!live) return 0;
        switch (col) {
          case "average":
            return live.average;
          case "ifEval":
            return live.ifEval;
          case "bbh":
            return live.bbh;
          case "math":
            return live.math;
          case "gpqa":
            return live.gpqa;
          case "musr":
            return live.musr;
          case "mmluPro":
            return live.mmluPro;
          // For static-only columns in live mode, fallback to static
          default:
            break;
        }
      }
      switch (col) {
        case "mmlu":
          return m.benchmarks?.mmlu ?? 0;
        case "humanEval":
          return m.benchmarks?.humanEval ?? 0;
        case "mtBench":
          return m.benchmarks?.mtBench ?? 0;
        case "math":
          return m.benchmarks?.math ?? 0;
        case "gpqa":
          return m.benchmarks?.gpqa ?? 0;
        case "ifEval":
          return m.benchmarks?.ifEval ?? 0;
        case "params":
          return m.parameters;
        default:
          return 0;
      }
    }

    list.sort((a, b) => (getVal(a, sortCol) - getVal(b, sortCol)) * dir);
    return list;
  }, [models, sortCol, sortAsc, source, liveBenchmarks]);

  const arrow = sortAsc ? " \u2191" : " \u2193";

  function ColHeader({
    col,
    label,
    title,
    className,
  }: {
    col: SortCol;
    label: string;
    title?: string;
    className?: string;
  }) {
    return (
      <th
        onClick={() => toggleSort(col)}
        title={title}
        className={`px-3 py-2 text-left cursor-pointer hover:text-violet-600 dark:hover:text-violet-400 select-none transition-colors whitespace-nowrap ${className ?? ""}`}
      >
        {label}
        {sortCol === col && (
          <span className="text-violet-500 ml-0.5">{arrow}</span>
        )}
      </th>
    );
  }

  function ScoreCell({ value, max }: { value?: number; max: number }) {
    return (
      <td
        className={`px-3 py-2 font-mono font-semibold ${value ? scoreColor(value, max) : "text-zinc-300 dark:text-zinc-700"}`}
      >
        {value ? value.toFixed(1) : "\u2014"}
      </td>
    );
  }

  const liveMatchCount = Object.keys(liveBenchmarks).length;

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
      {/* Source toggle + status bar */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSource("static");
              setSortCol("mmlu");
            }}
            className={`text-xs px-3 py-1 rounded-full font-medium transition-colors cursor-pointer ${
              source === "static"
                ? "bg-violet-600 text-white"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            Static (Model Cards)
          </button>
          <button
            onClick={() => {
              if (liveMatchCount > 0) {
                setSource("live");
                setSortCol("average");
              }
            }}
            disabled={liveMatchCount === 0}
            className={`text-xs px-3 py-1 rounded-full font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              source === "live"
                ? "bg-emerald-600 text-white"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            Live (Open LLM Leaderboard)
            {liveStatus === "loading" && (
              <span className="ml-1.5 inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin align-middle" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500">
          {liveStatus === "done" && liveMatchCount > 0 && (
            <span>
              {liveMatchCount} models matched
              {cacheAge != null && ` · cached ${formatAge(cacheAge)}`}
            </span>
          )}
          {liveStatus === "error" && (
            <span className="text-red-500">Failed to fetch</span>
          )}
          {liveStatus !== "loading" && (
            <button
              onClick={handleRefresh}
              className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Refresh live data"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wide text-xs">
              <th className="px-3 py-2 text-left w-10">#</th>
              <th className="px-3 py-2 text-left">Model</th>
              <ColHeader col="params" label="Params" />

              {source === "live" ? (
                <>
                  <ColHeader
                    col="average"
                    label="Avg %"
                    title="Average across all Open LLM Leaderboard v2 benchmarks"
                  />
                  <ColHeader
                    col="ifEval"
                    label="IFEval %"
                    title="Instruction Following Evaluation — measures how well models follow formatting and constraint instructions"
                  />
                  <ColHeader
                    col="bbh"
                    label="BBH %"
                    title="Big Bench Hard — challenging reasoning tasks including logical deduction, causal judgment, and more"
                  />
                  <ColHeader
                    col="math"
                    label="MATH %"
                    title="MATH Level 5 — competition-level math problems"
                  />
                  <ColHeader
                    col="gpqa"
                    label="GPQA %"
                    title="Graduate-level science Q&A — PhD-difficulty questions in physics, chemistry, biology"
                  />
                  <ColHeader
                    col="musr"
                    label="MUSR %"
                    title="Multi-step Soft Reasoning — complex multi-hop reasoning tasks"
                  />
                  <ColHeader
                    col="mmluPro"
                    label="MMLU-PRO %"
                    title="MMLU-PRO — harder, more discriminative version of MMLU with 10 answer choices"
                  />
                </>
              ) : (
                <>
                  <ColHeader
                    col="mmlu"
                    label="MMLU %"
                    title="Massive Multitask Language Understanding — broad knowledge across 57 subjects"
                  />
                  <ColHeader
                    col="humanEval"
                    label="HumanEval %"
                    title="Code generation — measures ability to write correct Python functions"
                  />
                  <ColHeader
                    col="math"
                    label="MATH %"
                    title="Competition-level math problems"
                  />
                  <ColHeader
                    col="gpqa"
                    label="GPQA %"
                    title="Graduate-level science Q&A — PhD-difficulty questions"
                  />
                  <ColHeader
                    col="ifEval"
                    label="IFEval %"
                    title="Instruction Following Evaluation"
                  />
                  <ColHeader
                    col="mtBench"
                    label="MT-Bench /10"
                    title="Multi-turn conversation quality rated by GPT-4"
                  />
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {sorted.map((m, i) => {
              const live = liveBenchmarks[m.id];
              return (
                <tr
                  key={m.id}
                  className="border-b border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                >
                  <td className="px-3 py-2 text-zinc-400 font-mono">{i + 1}</td>
                  <td className="px-3 py-2 font-medium text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                    {m.name}
                    <span className="ml-1.5 text-xs text-zinc-400 font-normal">
                      {m.family}
                    </span>
                    {source === "live" && live && (
                      <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-medium">
                        LIVE
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-zinc-600 dark:text-zinc-300 font-mono">
                    {m.parameters}B
                  </td>

                  {source === "live" ? (
                    <>
                      <ScoreCell value={live?.average} max={100} />
                      <ScoreCell value={live?.ifEval} max={100} />
                      <ScoreCell value={live?.bbh} max={100} />
                      <ScoreCell value={live?.math} max={100} />
                      <ScoreCell value={live?.gpqa} max={100} />
                      <ScoreCell value={live?.musr} max={100} />
                      <ScoreCell value={live?.mmluPro} max={100} />
                    </>
                  ) : (
                    <>
                      <ScoreCell value={m.benchmarks?.mmlu} max={100} />
                      <ScoreCell value={m.benchmarks?.humanEval} max={100} />
                      <ScoreCell value={m.benchmarks?.math} max={100} />
                      <ScoreCell value={m.benchmarks?.gpqa} max={100} />
                      <ScoreCell value={m.benchmarks?.ifEval} max={100} />
                      <ScoreCell value={m.benchmarks?.mtBench} max={10} />
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Benchmark info panel */}
      <div className="border-t border-zinc-100 dark:border-zinc-800">
        <button
          onClick={() => setShowInfo((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            What do these benchmarks mean?
          </span>
          <svg
            className={`w-3.5 h-3.5 transition-transform ${showInfo ? "rotate-180" : ""}`}
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

        {showInfo && (
          <div className="px-4 pb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(source === "live" ? LIVE_BENCHMARKS : STATIC_BENCHMARKS).map(
              (b) => (
                <div
                  key={b.key}
                  className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 p-3"
                >
                  <div className="flex items-baseline justify-between mb-1">
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {b.name}
                    </h4>
                    <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
                      {b.scale}
                    </span>
                  </div>
                  <p className="text-[10px] font-medium text-violet-600 dark:text-violet-400 mb-1.5">
                    {b.full}
                  </p>
                  <p className="text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {b.description}
                  </p>
                </div>
              ),
            )}
          </div>
        )}
      </div>

      <div className="px-4 py-2 text-xs text-zinc-400 dark:text-zinc-500 border-t border-zinc-100 dark:border-zinc-800">
        {sorted.length} models ·{" "}
        {source === "live"
          ? "Live scores from Open LLM Leaderboard v2 (HuggingFace) · Auto-refreshed every 24h"
          : "Static scores from official model cards"}{" "}
        · Click column headers to sort
      </div>
    </div>
  );
}
