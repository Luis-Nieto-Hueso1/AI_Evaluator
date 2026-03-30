import { useState, useMemo } from "react";
import type { Model } from "../types";
import modelsData from "../data/models.json";

const ALL_MODELS = (modelsData as Model[]).filter((m) => m.benchmarks);

type SortCol = "mmlu" | "humanEval" | "mtBench" | "params";

function scoreColor(val: number, max: number): string {
  const ratio = val / max;
  if (ratio >= 0.75) return "text-emerald-600 dark:text-emerald-400";
  if (ratio >= 0.5) return "text-amber-600 dark:text-amber-400";
  return "text-red-500 dark:text-red-400";
}

export function Leaderboard() {
  const [sortCol, setSortCol] = useState<SortCol>("mmlu");
  const [sortAsc, setSortAsc] = useState(false);

  function toggleSort(col: SortCol) {
    if (sortCol === col) setSortAsc((v) => !v);
    else {
      setSortCol(col);
      setSortAsc(false);
    }
  }

  const sorted = useMemo(() => {
    const list = [...ALL_MODELS];
    const dir = sortAsc ? 1 : -1;
    list.sort((a, b) => {
      switch (sortCol) {
        case "mmlu":
          return ((a.benchmarks?.mmlu ?? 0) - (b.benchmarks?.mmlu ?? 0)) * dir;
        case "humanEval":
          return (
            ((a.benchmarks?.humanEval ?? 0) - (b.benchmarks?.humanEval ?? 0)) *
            dir
          );
        case "mtBench":
          return (
            ((a.benchmarks?.mtBench ?? 0) - (b.benchmarks?.mtBench ?? 0)) * dir
          );
        case "params":
          return (a.parameters - b.parameters) * dir;
      }
    });
    return list;
  }, [sortCol, sortAsc]);

  const arrow = sortAsc ? " ↑" : " ↓";

  function ColHeader({
    col,
    label,
    className,
  }: {
    col: SortCol;
    label: string;
    className?: string;
  }) {
    return (
      <th
        onClick={() => toggleSort(col)}
        className={`px-3 py-2 text-left cursor-pointer hover:text-violet-600 dark:hover:text-violet-400 select-none transition-colors ${className ?? ""}`}
      >
        {label}
        {sortCol === col && (
          <span className="text-violet-500 ml-0.5">{arrow}</span>
        )}
      </th>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wide text-[10px]">
              <th className="px-3 py-2 text-left w-10">#</th>
              <th className="px-3 py-2 text-left">Model</th>
              <ColHeader col="params" label="Params" />
              <ColHeader col="mmlu" label="MMLU %" />
              <ColHeader col="humanEval" label="HumanEval %" />
              <ColHeader col="mtBench" label="MT-Bench /10" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((m, i) => (
              <tr
                key={m.id}
                className="border-b border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
              >
                <td className="px-3 py-2 text-zinc-400 font-mono">{i + 1}</td>
                <td className="px-3 py-2 font-medium text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                  {m.name}
                  <span className="ml-1.5 text-[10px] text-zinc-400 font-normal">
                    {m.family}
                  </span>
                </td>
                <td className="px-3 py-2 text-zinc-600 dark:text-zinc-300 font-mono">
                  {m.parameters}B
                </td>
                <td
                  className={`px-3 py-2 font-mono font-semibold ${m.benchmarks?.mmlu ? scoreColor(m.benchmarks.mmlu, 100) : "text-zinc-300 dark:text-zinc-700"}`}
                >
                  {m.benchmarks?.mmlu?.toFixed(1) ?? "—"}
                </td>
                <td
                  className={`px-3 py-2 font-mono font-semibold ${m.benchmarks?.humanEval ? scoreColor(m.benchmarks.humanEval, 100) : "text-zinc-300 dark:text-zinc-700"}`}
                >
                  {m.benchmarks?.humanEval?.toFixed(1) ?? "—"}
                </td>
                <td
                  className={`px-3 py-2 font-mono font-semibold ${m.benchmarks?.mtBench ? scoreColor(m.benchmarks.mtBench, 10) : "text-zinc-300 dark:text-zinc-700"}`}
                >
                  {m.benchmarks?.mtBench?.toFixed(1) ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2 text-[10px] text-zinc-400 dark:text-zinc-500 border-t border-zinc-100 dark:border-zinc-800">
        {ALL_MODELS.length} models with benchmark data · Click column headers to
        sort
      </div>
    </div>
  );
}
