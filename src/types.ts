export interface ModelVariant {
  quantization: string;
  ramRequired: number;
  vramRequired: number;
  quality: "low" | "medium" | "high" | "best";
}

export interface Model {
  id: string;
  name: string;
  family: string;
  parameters: number;
  variants: ModelVariant[];
  useCases: string[];
  contextLength: number;
  description: string;
  strengths: string[];
  license: "open" | "restricted";
}

export interface HardwareProfile {
  ram: number;
  vram: number;
  hasGpu: boolean;
  /** Memory bandwidth in GB/s (from selected GPU) */
  bandwidth?: number;
  /** Selected GPU id — for display only */
  gpuId?: string;
}

export type Grade = "S" | "A" | "B" | "C" | "D";

export interface CompatibleModel {
  model: Model;
  bestVariant: ModelVariant;
  runOnGpu: boolean;
  /** Estimated tokens per second */
  tokensPerSec: number;
  grade: Grade;
}

export interface AdvisorMessage {
  role: "user" | "assistant";
  content: string;
}
