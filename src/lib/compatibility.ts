import type {
  Model,
  ModelVariant,
  HardwareProfile,
  CompatibleModel,
  Grade,
} from "../types";
import modelsData from "../data/models.json";

const models = modelsData as Model[];

// Approximate bits-per-weight for each quantization
const QUANT_BITS: Record<string, number> = {
  Q2_K: 2.625,
  Q4_K_M: 4.85,
  Q8_0: 8.5,
  F16: 16,
};

/**
 * Estimate tokens/second based on memory bandwidth.
 * Formula: bandwidth (GB/s) × efficiency / bytes_per_token
 * GPU efficiency ~0.65, CPU ~0.12 (via ~50 GB/s RAM BW)
 */
function estimateToksPerSec(
  params_B: number,
  quantization: string,
  runOnGpu: boolean,
  bandwidth?: number,
): number {
  const bits = QUANT_BITS[quantization] ?? 4.85;
  const bytesPerToken = (params_B * bits) / 8; // GB

  if (runOnGpu && bandwidth) {
    return (bandwidth * 0.65) / bytesPerToken;
  }
  // CPU: ~50 GB/s RAM bandwidth × 12% efficiency
  return (50 * 0.12) / bytesPerToken;
}

function toGrade(toks: number): Grade {
  if (toks >= 40) return "S";
  if (toks >= 20) return "A";
  if (toks >= 10) return "B";
  if (toks >= 4) return "C";
  return "D";
}

export function getCompatibleModels(
  hardware: HardwareProfile,
): CompatibleModel[] {
  const results: CompatibleModel[] = [];

  for (const model of models) {
    const best = getBestVariant(model, hardware);
    if (best) results.push(best);
  }

  // Default sort: best grade first, then highest params
  return results.sort((a, b) => {
    const gradeOrder: Grade[] = ["S", "A", "B", "C", "D"];
    const gDiff = gradeOrder.indexOf(a.grade) - gradeOrder.indexOf(b.grade);
    if (gDiff !== 0) return gDiff;
    return b.model.parameters - a.model.parameters;
  });
}

function getBestVariant(
  model: Model,
  hardware: HardwareProfile,
): CompatibleModel | null {
  const qualityOrder: ModelVariant["quality"][] = [
    "best",
    "high",
    "medium",
    "low",
  ];

  for (const quality of qualityOrder) {
    const variant = model.variants.find((v) => v.quality === quality);
    if (!variant) continue;

    if (hardware.hasGpu && hardware.vram >= variant.vramRequired) {
      const toks = estimateToksPerSec(
        model.parameters,
        variant.quantization,
        true,
        hardware.bandwidth,
      );
      return {
        model,
        bestVariant: variant,
        runOnGpu: true,
        tokensPerSec: toks,
        grade: toGrade(toks),
      };
    }

    if (hardware.ram >= variant.ramRequired) {
      const toks = estimateToksPerSec(
        model.parameters,
        variant.quantization,
        false,
        undefined,
      );
      return {
        model,
        bestVariant: variant,
        runOnGpu: false,
        tokensPerSec: toks,
        grade: toGrade(toks),
      };
    }
  }

  return null;
}

export function formatMemory(gb: number): string {
  return `${gb} GB`;
}

export function getQualityColor(quality: ModelVariant["quality"]): string {
  switch (quality) {
    case "best":
      return "text-emerald-600 dark:text-emerald-400";
    case "high":
      return "text-blue-600 dark:text-blue-400";
    case "medium":
      return "text-amber-600 dark:text-amber-400";
    case "low":
      return "text-red-500 dark:text-red-400";
  }
}

export function getQualityLabel(quality: ModelVariant["quality"]): string {
  switch (quality) {
    case "best":
      return "Full precision";
    case "high":
      return "High quality";
    case "medium":
      return "Balanced";
    case "low":
      return "Compressed";
  }
}

export { models };
