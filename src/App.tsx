import { useState, useMemo } from "react";
import type { HardwareProfile, CompatibleModel, Grade } from "./types";
import { getCompatibleModels } from "./lib/compatibility";
import { HardwareForm } from "./components/HardwareForm";
import { ModelCard } from "./components/ModelCard";
import { AdvisorChat } from "./components/AdvisorChat";

const DEFAULT_HARDWARE: HardwareProfile = { ram: 16, vram: 0, hasGpu: false };
const HAS_API_KEY = Boolean(import.meta.env.VITE_ANTHROPIC_API_KEY);

type SortKey = "grade" | "speed" | "params" | "vram" | "context";

const GRADE_ORDER: Grade[] = ["S", "A", "B", "C", "D"];

const GRADE_COLORS: Record<Grade, string> = {
  S: "bg-emerald-500 text-white",
  A: "bg-blue-500 text-white",
  B: "bg-violet-500 text-white",
  C: "bg-amber-500 text-white",
  D: "bg-red-500 text-white",
};

const GRADE_INACTIVE: Record<Grade, string> = {
  S: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40",
  A: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40",
  B: "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/40",
  C: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40",
  D: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40",
};

export default function App() {
  const [hardware, setHardware] = useState<HardwareProfile>(DEFAULT_HARDWARE);
  const [compatible, setCompatible] = useState<CompatibleModel[]>(() =>
    getCompatibleModels(DEFAULT_HARDWARE),
  );
  const [filterGrade, setFilterGrade] = useState<Grade | null>(null);
  const [filterUseCase, setFilterUseCase] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("grade");

  function handleHardwareSubmit(profile: HardwareProfile) {
    setHardware(profile);
    setCompatible(getCompatibleModels(profile));
    setFilterGrade(null);
    setFilterUseCase(null);
  }

  // Grade counts
  const gradeCounts = useMemo(
    () =>
      GRADE_ORDER.reduce(
        (acc, g) => ({
          ...acc,
          [g]: compatible.filter((c) => c.grade === g).length,
        }),
        {} as Record<Grade, number>,
      ),
    [compatible],
  );

  const allUseCases = useMemo(
    () =>
      Array.from(new Set(compatible.flatMap((c) => c.model.useCases))).sort(),
    [compatible],
  );

  // Filter
  const afterFilter = useMemo(() => {
    let list = compatible;
    if (filterGrade) list = list.filter((c) => c.grade === filterGrade);
    if (filterUseCase)
      list = list.filter((c) => c.model.useCases.includes(filterUseCase));
    return list;
  }, [compatible, filterGrade, filterUseCase]);

  // Sort
  const sorted = useMemo(() => {
    const list = [...afterFilter];
    switch (sortKey) {
      case "grade":
        return list.sort((a, b) => {
          const d = GRADE_ORDER.indexOf(a.grade) - GRADE_ORDER.indexOf(b.grade);
          return d !== 0 ? d : b.model.parameters - a.model.parameters;
        });
      case "speed":
        return list.sort((a, b) => b.tokensPerSec - a.tokensPerSec);
      case "params":
        return list.sort((a, b) => b.model.parameters - a.model.parameters);
      case "vram":
        return list.sort(
          (a, b) => a.bestVariant.vramRequired - b.bestVariant.vramRequired,
        );
      case "context":
        return list.sort(
          (a, b) => b.model.contextLength - a.model.contextLength,
        );
    }
  }, [afterFilter, sortKey]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              LLM Evaluator
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Find which models your hardware can run
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
            Which LLMs can your machine run?
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto text-sm sm:text-base">
            Enter your hardware and we'll show you which models you can run
            locally — graded by how well they'll actually perform.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-1 space-y-4">
            <HardwareForm onSubmit={handleHardwareSubmit} initial={hardware} />
            <AdvisorChat
              hardware={hardware}
              compatible={compatible}
              hasApiKey={HAS_API_KEY}
            />
          </div>

          {/* Right column — results */}
          <div className="lg:col-span-2">
            {/* Stats + sort bar */}
            <div className="flex items-center justify-between mb-3 gap-3">
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 shrink-0">
                <span className="text-violet-600 dark:text-violet-400 font-bold">
                  {compatible.length}
                </span>{" "}
                models · {hardware.ram} GB RAM
                {hardware.hasGpu && ` + ${hardware.vram} GB VRAM`}
              </p>

              {/* Sort */}
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className="text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg px-2 py-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="grade">Sort: Grade</option>
                <option value="speed">Sort: Speed</option>
                <option value="params">Sort: Parameters</option>
                <option value="vram">Sort: VRAM (low→high)</option>
                <option value="context">Sort: Context</option>
              </select>
            </div>

            {/* Grade filter pills */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              <button
                onClick={() => setFilterGrade(null)}
                className={`text-xs px-3 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                  !filterGrade
                    ? "bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
              >
                All {compatible.length}
              </button>
              {GRADE_ORDER.filter((g) => gradeCounts[g] > 0).map((g) => (
                <button
                  key={g}
                  onClick={() => setFilterGrade(filterGrade === g ? null : g)}
                  className={`text-xs px-3 py-1 rounded-full font-bold transition-colors cursor-pointer ${
                    filterGrade === g ? GRADE_COLORS[g] : GRADE_INACTIVE[g]
                  }`}
                >
                  {g} · {gradeCounts[g]}
                </button>
              ))}
            </div>

            {/* Use-case filter pills */}
            {allUseCases.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {allUseCases.map((uc) => (
                  <button
                    key={uc}
                    onClick={() =>
                      setFilterUseCase(filterUseCase === uc ? null : uc)
                    }
                    className={`text-xs px-3 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                      filterUseCase === uc
                        ? "bg-violet-600 text-white"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    }`}
                  >
                    {uc}
                  </button>
                ))}
              </div>
            )}

            {/* Model grid */}
            {sorted.length === 0 ? (
              <div className="flex items-center justify-center h-40 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                <p className="text-zinc-400 dark:text-zinc-500 text-sm">
                  No models match this filter
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sorted.map((item) => (
                  <ModelCard key={item.model.id} item={item} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-xs text-zinc-400 dark:text-zinc-500">
          Speed estimates are approximate (based on memory bandwidth). Actual
          performance varies by runtime, quantization, and system load.
        </div>
      </footer>
    </div>
  );
}
