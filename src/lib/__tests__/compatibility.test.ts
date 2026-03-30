import { describe, it, expect } from "vitest";
import {
  computeScore,
  scoreToGrade,
  estimateToksPerSec,
  getCompatibleModels,
  getAllModels,
  getVariantScores,
  models,
} from "../compatibility";
import type { HardwareProfile } from "../../types";

// ── computeScore ──────────────────────────────────────────────────────────────

describe("computeScore", () => {
  it("returns high score for fast, memory-efficient, large model", () => {
    // 100 tok/s, 20% mem, 7B params
    const score = computeScore(100, 0.2, 7);
    expect(score).toBeGreaterThanOrEqual(85); // S-tier
  });

  it("returns low score for slow, memory-heavy model", () => {
    // 2 tok/s, 90% mem, 1B params — tight-fit penalty applies
    const score = computeScore(2, 0.92, 1);
    expect(score).toBeLessThan(40);
  });

  it("applies tight-fit penalty when memPercent > 0.85", () => {
    const withoutPenalty = computeScore(20, 0.7, 7);
    const withPenalty = computeScore(20, 0.9, 7);
    expect(withPenalty).toBeLessThan(withoutPenalty);
  });

  it("clamps score to 1–100 range", () => {
    const low = computeScore(0.1, 0.99, 0.5);
    const high = computeScore(200, 0.01, 100);
    expect(low).toBeGreaterThanOrEqual(1);
    expect(high).toBeLessThanOrEqual(100);
  });

  it("speed score boundaries are correct", () => {
    // ≥80 tok/s → speedScore 100 (×0.55 = 55)
    const fast = computeScore(80, 0.2, 7);
    // 40–79 tok/s → speedScore 85 (×0.55 = 46.75)
    const medium = computeScore(40, 0.2, 7);
    expect(fast).toBeGreaterThan(medium);
  });

  it("memory headroom score boundaries are correct", () => {
    const plenty = computeScore(40, 0.25, 7); // ≤30% → memScore 100
    const tight = computeScore(40, 0.6, 7); // ≤70% → memScore 55
    expect(plenty).toBeGreaterThan(tight);
  });
});

// ── scoreToGrade ──────────────────────────────────────────────────────────────

describe("scoreToGrade", () => {
  it("maps 85+ to S", () => expect(scoreToGrade(85)).toBe("S"));
  it("maps 90 to S", () => expect(scoreToGrade(90)).toBe("S"));
  it("maps 70 to A", () => expect(scoreToGrade(70)).toBe("A"));
  it("maps 84 to A", () => expect(scoreToGrade(84)).toBe("A"));
  it("maps 55 to B", () => expect(scoreToGrade(55)).toBe("B"));
  it("maps 69 to B", () => expect(scoreToGrade(69)).toBe("B"));
  it("maps 40 to C", () => expect(scoreToGrade(40)).toBe("C"));
  it("maps 54 to C", () => expect(scoreToGrade(54)).toBe("C"));
  it("maps 20 to D", () => expect(scoreToGrade(20)).toBe("D"));
  it("maps 39 to D", () => expect(scoreToGrade(39)).toBe("D"));
  it("maps 19 to F", () => expect(scoreToGrade(19)).toBe("F"));
  it("maps 1 to F", () => expect(scoreToGrade(1)).toBe("F"));
});

// ── estimateToksPerSec ────────────────────────────────────────────────────────

describe("estimateToksPerSec", () => {
  it("GPU run is faster than CPU run for same model", () => {
    const gpu = estimateToksPerSec(7, "Q4_K_M", true, 400); // RTX 4080-class
    const cpu = estimateToksPerSec(7, "Q4_K_M", false, 51);
    expect(gpu).toBeGreaterThan(cpu);
  });

  it("smaller quantization (fewer bits) → faster", () => {
    const q2 = estimateToksPerSec(7, "Q2_K", true, 400);
    const f16 = estimateToksPerSec(7, "F16", true, 400);
    expect(q2).toBeGreaterThan(f16);
  });

  it("CPU defaults to 50 GB/s bandwidth when not provided", () => {
    const withDefault = estimateToksPerSec(7, "Q4_K_M", false, undefined);
    const with50 = estimateToksPerSec(7, "Q4_K_M", false, 50);
    expect(withDefault).toBeCloseTo(with50, 5);
  });

  it("GPU run ignores bandwidth=undefined and falls through to CPU path", () => {
    // When runOnGpu=true but no bandwidth, falls to CPU path with 50 GB/s default
    const result = estimateToksPerSec(7, "Q4_K_M", true, undefined);
    const cpuFallback = estimateToksPerSec(7, "Q4_K_M", false, 50);
    expect(result).toBeCloseTo(cpuFallback, 5);
  });

  it("returns positive number for valid inputs", () => {
    const toks = estimateToksPerSec(7, "Q4_K_M", true, 300);
    expect(toks).toBeGreaterThan(0);
  });
});

// ── getCompatibleModels / getAllModels ─────────────────────────────────────────

describe("getCompatibleModels", () => {
  const highEnd: HardwareProfile = { ram: 64, vram: 24, hasGpu: true };
  const lowEnd: HardwareProfile = { ram: 8, vram: 0, hasGpu: false };

  it("returns only fitting models (fits=true for all)", () => {
    const results = getCompatibleModels(lowEnd);
    expect(results.every((m) => m.fits)).toBe(true);
  });

  it("high-end GPU returns more compatible models than low-end CPU", () => {
    const high = getCompatibleModels(highEnd);
    const low = getCompatibleModels(lowEnd);
    expect(high.length).toBeGreaterThan(low.length);
  });

  it("results are sorted best grade first", () => {
    const gradeOrder = ["S", "A", "B", "C", "D", "F"];
    const results = getCompatibleModels(highEnd);
    for (let i = 1; i < results.length; i++) {
      const prevIdx = gradeOrder.indexOf(results[i - 1].grade);
      const currIdx = gradeOrder.indexOf(results[i].grade);
      expect(prevIdx).toBeLessThanOrEqual(currIdx);
    }
  });

  it("within same grade, sorted by score descending", () => {
    const results = getCompatibleModels(highEnd);
    const byGrade: Record<string, number[]> = {};
    for (const m of results) {
      byGrade[m.grade] ??= [];
      byGrade[m.grade].push(m.score);
    }
    for (const scores of Object.values(byGrade)) {
      for (let i = 1; i < scores.length; i++) {
        expect(scores[i]).toBeLessThanOrEqual(scores[i - 1]);
      }
    }
  });
});

describe("getAllModels", () => {
  const lowEnd: HardwareProfile = { ram: 8, vram: 0, hasGpu: false };

  it("returns more models than getCompatibleModels (includes F)", () => {
    const all = getAllModels(lowEnd);
    const compatible = getCompatibleModels(lowEnd);
    expect(all.length).toBeGreaterThanOrEqual(compatible.length);
  });

  it("includes grade F models for low-end hardware", () => {
    const all = getAllModels(lowEnd);
    expect(all.some((m) => m.grade === "F")).toBe(true);
  });

  it("non-fitting models have grade F and score 0", () => {
    const all = getAllModels(lowEnd);
    const nonFitting = all.filter((m) => !m.fits);
    expect(nonFitting.every((m) => m.grade === "F" && m.score === 0)).toBe(
      true,
    );
  });
});

// ── getVariantScores ──────────────────────────────────────────────────────────

describe("getVariantScores", () => {
  const hardware: HardwareProfile = { ram: 32, vram: 16, hasGpu: true };

  it("returns one entry per variant", () => {
    // models imported at top level
    // Pick a model that definitely has multiple variants (e.g. Llama 3.1 8B)
    const model = models.find((m) => m.id === "llama3.1-8b");
    if (!model) return; // Skip if model not in DB
    const scores = getVariantScores(model, hardware);
    expect(scores.length).toBe(model.variants.length);
  });

  it("F16 (full precision) variant uses more memory than Q2_K", () => {
    // models imported at top level
    const model = models.find(
      (m) =>
        m.variants.some((v) => v.quantization === "F16") &&
        m.variants.some((v) => v.quantization === "Q2_K"),
    );
    if (!model) return;
    const scores = getVariantScores(model, hardware);
    const f16 = scores.find((s) => s.variant.quantization === "F16");
    const q2 = scores.find((s) => s.variant.quantization === "Q2_K");
    if (!f16 || !q2) return;
    expect(f16.memUsedGb).toBeGreaterThan(q2.memUsedGb);
  });

  it("non-fitting variants have score 0 and grade F", () => {
    // 4 GB VRAM — large models won't fit on GPU
    const tinyHw: HardwareProfile = { ram: 8, vram: 4, hasGpu: true };
    // models imported at top level
    const bigModel = models.find((m) => m.parameters >= 70);
    if (!bigModel) return;
    const scores = getVariantScores(bigModel, tinyHw);
    const nonFitting = scores.filter((s) => !s.fits);
    expect(nonFitting.every((s) => s.score === 0 && s.grade === "F")).toBe(
      true,
    );
  });
});
