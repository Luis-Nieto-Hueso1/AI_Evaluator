import { useState, useMemo } from "react";
import stacksRaw from "../data/deployment-stacks.json";

interface Stack {
  id: string;
  name: string;
  icon: string;
  url: string;
  targets: string[];
  quantFormats: string[];
  pros: string[];
  cons: string[];
  install: string;
  runCmd: string;
  configFlags: string[];
  memoryNote: string;
  bestFor: string;
  gpuRequired: boolean;
  complexity: string;
}

const STACKS = stacksRaw as Stack[];

type Target = "laptop" | "gpu-server" | "edge" | "cloud";
type Priority = "easy" | "fast" | "flexible";

const TARGET_OPTIONS: {
  value: Target;
  label: string;
  icon: string;
  desc: string;
}[] = [
  {
    value: "laptop",
    label: "Laptop / Desktop",
    icon: "💻",
    desc: "Local CPU or consumer GPU",
  },
  {
    value: "gpu-server",
    label: "GPU Server",
    icon: "⚡",
    desc: "Dedicated NVIDIA GPU(s)",
  },
  {
    value: "edge",
    label: "Edge / Embedded",
    icon: "📱",
    desc: "Raspberry Pi, Jetson, mobile",
  },
  { value: "cloud", label: "Cloud", icon: "☁️", desc: "AWS, GCP, Azure, etc." },
];

const PRIORITY_OPTIONS: { value: Priority; label: string; desc: string }[] = [
  {
    value: "easy",
    label: "Easiest setup",
    desc: "Fewest steps to get running",
  },
  { value: "fast", label: "Maximum speed", desc: "Highest tok/s throughput" },
  {
    value: "flexible",
    label: "Most flexible",
    desc: "Best control & configuration",
  },
];

function scoreStack(
  stack: Stack,
  target: Target,
  priority: Priority,
  hasGpu: boolean,
): number {
  let score = 0;

  // Target match (0-40)
  if (stack.targets.includes(target)) score += 40;
  else score += 5;

  // GPU match (0-20)
  if (stack.gpuRequired && !hasGpu) return 0; // can't run
  if (!stack.gpuRequired && !hasGpu) score += 20;
  if (hasGpu) score += 15;

  // Priority (0-30)
  if (priority === "easy") {
    if (stack.complexity === "low") score += 30;
    else if (stack.complexity === "medium") score += 15;
    else score += 5;
  } else if (priority === "fast") {
    if (stack.complexity === "high")
      score += 25; // usually the fastest
    else if (stack.complexity === "medium") score += 20;
    else score += 10;
    // Bonus for GPU-native stacks when target is GPU
    if (stack.gpuRequired && hasGpu) score += 10;
  } else {
    // flexible
    if (stack.configFlags.length >= 4) score += 25;
    else if (stack.configFlags.length >= 2) score += 15;
    else score += 5;
  }

  return Math.min(100, score);
}

function OptionButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all cursor-pointer border ${
        selected
          ? "bg-violet-50 dark:bg-violet-900/20 border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300 ring-1 ring-violet-300 dark:ring-violet-700"
          : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-600"
      }`}
    >
      {children}
    </button>
  );
}

const COMPLEXITY_COLORS: Record<string, string> = {
  low: "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30",
  medium:
    "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30",
  high: "text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900/30",
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
      className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors cursor-pointer shrink-0"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function StackCard({
  stack,
  rank,
  score,
}: {
  stack: Stack;
  rank: number;
  score: number;
}) {
  const [open, setOpen] = useState(rank === 1);
  const barWidth = Math.max(8, score);

  return (
    <div
      className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden hover:border-violet-300 dark:hover:border-violet-700 transition-colors cursor-pointer"
      onClick={() => setOpen((v) => !v)}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="text-lg">{stack.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500">
              #{rank}
            </span>
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
              {stack.name}
            </span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${COMPLEXITY_COLORS[stack.complexity] ?? ""}`}
            >
              {stack.complexity}
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
            {stack.bestFor}
          </p>
        </div>
        {/* Score bar */}
        <div className="w-20 shrink-0">
          <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-violet-500 transition-all"
              style={{ width: `${barWidth}%` }}
            />
          </div>
          <p className="text-[10px] text-zinc-400 text-right mt-0.5">
            {score}/100
          </p>
        </div>
        <svg
          className={`w-4 h-4 shrink-0 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`}
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
      </div>

      {/* Expanded */}
      {open && (
        <div
          className="px-4 pb-4 pt-1 border-t border-zinc-100 dark:border-zinc-800 space-y-3"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {stack.quantFormats.map((f) => (
              <span
                key={f}
                className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-mono font-medium"
              >
                {f}
              </span>
            ))}
            {stack.gpuRequired && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-medium">
                GPU required
              </span>
            )}
            {!stack.gpuRequired && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium">
                CPU OK
              </span>
            )}
          </div>

          {/* Install */}
          <div>
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide mb-1">
              Install
            </p>
            <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg px-3 py-2">
              <code className="text-xs text-zinc-700 dark:text-zinc-200 font-mono flex-1 overflow-x-auto whitespace-nowrap">
                {stack.install}
              </code>
              <CopyButton text={stack.install} />
            </div>
          </div>

          {/* Run command */}
          <div>
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide mb-1">
              Run
            </p>
            <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg px-3 py-2">
              <code className="text-xs text-zinc-700 dark:text-zinc-200 font-mono flex-1 overflow-x-auto whitespace-nowrap">
                {stack.runCmd}
              </code>
              <CopyButton text={stack.runCmd} />
            </div>
          </div>

          {/* Config flags */}
          <div>
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide mb-1">
              Key config flags
            </p>
            <div className="flex flex-wrap gap-1.5">
              {stack.configFlags.map((f) => (
                <code
                  key={f}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-mono"
                >
                  {f}
                </code>
              ))}
            </div>
          </div>

          {/* Memory note */}
          <p className="text-xs text-zinc-600 dark:text-zinc-300">
            <span className="font-medium text-zinc-700 dark:text-zinc-200">
              Memory:
            </span>{" "}
            {stack.memoryNote}
          </p>

          {/* Pros / Cons */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-1">
                Pros
              </p>
              <ul className="space-y-0.5">
                {stack.pros.map((p) => (
                  <li
                    key={p}
                    className="text-xs text-zinc-600 dark:text-zinc-300 flex items-start gap-1"
                  >
                    <span className="text-emerald-500 shrink-0">+</span> {p}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-red-500 dark:text-red-400 uppercase tracking-wide mb-1">
                Cons
              </p>
              <ul className="space-y-0.5">
                {stack.cons.map((c) => (
                  <li
                    key={c}
                    className="text-xs text-zinc-600 dark:text-zinc-300 flex items-start gap-1"
                  >
                    <span className="text-red-400 shrink-0">-</span> {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Docs link */}
          <a
            href={stack.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-violet-600 dark:text-violet-400 font-medium hover:underline"
          >
            Official docs ↗
          </a>
        </div>
      )}
    </div>
  );
}

export function DeploymentGuide() {
  const [target, setTarget] = useState<Target | null>(null);
  const [priority, setPriority] = useState<Priority | null>(null);
  const [hasGpu, setHasGpu] = useState<boolean | null>(null);

  const results = useMemo(() => {
    if (!target) return [];
    const gpu = hasGpu ?? (target === "gpu-server" || target === "cloud");
    const prio = priority ?? "easy";
    return STACKS.map((s) => ({
      stack: s,
      score: scoreStack(s, target, prio, gpu),
    }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score);
  }, [target, priority, hasGpu]);

  function reset() {
    setTarget(null);
    setPriority(null);
    setHasGpu(null);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Questionnaire */}
      <div className="lg:col-span-1 space-y-5">
        {/* Target */}
        <div>
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2">
            1 · Where will you deploy?
          </p>
          <div className="space-y-1.5">
            {TARGET_OPTIONS.map((opt) => (
              <OptionButton
                key={opt.value}
                selected={target === opt.value}
                onClick={() => setTarget(opt.value)}
              >
                <span className="mr-2">{opt.icon}</span>
                <span className="font-medium">{opt.label}</span>
                <span className="text-zinc-400 dark:text-zinc-500 ml-1.5 text-xs">
                  — {opt.desc}
                </span>
              </OptionButton>
            ))}
          </div>
        </div>

        {/* GPU */}
        {target && (
          <div>
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2">
              2 · Do you have a GPU?
            </p>
            <div className="space-y-1.5">
              <OptionButton
                selected={hasGpu === true}
                onClick={() => setHasGpu(true)}
              >
                <span className="font-medium">Yes</span>
                <span className="text-zinc-400 dark:text-zinc-500 ml-1.5 text-xs">
                  — NVIDIA or Apple Silicon
                </span>
              </OptionButton>
              <OptionButton
                selected={hasGpu === false}
                onClick={() => setHasGpu(false)}
              >
                <span className="font-medium">No</span>
                <span className="text-zinc-400 dark:text-zinc-500 ml-1.5 text-xs">
                  — CPU only
                </span>
              </OptionButton>
            </div>
          </div>
        )}

        {/* Priority */}
        {hasGpu !== null && (
          <div>
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2">
              3 · What matters most?
            </p>
            <div className="space-y-1.5">
              {PRIORITY_OPTIONS.map((opt) => (
                <OptionButton
                  key={opt.value}
                  selected={priority === opt.value}
                  onClick={() => setPriority(opt.value)}
                >
                  <span className="font-medium">{opt.label}</span>
                  <span className="text-zinc-400 dark:text-zinc-500 ml-1.5 text-xs">
                    — {opt.desc}
                  </span>
                </OptionButton>
              ))}
            </div>
          </div>
        )}

        {/* Reset */}
        {target && (
          <button
            onClick={reset}
            className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer underline"
          >
            Reset
          </button>
        )}
      </div>

      {/* Right: Results */}
      <div className="lg:col-span-2">
        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 gap-3">
            <span className="text-3xl">🚀</span>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center px-4">
              Select your target environment to see deployment recommendations
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                <span className="text-violet-600 dark:text-violet-400 font-bold">
                  {results.length}
                </span>{" "}
                deployment stacks ranked for your setup
              </p>
            </div>
            <div className="space-y-2">
              {results.map(({ stack, score }, i) => (
                <StackCard
                  key={stack.id}
                  stack={stack}
                  rank={i + 1}
                  score={score}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
