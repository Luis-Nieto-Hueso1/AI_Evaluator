import type { CompatibleModel, Grade } from "../types";
import { getQualityColor, getQualityLabel } from "../lib/compatibility";

interface Props {
  item: CompatibleModel;
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
};

const GRADE_STYLES: Record<Grade, { bg: string; text: string; label: string }> =
  {
    S: { bg: "bg-emerald-500", text: "text-white", label: "Runs great" },
    A: { bg: "bg-blue-500", text: "text-white", label: "Runs well" },
    B: { bg: "bg-violet-500", text: "text-white", label: "Decent" },
    C: { bg: "bg-amber-500", text: "text-white", label: "Tight fit" },
    D: { bg: "bg-red-500", text: "text-white", label: "Barely runs" },
  };

function formatToks(toks: number): string {
  if (toks >= 100) return ">100 tok/s";
  if (toks >= 1) return `~${Math.round(toks)} tok/s`;
  return `<1 tok/s`;
}

function formatContext(tokens: number): string {
  if (tokens >= 131072) return "128K ctx";
  if (tokens >= 65536) return "64K ctx";
  if (tokens >= 32768) return "32K ctx";
  if (tokens >= 16384) return "16K ctx";
  return "8K ctx";
}

export function ModelCard({ item }: Props) {
  const { model, bestVariant, runOnGpu, tokensPerSec, grade } = item;
  const gradeStyle = GRADE_STYLES[grade];
  const familyColor =
    FAMILY_COLORS[model.family] ??
    "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
  const memUsed = runOnGpu ? bestVariant.vramRequired : bestVariant.ramRequired;
  const memLabel = runOnGpu ? "VRAM" : "RAM";

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm leading-tight truncate">
            {model.name}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            {model.parameters}B · {formatContext(model.contextLength)} ·{" "}
            {model.license === "open" ? "Open" : "Restricted"}
          </p>
        </div>

        {/* Grade badge */}
        <div className="shrink-0 flex flex-col items-center">
          <span
            className={`${gradeStyle.bg} ${gradeStyle.text} text-lg font-black w-9 h-9 flex items-center justify-center rounded-xl leading-none`}
          >
            {grade}
          </span>
          <span className="text-[10px] text-zinc-400 mt-0.5 whitespace-nowrap">
            {gradeStyle.label}
          </span>
        </div>
      </div>

      {/* Speed + memory row */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-lg">
          {formatToks(tokensPerSec)}
        </span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {memUsed} GB {memLabel}
        </span>
        <span className="text-xs text-zinc-400">
          {runOnGpu ? "⚡ GPU" : "🖥 CPU"}
        </span>
        <span
          className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${familyColor}`}
        >
          {model.family}
        </span>
      </div>

      {/* Quantization + quality */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
          {bestVariant.quantization}
        </span>
        <span
          className={`text-xs font-medium ${getQualityColor(bestVariant.quality)}`}
        >
          {getQualityLabel(bestVariant.quality)}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
        {model.description}
      </p>

      {/* Use-case tags */}
      <div className="flex flex-wrap gap-1">
        {model.useCases.slice(0, 4).map((uc) => (
          <span
            key={uc}
            className="text-xs px-2 py-0.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-md border border-zinc-200 dark:border-zinc-700"
          >
            {uc}
          </span>
        ))}
      </div>
    </div>
  );
}
