import { useState, useEffect } from "react";
import type { CompatibleModel, Grade, HardwareProfile } from "../types";
import {
  getQualityColor,
  getQualityLabel,
  GRADE_STATUS,
  getVariantScores,
} from "../lib/compatibility";
import {
  fetchHfMeta,
  formatDownloads,
  formatRelativeDate,
  estimateFileSizeGb,
  type HfModelMeta,
} from "../lib/hf-api";

interface Props {
  item: CompatibleModel;
  hardware: HardwareProfile;
  calibrationFactor?: number;
}

const FAMILY_COLORS: Record<string, string> = {
  Llama: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  Mistral:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  Phi: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  Gemma: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  Qwen: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  DeepSeek: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  CodeLlama:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  Cohere: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
};

const GRADE_STYLES: Record<Grade, { bg: string; text: string; label: string }> =
  {
    S: { bg: "bg-emerald-500", text: "text-white", label: "Runs great" },
    A: { bg: "bg-blue-500", text: "text-white", label: "Runs well" },
    B: { bg: "bg-violet-500", text: "text-white", label: "Decent" },
    C: { bg: "bg-amber-500", text: "text-white", label: "Tight fit" },
    D: { bg: "bg-red-500", text: "text-white", label: "Barely runs" },
    F: {
      bg: "bg-zinc-400 dark:bg-zinc-600",
      text: "text-white",
      label: "Too heavy",
    },
  };

const GRADE_BADGE_COLORS: Record<Grade, string> = {
  S: "bg-emerald-500 text-white",
  A: "bg-blue-500 text-white",
  B: "bg-violet-500 text-white",
  C: "bg-amber-500 text-white",
  D: "bg-red-500 text-white",
  F: "bg-zinc-400 dark:bg-zinc-600 text-white",
};

// Ollama library tag for each model (base tag = default Q4_K_M variant)
const OLLAMA_IDS: Record<string, string> = {
  "llama-3.3-70b": "llama3.3:70b",
  "llama-3.1-8b": "llama3.1:8b",
  "llama-3.1-70b": "llama3.1:70b",
  "llama-3.1-405b": "llama3.1:405b",
  "llama-3.2-1b": "llama3.2:1b",
  "llama-3.2-3b": "llama3.2:3b",
  "llama-3.2-11b-vision": "llama3.2-vision:11b",
  "mistral-7b": "mistral:7b",
  "mistral-nemo-12b": "mistral-nemo:12b",
  "mistral-small-24b": "mistral-small:24b",
  "phi-4-14b": "phi4:14b",
  "phi-3.5-mini": "phi3.5:3.8b",
  "gemma-2-2b": "gemma2:2b",
  "gemma-2-9b": "gemma2:9b",
  "gemma-2-27b": "gemma2:27b",
  "gemma-3-1b": "gemma3:1b",
  "gemma-3-4b": "gemma3:4b",
  "gemma-3-12b": "gemma3:12b",
  "gemma-3-27b": "gemma3:27b",
  "qwen-2.5-7b": "qwen2.5:7b",
  "qwen-2.5-14b": "qwen2.5:14b",
  "qwen-2.5-32b": "qwen2.5:32b",
  "qwen-2.5-72b": "qwen2.5:72b",
  "qwen-2.5-coder-7b": "qwen2.5-coder:7b",
  "qwen-2.5-coder-32b": "qwen2.5-coder:32b",
  "qwen-3-1.7b": "qwen3:1.7b",
  "qwen-3-4b": "qwen3:4b",
  "qwen-3-8b": "qwen3:8b",
  "qwen-3-14b": "qwen3:14b",
  "qwen-3-32b": "qwen3:32b",
  "deepseek-r1-1.5b": "deepseek-r1:1.5b",
  "deepseek-r1-7b": "deepseek-r1:7b",
  "deepseek-r1-14b": "deepseek-r1:14b",
  "deepseek-r1-32b": "deepseek-r1:32b",
  "codellama-7b": "codellama:7b",
  "codellama-34b": "codellama:34b",
  "codestral-22b": "codestral:22b",
  "mixtral-8x7b": "mixtral:8x7b",
  "mixtral-8x22b": "mixtral:8x22b",
  "command-r-35b": "command-r:35b",
  "tinyllama-1.1b": "tinyllama:1.1b",
};

function formatToks(toks: number): string {
  if (toks >= 100) return ">100 tok/s";
  if (toks >= 1) return `~${Math.round(toks)} tok/s`;
  return `<1 tok/s`;
}

const QUANT_TOOLTIPS: Record<string, string> = {
  Q2_K: "2.6 bits/weight · smallest size, noticeable quality loss",
  Q4_K_M: "4.85 bits/weight · best size-quality balance (recommended)",
  Q8_0: "8.5 bits/weight · near-lossless, 2× larger than Q4",
  F16: "16 bits/weight · full precision, maximum quality, largest file",
};

function formatContext(tokens: number): string {
  if (tokens >= 131072) return "128K ctx";
  if (tokens >= 65536) return "64K ctx";
  if (tokens >= 32768) return "32K ctx";
  if (tokens >= 16384) return "16K ctx";
  if (tokens >= 8192) return "8K ctx";
  return "2K ctx";
}

function memColor(pct: number): string {
  if (pct <= 0.5) return "text-emerald-600 dark:text-emerald-400";
  if (pct <= 0.7) return "text-amber-600 dark:text-amber-400";
  if (pct <= 0.85) return "text-orange-500 dark:text-orange-400";
  return "text-red-500 dark:text-red-400";
}

function ggufFileName(modelName: string, quant: string): string {
  return `${modelName.replace(/\s+/g, "-")}.${quant}.gguf`;
}

function getRecommendedRuntime(
  runOnGpu: boolean,
  useCases: string[],
  ollamaTag: string | null,
): "ollama" | "llamacpp" | "lmstudio" {
  if (runOnGpu && ollamaTag) return "ollama"; // Ollama has best GPU support (CUDA/Metal native)
  if (
    useCases.some((uc) =>
      ["coding", "code-completion", "debugging"].includes(uc),
    )
  )
    return "llamacpp"; // CLI/editor integration for devs
  return "lmstudio"; // GUI best for CPU-only general use
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }
  return (
    <button
      onClick={copy}
      className="shrink-0 text-xs px-2.5 py-1 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors font-mono"
    >
      {copied ? "✓" : "copy"}
    </button>
  );
}

function CommandRow({
  label,
  cmd,
  recommended,
}: {
  label: string;
  cmd: string;
  recommended?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
          {label}
        </span>
        {recommended && (
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300">
            ★ Recommended
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 bg-zinc-950 dark:bg-zinc-950 rounded-lg px-2.5 py-1.5 min-w-0">
        <code className="text-xs text-emerald-400 font-mono flex-1 truncate">
          {cmd}
        </code>
        <CopyButton text={cmd} />
      </div>
    </div>
  );
}

const SLIDER_STEPS = [
  10_000, 50_000, 100_000, 250_000, 500_000, 1_000_000, 5_000_000,
];
const RATIO_OPTIONS = [
  { label: "50/50", inRatio: 0.5 },
  { label: "80/20 (chat)", inRatio: 0.8 },
  { label: "20/80 (gen)", inRatio: 0.2 },
];

const CURRENCIES = [
  { code: "USD", symbol: "$", rate: 1 },
  { code: "EUR", symbol: "\u20ac", rate: 0.92 },
  { code: "GBP", symbol: "\u00a3", rate: 0.79 },
  { code: "JPY", symbol: "\u00a5", rate: 154.5, decimals: 0 },
  { code: "CAD", symbol: "C$", rate: 1.36 },
  { code: "AUD", symbol: "A$", rate: 1.53 },
  { code: "INR", symbol: "\u20b9", rate: 83.5, decimals: 0 },
  { code: "BRL", symbol: "R$", rate: 4.97 },
  { code: "CNY", symbol: "\u00a5", rate: 7.24 },
  { code: "KRW", symbol: "\u20a9", rate: 1340, decimals: 0 },
];

function CostCalculator({
  apiCost,
}: {
  apiCost: { provider: string; inputPer1M: number; outputPer1M: number };
}) {
  const [tokIdx, setTokIdx] = useState(2); // default 100K
  const [ratioIdx, setRatioIdx] = useState(0); // default 50/50
  const [showDetail, setShowDetail] = useState(false);
  const [currIdx, setCurrIdx] = useState(0); // default USD

  const curr = CURRENCIES[currIdx];
  const decimals = curr.decimals ?? 2;
  const fmt = (usd: number) =>
    `${curr.symbol}${(usd * curr.rate).toFixed(decimals)}`;

  const tokensPerDay = SLIDER_STEPS[tokIdx];
  const tokensPerMonth = tokensPerDay * 30;
  const { inRatio } = RATIO_OPTIONS[ratioIdx];
  const inputTokens = tokensPerMonth * inRatio;
  const outputTokens = tokensPerMonth * (1 - inRatio);
  const inputCost = (inputTokens / 1_000_000) * apiCost.inputPer1M;
  const outputCost = (outputTokens / 1_000_000) * apiCost.outputPer1M;
  const totalCost = inputCost + outputCost;

  function formatTokLabel(n: number) {
    if (n >= 1_000_000)
      return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
    return `${(n / 1_000).toFixed(0)}K`;
  }

  function exportCostCsv() {
    const rows = [
      [
        "Provider",
        "Currency",
        "Tokens/Day",
        "Input/Output Ratio",
        "Input Tokens/Month",
        "Output Tokens/Month",
        "Input Cost",
        "Output Cost",
        "Total Monthly Cost",
      ],
      [
        apiCost.provider,
        curr.code,
        tokensPerDay,
        RATIO_OPTIONS[ratioIdx].label,
        Math.round(inputTokens),
        Math.round(outputTokens),
        fmt(inputCost),
        fmt(outputCost),
        fmt(totalCost),
      ],
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cost-estimate-${apiCost.provider.toLowerCase().replace(/\s+/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-lg px-3 py-2.5">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
          API equivalent — {apiCost.provider}
        </p>
        <div className="flex gap-1.5">
          <button
            onClick={() => setShowDetail((v) => !v)}
            className="text-xs px-2.5 py-1 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer font-medium"
          >
            {showDetail ? "Simple" : "Detailed"}
          </button>
          <button
            onClick={exportCostCsv}
            className="text-xs px-2.5 py-1 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer font-medium"
          >
            CSV
          </button>
        </div>
      </div>

      {/* Currency picker */}
      <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
        {CURRENCIES.map((c, i) => (
          <button
            key={c.code}
            onClick={() => setCurrIdx(i)}
            className={`text-xs px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
              currIdx === i
                ? "bg-emerald-600 text-white"
                : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200"
            }`}
          >
            {c.code}
          </button>
        ))}
      </div>

      {/* Rate display */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs text-zinc-600 dark:text-zinc-400">
          <span className="font-medium text-zinc-800 dark:text-zinc-200">
            {fmt(apiCost.inputPer1M)}
          </span>{" "}
          in ·{" "}
          <span className="font-medium text-zinc-800 dark:text-zinc-200">
            {fmt(apiCost.outputPer1M)}
          </span>{" "}
          out <span className="text-zinc-400">/1M tokens</span>
        </span>
        <span className="text-zinc-300 dark:text-zinc-600">·</span>
        <span className="text-xs text-zinc-600 dark:text-zinc-400">
          At {formatTokLabel(tokensPerDay)} tok/day →{" "}
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            {fmt(totalCost)}/month
          </span>{" "}
          via API
        </span>
      </div>

      {showDetail && (
        <div className="mt-2.5 space-y-2 pt-2 border-t border-emerald-200/50 dark:border-emerald-800/30">
          {/* Tokens/day slider */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Tokens/day
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {formatTokLabel(tokensPerDay)}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={SLIDER_STEPS.length - 1}
              value={tokIdx}
              onChange={(e) => setTokIdx(Number(e.target.value))}
              aria-label="Tokens per day"
              className="w-full h-2 accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-xs text-zinc-400 mt-0.5">
              <span>10K</span>
              <span>5M</span>
            </div>
          </div>

          {/* Input/output ratio */}
          <div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              Input/Output ratio
            </span>
            <div className="flex gap-1.5 mt-1">
              {RATIO_OPTIONS.map((opt, idx) => (
                <button
                  key={opt.label}
                  onClick={() => setRatioIdx(idx)}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                    ratioIdx === idx
                      ? "bg-emerald-600 text-white"
                      : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Breakdown */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white/60 dark:bg-zinc-800/40 rounded-lg px-2 py-1.5">
              <p className="text-xs text-zinc-400 font-medium">Input</p>
              <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                {fmt(inputCost)}
              </p>
              <p className="text-xs text-zinc-400">
                {formatTokLabel(Math.round(inputTokens))}/mo
              </p>
            </div>
            <div className="bg-white/60 dark:bg-zinc-800/40 rounded-lg px-2 py-1.5">
              <p className="text-xs text-zinc-400 font-medium">Output</p>
              <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                {fmt(outputCost)}
              </p>
              <p className="text-xs text-zinc-400">
                {formatTokLabel(Math.round(outputTokens))}/mo
              </p>
            </div>
            <div className="bg-emerald-100/60 dark:bg-emerald-900/20 rounded-lg px-2 py-1.5">
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                Total
              </p>
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                {fmt(totalCost)}
              </p>
              <p className="text-xs text-emerald-500">per month</p>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
        Running locally saves ~{fmt(totalCost)}/month
      </p>
    </div>
  );
}

export function ModelCard({ item, hardware, calibrationFactor = 1 }: Props) {
  const [showRun, setShowRun] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [hfMeta, setHfMeta] = useState<HfModelMeta | null>(null);
  const [hfLoading, setHfLoading] = useState(false);

  useEffect(() => {
    if (!showDetail || hfMeta !== null) return;
    setHfLoading(true);
    fetchHfMeta(item.model.huggingFace).then((meta) => {
      setHfMeta(meta);
      setHfLoading(false);
    });
  }, [showDetail, item.model.huggingFace, hfMeta]);

  const {
    model,
    bestVariant,
    runOnGpu,
    tokensPerSec,
    grade,
    score,
    memPercent,
    fits,
  } = item;
  const gradeStyle = GRADE_STYLES[grade];
  const familyColor =
    FAMILY_COLORS[model.family] ??
    "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
  const memUsed = runOnGpu ? bestVariant.vramRequired : bestVariant.ramRequired;
  const memLabel = runOnGpu ? "VRAM" : "RAM";

  const ollamaTag = OLLAMA_IDS[model.id];
  const quant = bestVariant.quantization;
  const gguf = ggufFileName(model.name, quant);
  const nglFlag = runOnGpu ? " -ngl 99" : "";

  const ollamaCmd = ollamaTag ? `ollama run ${ollamaTag}` : null;
  const llamaCppCmd = `llama-cli -m ./${gguf}${nglFlag} -p "Your prompt here"`;
  const lmStudioCmd = `Search "${model.name}" → select ${quant} → Download & Load`;

  const recommendedRuntime = getRecommendedRuntime(
    runOnGpu,
    model.useCases,
    ollamaTag ?? null,
  );

  // Variant scores for the detail panel
  const variantScores = showDetail ? getVariantScores(model, hardware) : [];

  // suppress unused import warning
  void GRADE_STATUS;

  return (
    <div
      className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3 ${!fits ? "opacity-60" : ""}`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div
          className="min-w-0 flex-1 cursor-pointer"
          onClick={() => setShowDetail((v) => !v)}
        >
          <div className="flex items-center gap-1.5">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm leading-tight truncate">
              {model.name}
            </h3>
            <svg
              className={`w-3 h-3 text-zinc-400 shrink-0 transition-transform duration-150 ${showDetail ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            {model.parameters}B · {formatContext(model.contextLength)} ·{" "}
            {model.license === "open" ? "Open" : "Restricted"}
          </p>
        </div>

        {/* Grade badge + HF link */}
        <div className="shrink-0 flex flex-col items-center gap-1">
          <div
            className={`${gradeStyle.bg} ${gradeStyle.text} text-lg font-black w-9 h-9 flex items-center justify-center rounded-xl leading-none relative`}
          >
            {grade}
            {fits && (
              <span className="absolute -bottom-1 -right-1 text-xs bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold px-1 rounded-full leading-tight">
                {score}
              </span>
            )}
          </div>
          <span className="text-xs text-zinc-400 whitespace-nowrap">
            {gradeStyle.label}
          </span>
          <a
            href={model.huggingFace}
            target="_blank"
            rel="noopener noreferrer"
            title="View on HuggingFace"
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
          >
            🤗 HF
          </a>
        </div>
      </div>

      {/* Detail panel */}
      {showDetail && (
        <div className="border border-zinc-100 dark:border-zinc-800 rounded-xl p-3 bg-zinc-50 dark:bg-zinc-950 flex flex-col gap-3">
          {/* Live HF stats */}
          {hfLoading && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500">
              <span className="inline-block w-3 h-3 border-2 border-zinc-300 dark:border-zinc-600 border-t-violet-500 rounded-full animate-spin" />
              Loading HuggingFace stats…
            </div>
          )}
          {!hfLoading &&
            hfMeta &&
            (hfMeta.downloads > 0 || hfMeta.likes > 0) && (
              <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-lg px-2.5 py-1.5">
                <span title="Downloads (all time)">
                  ↓{" "}
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                    {formatDownloads(hfMeta.downloads)}
                  </span>{" "}
                  downloads
                </span>
                <span className="text-zinc-300 dark:text-zinc-600">·</span>
                <span title="Likes on HuggingFace">
                  ♥{" "}
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                    {formatDownloads(hfMeta.likes)}
                  </span>{" "}
                  likes
                </span>
                {hfMeta.lastModified && (
                  <>
                    <span className="text-zinc-300 dark:text-zinc-600">·</span>
                    <span>
                      Updated {formatRelativeDate(hfMeta.lastModified)}
                    </span>
                  </>
                )}
              </div>
            )}

          {/* Variant table */}
          <div>
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1.5">
              All Variants
            </p>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-xs text-zinc-400 uppercase tracking-wide">
                  <th className="text-left pb-1 font-medium">Quant</th>
                  <th className="text-left pb-1 font-medium">File size</th>
                  <th className="text-left pb-1 font-medium">Memory</th>
                  <th className="text-left pb-1 font-medium">Score</th>
                  <th className="text-left pb-1 font-medium">Grade</th>
                  <th className="text-left pb-1 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {variantScores.map((vs) => (
                  <tr key={vs.variant.quantization} className="text-xs">
                    <td className="py-1 pr-2 font-mono text-zinc-700 dark:text-zinc-300">
                      {vs.variant.quantization}
                    </td>
                    <td className="py-1 pr-2 text-zinc-500 dark:text-zinc-500">
                      ~
                      {estimateFileSizeGb(
                        model.parameters,
                        vs.variant.quantization,
                      )}{" "}
                      GB
                    </td>
                    <td className="py-1 pr-2 text-zinc-600 dark:text-zinc-400">
                      {vs.memUsedGb} GB
                    </td>
                    <td className="py-1 pr-2">
                      {vs.fits ? (
                        <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                          {vs.score}
                        </span>
                      ) : (
                        <span className="text-zinc-400">—</span>
                      )}
                    </td>
                    <td className="py-1 pr-2">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded ${GRADE_BADGE_COLORS[vs.grade]}`}
                      >
                        {vs.grade}
                      </span>
                    </td>
                    <td className="py-1">
                      {vs.fits ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          ✓ fits
                        </span>
                      ) : (
                        <span className="text-red-500 dark:text-red-400">
                          ✗ too large
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Benchmark scores */}
          {model.benchmarks &&
            (model.benchmarks.mmlu ||
              model.benchmarks.humanEval ||
              model.benchmarks.mtBench) && (
              <div>
                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2">
                  Benchmarks
                </p>
                <div className="flex flex-col gap-1.5">
                  {model.benchmarks.mmlu != null && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 w-20 shrink-0">
                        MMLU
                      </span>
                      <div className="flex-1 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-violet-500 rounded-full"
                          style={{ width: `${model.benchmarks.mmlu}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 w-8 text-right">
                        {model.benchmarks.mmlu}%
                      </span>
                    </div>
                  )}
                  {model.benchmarks.humanEval != null && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 w-20 shrink-0">
                        HumanEval
                      </span>
                      <div className="flex-1 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${model.benchmarks.humanEval}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 w-8 text-right">
                        {model.benchmarks.humanEval}%
                      </span>
                    </div>
                  )}
                  {model.benchmarks.mtBench != null && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 w-20 shrink-0">
                        MT-Bench
                      </span>
                      <div className="flex-1 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{
                            width: `${(model.benchmarks.mtBench / 10) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 w-8 text-right">
                        {model.benchmarks.mtBench}/10
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* Context window calculator */}
          {model.kvMBPerToken &&
            fits &&
            (() => {
              const memFree =
                (runOnGpu ? hardware.vram : hardware.ram) -
                (runOnGpu ? bestVariant.vramRequired : bestVariant.ramRequired);
              if (memFree <= 0) return null;
              const maxTokens = Math.floor(
                (memFree * 1024) / model.kvMBPerToken,
              );
              const pages = Math.floor(maxTokens / 500);
              const cappedCtx = Math.min(maxTokens, model.contextLength);
              return (
                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-lg px-3 py-2.5">
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">
                    Context Window (your hardware)
                  </p>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300">
                    <span className="font-semibold">
                      {cappedCtx.toLocaleString()} tokens
                    </span>
                    <span className="text-zinc-400 dark:text-zinc-500 mx-1">
                      ·
                    </span>
                    ~{pages.toLocaleString()} pages
                    {maxTokens < model.contextLength && (
                      <span className="text-amber-500 dark:text-amber-400 ml-1.5 text-xs">
                        (model max: {(model.contextLength / 1000).toFixed(0)}K)
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                    {memFree.toFixed(1)} GB free after model load
                  </p>
                </div>
              );
            })()}

          {/* API cost comparison */}
          {model.apiCost && <CostCalculator apiCost={model.apiCost} />}

          {/* Strengths */}
          {model.strengths && model.strengths.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1.5">
                Strengths
              </p>
              <ul className="flex flex-col gap-0.5">
                {model.strengths.map((s) => (
                  <li
                    key={s}
                    className="text-xs text-zinc-600 dark:text-zinc-400 flex items-start gap-1.5"
                  >
                    <span className="text-violet-500 mt-0.5 shrink-0">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Speed + memory row */}
      {fits ? (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-lg">
            {formatToks(tokensPerSec * calibrationFactor)}
            {calibrationFactor !== 1 && (
              <span className="ml-1 text-xs text-violet-500 dark:text-violet-400 font-normal">
                cal
              </span>
            )}
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {memUsed} GB {memLabel}
          </span>
          <span className={`text-xs font-medium ${memColor(memPercent)}`}>
            {Math.round(memPercent * 100)}% used
          </span>
          <span className="text-xs text-zinc-400">
            {runOnGpu ? "⚡ GPU" : "🖥 CPU"}
          </span>
          <span
            className={`ml-auto text-xs font-medium px-2.5 py-1 rounded-full ${familyColor}`}
          >
            {model.family}
          </span>
          {model.isCustom && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 font-semibold">
              Custom
            </span>
          )}
          {model.isLive && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-semibold">
              Live
            </span>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-lg">
            Needs {memUsed} GB {memLabel}
          </span>
          <span className="text-xs text-zinc-400">won't load</span>
          <span
            className={`ml-auto text-xs font-medium px-2.5 py-1 rounded-full ${familyColor}`}
          >
            {model.family}
          </span>
          {model.isCustom && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 font-semibold">
              Custom
            </span>
          )}
          {model.isLive && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-semibold">
              Live
            </span>
          )}
        </div>
      )}

      {/* Quantization + quality (only for fitting models) */}
      {fits && (
        <div className="flex items-center gap-2">
          <span
            className="relative group text-xs font-medium px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 cursor-help"
            title={QUANT_TOOLTIPS[bestVariant.quantization]}
          >
            {bestVariant.quantization}
            {QUANT_TOOLTIPS[bestVariant.quantization] && (
              <span className="pointer-events-none absolute bottom-full left-0 mb-1.5 w-52 text-xs leading-snug bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 px-2.5 py-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-normal">
                {QUANT_TOOLTIPS[bestVariant.quantization]}
              </span>
            )}
          </span>
          <span
            className={`text-xs font-medium ${getQualityColor(bestVariant.quality)}`}
          >
            {getQualityLabel(bestVariant.quality)}
          </span>
        </div>
      )}

      {/* Description */}
      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
        {model.description}
      </p>

      {/* Use-case tags */}
      <div className="flex flex-wrap gap-1">
        {model.useCases.slice(0, 4).map((uc) => (
          <span
            key={uc}
            className="text-xs px-2.5 py-1 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-md border border-zinc-200 dark:border-zinc-700"
          >
            {uc}
          </span>
        ))}
      </div>

      {/* How to run — only for models that fit */}
      {fits && (
        <div className="border-t border-zinc-100 dark:border-zinc-800 pt-2">
          <button
            onClick={() => setShowRun((v) => !v)}
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
          >
            <span
              className={`transition-transform duration-150 ${showRun ? "rotate-90" : ""}`}
            >
              ▶
            </span>
            How to run
          </button>

          {showRun && (
            <div className="mt-2.5 flex flex-col gap-2.5">
              {ollamaCmd && (
                <CommandRow
                  label="Ollama — easiest"
                  cmd={ollamaCmd}
                  recommended={recommendedRuntime === "ollama"}
                />
              )}
              <CommandRow
                label="llama.cpp — fastest"
                cmd={llamaCppCmd}
                recommended={recommendedRuntime === "llamacpp"}
              />
              <CommandRow
                label="LM Studio — GUI"
                cmd={lmStudioCmd}
                recommended={recommendedRuntime === "lmstudio"}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
