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
 * GPU efficiency ~0.70, CPU ~0.12 (via RAM BW)
 */
export function estimateToksPerSec(
  params_B: number,
  quantization: string,
  runOnGpu: boolean,
  bandwidth?: number,
): number {
  const bits = QUANT_BITS[quantization] ?? 4.85;
  const bytesPerToken = (params_B * bits) / 8; // GB

  if (runOnGpu && bandwidth) {
    return (bandwidth * 0.7) / bytesPerToken;
  }
  // CPU: RAM bandwidth × 12% efficiency (bandwidth defaults to 50 GB/s if not provided)
  const cpuBw = bandwidth ?? 50;
  return (cpuBw * 0.12) / bytesPerToken;
}

/**
 * Composite 0-100 score combining speed, memory headroom, and model quality.
 * Based on canirun.ai scoring algorithm.
 */
export function computeScore(
  toks: number,
  memPercent: number,
  params_B: number,
): number {
  // Speed score (55% weight)
  let speedScore: number;
  if (toks >= 80) speedScore = 100;
  else if (toks >= 40) speedScore = 85;
  else if (toks >= 20) speedScore = 65;
  else if (toks >= 10) speedScore = 45;
  else if (toks >= 5) speedScore = 25;
  else speedScore = 10;

  // Memory headroom score (35% weight)
  let memScore: number;
  if (memPercent <= 0.3) memScore = 100;
  else if (memPercent <= 0.5) memScore = 80;
  else if (memPercent <= 0.7) memScore = 55;
  else if (memPercent <= 0.85) memScore = 30;
  else memScore = 10;

  // Quality bonus — larger models produce better output (~10% weight, capped 15pts)
  const qualityBonus = Math.min(15, Math.log2(params_B + 1) * 2.5);

  let score =
    speedScore * 0.55 + memScore * 0.35 + qualityBonus * (1 / 15) * 15 * 0.1;

  // Tight fit penalty: model barely fits, lots of swapping pressure
  if (memPercent > 0.85) score *= 0.65;

  return Math.round(Math.min(100, Math.max(1, score)));
}

export function scoreToGrade(score: number): Grade {
  if (score >= 85) return "S";
  if (score >= 70) return "A";
  if (score >= 55) return "B";
  if (score >= 40) return "C";
  if (score >= 20) return "D";
  return "F";
}

export const GRADE_STATUS: Record<Grade, string> = {
  S: "Runs great",
  A: "Runs well",
  B: "Decent",
  C: "Tight fit",
  D: "Barely runs",
  F: "Too heavy",
};

export function getCompatibleModels(
  hardware: HardwareProfile,
  extra: Model[] = [],
): CompatibleModel[] {
  return getAllModels(hardware, extra).filter((m) => m.fits);
}

export function getAllModels(
  hardware: HardwareProfile,
  extra: Model[] = [],
): CompatibleModel[] {
  const results: CompatibleModel[] = [];
  for (const model of [...models, ...extra]) {
    const result = getBestVariant(model, hardware);
    if (result) results.push(result);
  }
  const gradeOrder: Grade[] = ["S", "A", "B", "C", "D", "F"];
  return results.sort((a, b) => {
    const gDiff = gradeOrder.indexOf(a.grade) - gradeOrder.indexOf(b.grade);
    if (gDiff !== 0) return gDiff;
    return b.score - a.score;
  });
}

function getBestVariant(
  model: Model,
  hardware: HardwareProfile,
): CompatibleModel | null {
  if (!model.variants || model.variants.length === 0) return null;

  const qualityOrder: ModelVariant["quality"][] = [
    "best",
    "high",
    "medium",
    "low",
  ];

  // Apple Silicon: unified memory pool, 75% usable
  const isUnified =
    hardware.hasGpu && hardware.vram > 0 && hardware.ram === hardware.vram;

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
      const memAvailable = isUnified ? hardware.vram * 0.75 : hardware.vram;
      const memPercent = variant.vramRequired / memAvailable;
      const score = computeScore(toks, memPercent, model.parameters);
      const grade = scoreToGrade(score);
      return {
        model,
        bestVariant: variant,
        runOnGpu: true,
        tokensPerSec: toks,
        grade,
        score,
        memPercent,
        memAvailable,
        fits: true,
      };
    }

    if (hardware.ram >= variant.ramRequired) {
      const toks = estimateToksPerSec(
        model.parameters,
        variant.quantization,
        false,
        hardware.bandwidth,
      );
      const memPercent = variant.ramRequired / hardware.ram;
      const score = computeScore(toks, memPercent, model.parameters);
      const grade = scoreToGrade(score);
      return {
        model,
        bestVariant: variant,
        runOnGpu: false,
        tokensPerSec: toks,
        grade,
        score,
        memPercent,
        memAvailable: hardware.ram,
        fits: true,
      };
    }
  }

  // Nothing fits — return grade F entry using smallest variant
  const smallest =
    model.variants.find((v) => v.quality === "low") ??
    model.variants.find((v) => v.quality === "medium") ??
    model.variants[0];

  const memPool = hardware.hasGpu ? hardware.vram : hardware.ram;
  const memUsed = hardware.hasGpu
    ? smallest.vramRequired
    : smallest.ramRequired;
  const memPercent = memPool > 0 ? memUsed / memPool : 999;

  return {
    model,
    bestVariant: smallest,
    runOnGpu: false,
    tokensPerSec: 0,
    grade: "F",
    score: 0,
    memPercent,
    memAvailable: memPool,
    fits: false,
  };
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

export interface VariantScore {
  variant: ModelVariant;
  fits: boolean;
  runOnGpu: boolean;
  tokensPerSec: number;
  score: number;
  grade: Grade;
  memPercent: number;
  memUsedGb: number;
}

export function getVariantScores(
  model: Model,
  hardware: HardwareProfile,
): VariantScore[] {
  const isUnified =
    hardware.hasGpu && hardware.vram > 0 && hardware.ram === hardware.vram;

  return model.variants.map((variant) => {
    if (hardware.hasGpu && hardware.vram >= variant.vramRequired) {
      const toks = estimateToksPerSec(
        model.parameters,
        variant.quantization,
        true,
        hardware.bandwidth,
      );
      const memAvailable = isUnified ? hardware.vram * 0.75 : hardware.vram;
      const memPercent = variant.vramRequired / memAvailable;
      const score = computeScore(toks, memPercent, model.parameters);
      return {
        variant,
        fits: true,
        runOnGpu: true,
        tokensPerSec: toks,
        score,
        grade: scoreToGrade(score),
        memPercent,
        memUsedGb: variant.vramRequired,
      };
    }
    if (hardware.ram >= variant.ramRequired) {
      const toks = estimateToksPerSec(
        model.parameters,
        variant.quantization,
        false,
        hardware.bandwidth,
      );
      const memPercent = variant.ramRequired / hardware.ram;
      const score = computeScore(toks, memPercent, model.parameters);
      return {
        variant,
        fits: true,
        runOnGpu: false,
        tokensPerSec: toks,
        score,
        grade: scoreToGrade(score),
        memPercent,
        memUsedGb: variant.ramRequired,
      };
    }
    // Doesn't fit
    const memPool = hardware.hasGpu ? hardware.vram : hardware.ram;
    const memUsedGb = hardware.hasGpu
      ? variant.vramRequired
      : variant.ramRequired;
    return {
      variant,
      fits: false,
      runOnGpu: false,
      tokensPerSec: 0,
      score: 0,
      grade: "F" as Grade,
      memPercent: memPool > 0 ? memUsedGb / memPool : 999,
      memUsedGb,
    };
  });
}

export { models };
