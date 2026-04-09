import { useState, useMemo } from "react";
import type { CompatibleModel, Grade, HardwareProfile } from "../types";
import { getAllModels } from "../lib/compatibility";
import { GPU_LIST, GPU_BANDWIDTH } from "../lib/hardware-detect";

const RAM_OPTIONS = [4, 8, 16, 32, 64, 128];

const GRADE_ORDER: Grade[] = ["S", "A", "B", "C", "D", "F"];

const SCORE_COLOR: (score: number, fits: boolean) => string = (score, fits) => {
  if (!fits) return "bg-zinc-200 dark:bg-zinc-700 text-zinc-500";
  if (score >= 85) return "bg-emerald-500 text-white";
  if (score >= 70) return "bg-blue-500 text-white";
  if (score >= 55) return "bg-violet-500 text-white";
  if (score >= 40) return "bg-amber-500 text-white";
  if (score >= 20) return "bg-red-500 text-white";
  return "bg-zinc-400 text-white";
};

interface DeviceConfig {
  gpuId: string | null;
  ram: number;
}

function buildHardware(config: DeviceConfig): HardwareProfile {
  if (config.gpuId) {
    const gpu = GPU_LIST.find((g) => g.id === config.gpuId);
    if (gpu) {
      return {
        ram: gpu.unified ? gpu.vram : config.ram,
        vram: gpu.vram,
        hasGpu: true,
        bandwidth: GPU_BANDWIDTH[gpu.id],
        gpuId: gpu.id,
      };
    }
  }
  return { ram: config.ram, vram: 0, hasGpu: false };
}

function DevicePicker({
  label,
  config,
  onChange,
}: {
  label: string;
  config: DeviceConfig;
  onChange: (c: DeviceConfig) => void;
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const selectedGpu = config.gpuId
    ? (GPU_LIST.find((g) => g.id === config.gpuId) ?? null)
    : null;

  const filtered = GPU_LIST.filter(
    (g) =>
      search === "" ||
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.brand.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
        {label}
      </h3>

      {/* GPU picker */}
      <div className="mb-3 relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full text-left px-3 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-violet-400 transition-colors"
        >
          {selectedGpu
            ? `${selectedGpu.name} (${selectedGpu.vram} GB)`
            : "CPU only"}
        </button>
        {open && (
          <div className="absolute z-20 top-full mt-1 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl overflow-hidden">
            <div className="p-2 border-b border-zinc-100 dark:border-zinc-800">
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search GPU…"
                aria-label="Search GPU for comparison"
                className="w-full text-sm px-3 py-2 rounded bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none"
              />
            </div>
            <div className="max-h-64 overflow-y-auto">
              <div
                onClick={() => {
                  onChange({ ...config, gpuId: null });
                  setOpen(false);
                  setSearch("");
                }}
                className="px-3 py-1.5 text-sm text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer border-b border-zinc-100 dark:border-zinc-800"
              >
                CPU only
              </div>
              {filtered.map((gpu) => (
                <div
                  key={gpu.id}
                  onClick={() => {
                    onChange({ ...config, gpuId: gpu.id });
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`flex items-center justify-between px-3 py-1.5 cursor-pointer text-sm transition-colors ${
                    config.gpuId === gpu.id
                      ? "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300"
                      : "hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  <span>{gpu.name}</span>
                  <span className="text-xs text-zinc-400">{gpu.vram} GB</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* RAM (hidden for unified) */}
      {!selectedGpu?.unified && (
        <div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1.5">RAM</p>
          <div className="flex flex-wrap gap-1.5">
            {RAM_OPTIONS.map((gb) => (
              <button
                key={gb}
                type="button"
                onClick={() => onChange({ ...config, ram: gb })}
                className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  config.ram === gb
                    ? "bg-violet-600 text-white"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
              >
                {gb} GB
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <p className="text-xs text-zinc-400 mt-2">
        {selectedGpu
          ? selectedGpu.unified
            ? `${selectedGpu.vram} GB unified · ${GPU_BANDWIDTH[selectedGpu.id] ?? "?"} GB/s`
            : `${selectedGpu.vram} GB VRAM · ${config.ram} GB RAM · ${GPU_BANDWIDTH[selectedGpu.id] ?? "?"} GB/s`
          : `${config.ram} GB RAM · CPU only`}
      </p>
    </div>
  );
}

function formatToks(toks: number): string {
  if (toks >= 100) return ">100 tok/s";
  if (toks >= 1) return `~${Math.round(toks)} tok/s`;
  return "<1 tok/s";
}

// suppress unused import warning
void (GRADE_ORDER as Grade[]);

export function CompareView() {
  const [configA, setConfigA] = useState<DeviceConfig>({
    gpuId: null,
    ram: 16,
  });
  const [configB, setConfigB] = useState<DeviceConfig>({
    gpuId: null,
    ram: 32,
  });

  const hwA = useMemo(() => buildHardware(configA), [configA]);
  const hwB = useMemo(() => buildHardware(configB), [configB]);

  const modelsA = useMemo(() => getAllModels(hwA), [hwA]);
  const modelsB = useMemo(() => getAllModels(hwB), [hwB]);

  // All models union, keyed by id
  const modelMap = useMemo(() => {
    const map = new Map<string, { a: CompatibleModel; b: CompatibleModel }>();
    for (const m of modelsA) {
      const b = modelsB.find((x) => x.model.id === m.model.id);
      if (b) map.set(m.model.id, { a: m, b });
    }
    return map;
  }, [modelsA, modelsB]);

  const rows = useMemo(
    () =>
      Array.from(modelMap.values()).sort((x, y) => {
        const avgX = (x.a.score + x.b.score) / 2;
        const avgY = (y.a.score + y.b.score) / 2;
        return avgY - avgX;
      }),
    [modelMap],
  );

  const TIE_THRESHOLD = 4;
  const wins = useMemo(() => {
    let a = 0,
      b = 0,
      tie = 0;
    for (const { a: ma, b: mb } of rows) {
      const diff = ma.score - mb.score;
      if (Math.abs(diff) <= TIE_THRESHOLD) tie++;
      else if (diff > 0) a++;
      else b++;
    }
    return { a, b, tie };
  }, [rows]);

  return (
    <div>
      <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">
        Compare Devices
      </h2>

      {/* Device pickers */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <DevicePicker label="Device A" config={configA} onChange={setConfigA} />
        <DevicePicker label="Device B" config={configB} onChange={setConfigB} />
      </div>

      {/* Win counters */}
      <div className="flex items-center justify-center gap-4 mb-4 py-3 px-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl">
        <div className="text-center">
          <p className="text-xl font-black text-blue-600 dark:text-blue-400">
            {wins.a}
          </p>
          <p className="text-xs text-zinc-500">A wins</p>
        </div>
        <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-700" />
        <div className="text-center">
          <p className="text-xl font-black text-zinc-500">{wins.tie}</p>
          <p className="text-xs text-zinc-500">Ties</p>
        </div>
        <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-700" />
        <div className="text-center">
          <p className="text-xl font-black text-violet-600 dark:text-violet-400">
            {wins.b}
          </p>
          <p className="text-xs text-zinc-500">B wins</p>
        </div>
      </div>

      {/* Comparison table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
        {/* Column headers */}
        <div className="grid grid-cols-[1fr_80px_80px] gap-0 px-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-700">
          <span className="text-xs font-semibold text-zinc-500">Model</span>
          <span className="text-xs font-semibold text-zinc-500 text-center">
            A
          </span>
          <span className="text-xs font-semibold text-zinc-500 text-center">
            B
          </span>
        </div>

        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {rows.map(({ a, b }) => {
            const diff = a.score - b.score;
            const isTie = Math.abs(diff) <= TIE_THRESHOLD;
            const aWins = !isTie && diff > 0;
            const bWins = !isTie && diff < 0;

            return (
              <div
                key={a.model.id}
                className="grid grid-cols-[1fr_80px_80px] gap-0 px-4 py-2.5 items-center hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
              >
                {/* Model name */}
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                    {a.model.name}
                  </p>
                  <p className="text-xs text-zinc-400">{a.model.parameters}B</p>
                </div>

                {/* Score A */}
                <div
                  className={`flex flex-col items-center ${bWins ? "opacity-50" : ""}`}
                >
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg ${SCORE_COLOR(a.score, a.fits)}`}
                  >
                    {a.fits ? a.score : "—"}
                  </span>
                  {a.fits && (
                    <span className="text-xs text-zinc-400 mt-0.5">
                      {formatToks(a.tokensPerSec)}
                    </span>
                  )}
                  {aWins && (
                    <span className="text-xs text-blue-500 font-bold mt-0.5">
                      ▲ A
                    </span>
                  )}
                </div>

                {/* Score B */}
                <div
                  className={`flex flex-col items-center ${aWins ? "opacity-50" : ""}`}
                >
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg ${SCORE_COLOR(b.score, b.fits)}`}
                  >
                    {b.fits ? b.score : "—"}
                  </span>
                  {b.fits && (
                    <span className="text-xs text-zinc-400 mt-0.5">
                      {formatToks(b.tokensPerSec)}
                    </span>
                  )}
                  {bWins && (
                    <span className="text-xs text-violet-500 font-bold mt-0.5">
                      ▲ B
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
