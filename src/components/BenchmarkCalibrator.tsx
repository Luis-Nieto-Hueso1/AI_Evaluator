import { useState } from "react";
import type { CompatibleModel } from "../types";
import {
  saveCalibration,
  clearCalibration,
  type CalibrationData,
} from "../lib/calibration";

interface Props {
  models: CompatibleModel[];
  calibration: CalibrationData | null;
  onCalibrationChange: (data: CalibrationData | null) => void;
}

export function BenchmarkCalibrator({
  models,
  calibration,
  onCalibrationChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [measured, setMeasured] = useState("");

  const fittingModels = models.filter((m) => m.fits && m.tokensPerSec > 0);

  const selectedModel = fittingModels.find((m) => m.model.id === selectedId);
  const estimatedToks = selectedModel
    ? Math.round(selectedModel.tokensPerSec)
    : null;

  function handleApply() {
    const measuredNum = parseFloat(measured);
    if (!selectedModel || isNaN(measuredNum) || measuredNum <= 0) return;
    const factor = measuredNum / selectedModel.tokensPerSec;
    const data: CalibrationData = {
      factor,
      modelName: selectedModel.model.name,
      measuredToks: measuredNum,
      estimatedToks: selectedModel.tokensPerSec,
    };
    saveCalibration(data);
    onCalibrationChange(data);
    setOpen(false);
  }

  function handleClear() {
    clearCalibration();
    onCalibrationChange(null);
    setMeasured("");
    setSelectedId("");
  }

  return (
    <div className="text-xs">
      {/* Toggle row */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
      >
        <span
          className={`transition-transform duration-150 text-xs ${open ? "rotate-90" : ""}`}
        >
          ▶
        </span>
        Calibrate speed estimates
        {calibration && (
          <span className="ml-1 px-2.5 py-1 rounded-full bg-brand-100 dark:bg-brand-500/30 text-brand-400 dark:text-brand-200 font-medium">
            {calibration.factor.toFixed(2)}× active
          </span>
        )}
      </button>

      {open && (
        <div className="mt-2.5 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 flex flex-col gap-3">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Run a model and paste your actual tok/s below. The app will scale
            all speed estimates to match your real hardware.
          </p>

          {/* Current calibration status */}
          {calibration && (
            <div className="flex items-center justify-between bg-brand-50 dark:bg-brand-500/20 border border-brand-200 dark:border-brand-500 rounded-lg px-2.5 py-1.5">
              <span className="text-brand-400 dark:text-brand-200">
                Calibrated from{" "}
                <span className="font-medium">{calibration.modelName}</span>
                {" — "}
                {Math.round(calibration.measuredToks)} measured /{" "}
                {Math.round(calibration.estimatedToks)} estimated ={" "}
                <span className="font-bold">
                  {calibration.factor.toFixed(2)}×
                </span>
              </span>
              <button
                onClick={handleClear}
                className="ml-2 shrink-0 text-xs px-2.5 py-1 rounded bg-brand-100 dark:bg-brand-500/40 text-brand-300 dark:text-brand-accent hover:bg-brand-100 dark:hover:bg-brand-500/60 transition-colors cursor-pointer"
              >
                Reset
              </button>
            </div>
          )}

          {/* Form */}
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="flex-1 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Select model you tested…</option>
              {fittingModels.map((m) => (
                <option key={m.model.id} value={m.model.id}>
                  {m.model.name} (est. ~{Math.round(m.tokensPerSec)} tok/s)
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={measured}
                onChange={(e) => setMeasured(e.target.value)}
                placeholder="Actual tok/s"
                className="w-28 text-xs px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                onClick={handleApply}
                disabled={!selectedId || !measured || parseFloat(measured) <= 0}
                className="px-3 py-1.5 bg-brand-300 hover:bg-brand-400 disabled:bg-zinc-200 dark:disabled:bg-zinc-700 disabled:text-zinc-400 text-white rounded-lg transition-colors font-medium cursor-pointer disabled:cursor-not-allowed"
              >
                Apply
              </button>
            </div>
          </div>

          {selectedModel && measured && parseFloat(measured) > 0 && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Factor:{" "}
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                {(parseFloat(measured) / selectedModel.tokensPerSec).toFixed(2)}
                ×
              </span>{" "}
              · Estimated {estimatedToks} → measured {measured} tok/s
            </p>
          )}
        </div>
      )}
    </div>
  );
}
