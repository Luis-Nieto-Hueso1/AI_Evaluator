export interface ModelVariant {
  quantization: string;
  ramRequired: number;
  vramRequired: number;
  quality: "low" | "medium" | "high" | "best";
}

export interface Model {
  id: string;
  huggingFace: string;
  name: string;
  family: string;
  parameters: number;
  variants: ModelVariant[];
  useCases: string[];
  contextLength: number;
  description: string;
  strengths: string[];
  license: "open" | "restricted";
  benchmarks?: {
    mmlu?: number; // 0-100 percentage
    humanEval?: number; // 0-100 percentage
    mtBench?: number; // 1-10 score
    math?: number; // 0-100 percentage (MATH benchmark)
    gpqa?: number; // 0-100 percentage (GPQA Diamond)
    ifEval?: number; // 0-100 percentage (instruction following)
    bbh?: number; // 0-100 percentage (Big Bench Hard)
    musr?: number; // 0-100 percentage (Multi-step Soft Reasoning)
    mmluPro?: number; // 0-100 percentage (MMLU-PRO)
    average?: number; // 0-100 average across Open LLM Leaderboard v2 benchmarks
  };
  kvMBPerToken?: number; // KV cache MB per token (for context window estimation)
  apiCost?: {
    provider: string;
    inputPer1M: number; // $ per 1M input tokens
    outputPer1M: number; // $ per 1M output tokens
  };
  isCustom?: boolean; // true for models imported via HF URL
  isLive?: boolean; // true for models auto-fetched from HF/Ollama APIs
  releaseDate?: string; // YYYY-MM, used in the Timeline tab
}

export interface HardwareProfile {
  ram: number;
  vram: number;
  hasGpu: boolean;
  /** Memory bandwidth in GB/s (from selected GPU or CPU) */
  bandwidth?: number;
  /** Selected GPU id — for display only */
  gpuId?: string;
  /** Selected CPU id — for display only */
  cpuId?: string;
}

export type Grade = "S" | "A" | "B" | "C" | "D" | "F";

export interface CompatibleModel {
  model: Model;
  bestVariant: ModelVariant;
  runOnGpu: boolean;
  /** Estimated tokens per second (0 for grade F) */
  tokensPerSec: number;
  grade: Grade;
  /** Composite 0–100 score */
  score: number;
  /** Fraction of available memory pool used (e.g. 0.72 = 72%) */
  memPercent: number;
  /** GB of memory pool available (VRAM or RAM) */
  memAvailable: number;
  /** false when model does not fit in memory at all (grade F) */
  fits: boolean;
}

export interface AdvisorMessage {
  role: "user" | "assistant";
  content: string;
}
