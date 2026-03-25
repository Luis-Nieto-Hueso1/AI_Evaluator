import { useState, useEffect, useRef } from "react";
import type { HardwareProfile } from "../types";
import {
  detectHardware,
  GPU_LIST,
  GPU_BANDWIDTH,
  CPU_LIST,
  type GpuOption,
  type CpuOption,
} from "../lib/hardware-detect";

interface Props {
  onSubmit: (profile: HardwareProfile) => void;
  initial: HardwareProfile;
}

const RAM_OPTIONS = [4, 8, 16, 32, 64, 128];

const BRAND_COLORS: Record<string, string> = {
  NVIDIA: "text-green-600 dark:text-green-400",
  AMD: "text-red-600 dark:text-red-400",
  Intel: "text-blue-600 dark:text-blue-400",
  Apple: "text-zinc-500 dark:text-zinc-400",
};

const CPU_BRAND_COLORS: Record<string, string> = {
  Intel: "text-blue-600 dark:text-blue-400",
  AMD: "text-red-600 dark:text-red-400",
};

const BRAND_ORDER = ["NVIDIA", "AMD", "Intel", "Apple"];
const CPU_BRAND_ORDER = ["Intel", "AMD"];

export function HardwareForm({ onSubmit, initial }: Props) {
  const [ram, setRam] = useState(initial.ram);
  const [selectedGpu, setSelectedGpu] = useState<GpuOption | null>(null);
  const [noGpu, setNoGpu] = useState(true);
  const [search, setSearch] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [selectedCpu, setSelectedCpu] = useState<CpuOption | null>(null);
  const [cpuSearch, setCpuSearch] = useState("");
  const [showCpuPicker, setShowCpuPicker] = useState(false);
  const [detectedLabel, setDetectedLabel] = useState<string | null>(null);
  const [deviceModel, setDeviceModel] = useState<string | null>(null);
  const [ramCapped, setRamCapped] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const cpuSearchRef = useRef<HTMLInputElement>(null);

  // Auto-detect on mount
  useEffect(() => {
    const d = detectHardware();

    if (d.deviceModel) setDeviceModel(d.deviceModel);
    if (d.ram !== null) {
      setRam(snapToNearest(d.ram, RAM_OPTIONS));
      setRamCapped(d.ramCapped);
    }

    if (d.isAppleSilicon && d.gpuName) {
      const match = GPU_LIST.find(
        (g) =>
          g.brand === "Apple" &&
          d.gpuName!.toLowerCase().includes(g.series.toLowerCase()),
      );
      if (match) {
        setSelectedGpu(match);
        setNoGpu(false);
        setRam(match.vram);
        setDetectedLabel(`Detected: ${d.gpuName} (unified memory)`);
      } else {
        setDetectedLabel(
          `Detected: ${d.gpuName} — select your memory size below`,
        );
        setShowPicker(true);
      }
      return;
    }

    if (d.hasGpu && d.vram !== null && d.gpuName) {
      const match =
        GPU_LIST.find(
          (g) =>
            g.vram === d.vram &&
            d
              .gpuName!.toLowerCase()
              .includes(
                g.name
                  .toLowerCase()
                  .replace("rtx ", "")
                  .replace("gtx ", "")
                  .replace("rx ", "")
                  .slice(0, 6),
              ),
        ) ?? GPU_LIST.find((g) => g.vram === d.vram && g.brand !== "Apple");

      if (match) {
        setSelectedGpu(match);
        setNoGpu(false);
        setDetectedLabel(`Detected: ${d.gpuName}`);
      } else {
        setDetectedLabel(`Detected GPU: ${d.gpuName} — select below`);
        setNoGpu(false);
        setShowPicker(true);
      }
    }
  }, []);

  useEffect(() => {
    if (showPicker) setTimeout(() => searchRef.current?.focus(), 50);
  }, [showPicker]);

  useEffect(() => {
    if (showCpuPicker) setTimeout(() => cpuSearchRef.current?.focus(), 50);
  }, [showCpuPicker]);

  function handleGpuSelect(gpu: GpuOption) {
    setSelectedGpu(gpu);
    setNoGpu(false);
    setShowPicker(false);
    setSearch("");
    if (gpu.unified) setRam(gpu.vram);
  }

  function handleClearGpu() {
    setSelectedGpu(null);
    setNoGpu(true);
    setShowPicker(false);
  }

  function handleCpuSelect(cpu: CpuOption) {
    setSelectedCpu(cpu);
    setShowCpuPicker(false);
    setCpuSearch("");
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const bandwidth = selectedGpu ? GPU_BANDWIDTH[selectedGpu.id] : undefined;
    if (selectedGpu?.unified) {
      onSubmit({
        ram: selectedGpu.vram,
        vram: selectedGpu.vram,
        hasGpu: true,
        bandwidth,
        gpuId: selectedGpu.id,
      });
    } else if (selectedGpu) {
      onSubmit({
        ram,
        vram: selectedGpu.vram,
        hasGpu: true,
        bandwidth,
        gpuId: selectedGpu.id,
      });
    } else {
      onSubmit({ ram, vram: 0, hasGpu: false });
    }
  }

  // Filter + group GPU list
  const filtered = GPU_LIST.filter(
    (g) =>
      search === "" ||
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.brand.toLowerCase().includes(search.toLowerCase()) ||
      g.series.toLowerCase().includes(search.toLowerCase()),
  );

  const grouped = BRAND_ORDER.map((brand) => ({
    brand,
    gpus: filtered.filter((g) => g.brand === brand),
  })).filter((g) => g.gpus.length > 0);

  // Filter + group CPU list
  const filteredCpus = CPU_LIST.filter(
    (c) =>
      cpuSearch === "" ||
      c.name.toLowerCase().includes(cpuSearch.toLowerCase()) ||
      c.brand.toLowerCase().includes(cpuSearch.toLowerCase()) ||
      c.series.toLowerCase().includes(cpuSearch.toLowerCase()),
  );

  const groupedCpus = CPU_BRAND_ORDER.map((brand) => ({
    brand,
    cpus: filteredCpus.filter((c) => c.brand === brand),
  })).filter((g) => g.cpus.length > 0);

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-5">
        Your Hardware
      </h2>

      {/* Detection notice */}
      {(detectedLabel || deviceModel) && (
        <div className="mb-4 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
          {deviceModel && (
            <div className="flex items-center gap-1.5 mb-0.5">
              <svg
                className="w-3.5 h-3.5 shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M13 7H7v6h6V7z" />
                <path
                  fillRule="evenodd"
                  d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-semibold">{deviceModel}</span>
            </div>
          )}
          {detectedLabel && (
            <div className="flex items-center gap-1.5">
              <svg
                className="w-3.5 h-3.5 shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                {detectedLabel}
                {ramCapped && " · RAM capped at 8 GB — adjust if needed"}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        {/* RAM — hide for unified memory */}
        {!selectedGpu?.unified && (
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              System RAM
            </label>
            <div className="flex flex-wrap gap-2">
              {RAM_OPTIONS.map((gb) => (
                <button
                  key={gb}
                  type="button"
                  onClick={() => setRam(gb)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    ram === gb
                      ? "bg-violet-600 text-white"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  }`}
                >
                  {gb} GB
                </button>
              ))}
            </div>
          </div>
        )}

        {/* GPU section */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              GPU
            </label>
            {selectedGpu && (
              <button
                type="button"
                onClick={handleClearGpu}
                className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Selected GPU display */}
          {selectedGpu ? (
            <div
              onClick={() => setShowPicker(!showPicker)}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-violet-300 dark:border-violet-700 bg-violet-50 dark:bg-violet-900/20 cursor-pointer hover:border-violet-400 transition-colors"
            >
              <div>
                <span
                  className={`text-xs font-semibold ${BRAND_COLORS[selectedGpu.brand]}`}
                >
                  {selectedGpu.brand}
                </span>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 leading-tight">
                  {selectedGpu.name}
                </p>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-violet-600 dark:text-violet-400">
                  {selectedGpu.vram} GB
                </span>
                <p className="text-xs text-zinc-400">
                  {selectedGpu.unified ? "unified" : "VRAM"}
                </p>
              </div>
            </div>
          ) : (
            <div
              onClick={() => setShowPicker(!showPicker)}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800/50 cursor-pointer hover:border-violet-400 transition-colors"
            >
              <span className="text-sm text-zinc-400 dark:text-zinc-500">
                {noGpu ? "No dedicated GPU (CPU only)" : "Select your GPU…"}
              </span>
              <svg
                className="w-4 h-4 text-zinc-400"
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
          )}

          {/* GPU picker dropdown */}
          {showPicker && (
            <div className="mt-2 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 shadow-lg overflow-hidden">
              {/* Search */}
              <div className="p-2 border-b border-zinc-100 dark:border-zinc-800">
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search GPU…"
                  className="w-full text-sm px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>

              {/* CPU-only option */}
              <div
                onClick={() => {
                  handleClearGpu();
                  setShowPicker(false);
                }}
                className="px-3 py-2 text-sm text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer border-b border-zinc-100 dark:border-zinc-800"
              >
                No GPU — CPU only
              </div>

              {/* Grouped list */}
              <div className="max-h-64 overflow-y-auto">
                {grouped.length === 0 ? (
                  <p className="text-sm text-zinc-400 text-center py-6">
                    No GPUs found
                  </p>
                ) : (
                  grouped.map(({ brand, gpus }) => (
                    <div key={brand}>
                      <div
                        className={`px-3 py-1 text-xs font-bold sticky top-0 bg-zinc-50 dark:bg-zinc-800/90 ${BRAND_COLORS[brand]}`}
                      >
                        {brand}
                      </div>
                      {gpus.map((gpu) => (
                        <div
                          key={gpu.id}
                          onClick={() => handleGpuSelect(gpu)}
                          className={`flex items-center justify-between px-3 py-2 cursor-pointer text-sm transition-colors ${
                            selectedGpu?.id === gpu.id
                              ? "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300"
                              : "hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                          }`}
                        >
                          <span>{gpu.name}</span>
                          <span className="text-xs text-zinc-400 shrink-0 ml-2">
                            {gpu.vram} GB{gpu.unified ? " unified" : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Unified memory info */}
        {selectedGpu?.unified && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 -mt-1">
            Apple Silicon uses unified memory — both RAM and GPU use the same
            pool ({selectedGpu.vram} GB).
          </p>
        )}

        {/* CPU section — hidden for Apple Silicon (chip already captured via GPU) */}
        {!selectedGpu?.unified && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                CPU
              </label>
              {selectedCpu && (
                <button
                  type="button"
                  onClick={() => setSelectedCpu(null)}
                  className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {selectedCpu ? (
              <div
                onClick={() => setShowCpuPicker(!showCpuPicker)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-violet-300 dark:border-violet-700 bg-violet-50 dark:bg-violet-900/20 cursor-pointer hover:border-violet-400 transition-colors"
              >
                <div>
                  <span
                    className={`text-xs font-semibold ${CPU_BRAND_COLORS[selectedCpu.brand]}`}
                  >
                    {selectedCpu.brand}
                  </span>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 leading-tight">
                    {selectedCpu.name}
                  </p>
                </div>
                <span className="text-xs text-zinc-400 shrink-0 ml-2">
                  {selectedCpu.cores}c / {selectedCpu.threads}t
                </span>
              </div>
            ) : (
              <div
                onClick={() => setShowCpuPicker(!showCpuPicker)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800/50 cursor-pointer hover:border-violet-400 transition-colors"
              >
                <span className="text-sm text-zinc-400 dark:text-zinc-500">
                  Select your CPU… (optional)
                </span>
                <svg
                  className="w-4 h-4 text-zinc-400"
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
            )}

            {showCpuPicker && (
              <div className="mt-2 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 shadow-lg overflow-hidden">
                <div className="p-2 border-b border-zinc-100 dark:border-zinc-800">
                  <input
                    ref={cpuSearchRef}
                    type="text"
                    value={cpuSearch}
                    onChange={(e) => setCpuSearch(e.target.value)}
                    placeholder="Search CPU…"
                    className="w-full text-sm px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
                <div className="max-h-56 overflow-y-auto">
                  {groupedCpus.length === 0 ? (
                    <p className="text-sm text-zinc-400 text-center py-6">
                      No CPUs found
                    </p>
                  ) : (
                    groupedCpus.map(({ brand, cpus }) => (
                      <div key={brand}>
                        <div
                          className={`px-3 py-1 text-xs font-bold sticky top-0 bg-zinc-50 dark:bg-zinc-800/90 ${CPU_BRAND_COLORS[brand]}`}
                        >
                          {brand}
                        </div>
                        {cpus.map((cpu) => (
                          <div
                            key={cpu.id}
                            onClick={() => handleCpuSelect(cpu)}
                            className={`flex items-center justify-between px-3 py-2 cursor-pointer text-sm transition-colors ${
                              selectedCpu?.id === cpu.id
                                ? "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300"
                                : "hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                            }`}
                          >
                            <span>{cpu.name}</span>
                            <span className="text-xs text-zinc-400 shrink-0 ml-2">
                              {cpu.cores}c / {cpu.threads}t
                            </span>
                          </div>
                        ))}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          className="w-full py-2.5 px-4 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-xl transition-colors cursor-pointer"
        >
          Find compatible models
        </button>
      </div>
    </form>
  );
}

function snapToNearest(value: number, options: number[]): number {
  return options.reduce((prev, curr) =>
    Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev,
  );
}
