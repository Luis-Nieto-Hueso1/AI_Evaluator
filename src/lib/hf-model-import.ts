import type { Model, ModelVariant } from "../types";

const HF_TOKEN = import.meta.env.VITE_HF_TOKEN as string | undefined;
const STORAGE_KEY = "llm-eval-custom-models";

// Bits-per-weight for VRAM/RAM estimation (same as compatibility.ts)
const QUANT_BITS: Record<string, number> = {
  Q2_K: 2.625,
  Q4_K_M: 4.85,
  Q8_0: 8.5,
  F16: 16,
};

function estimateGb(params_B: number, bitsPerWeight: number): number {
  // params_B × bits ÷ 8 = GB, add ~10% overhead
  return Math.round(((params_B * bitsPerWeight) / 8) * 1.1 * 10) / 10;
}

function buildVariants(params_B: number): ModelVariant[] {
  const quants: Array<{ q: string; quality: ModelVariant["quality"] }> = [
    { q: "Q4_K_M", quality: "medium" },
    { q: "Q8_0", quality: "high" },
    { q: "F16", quality: "best" },
  ];
  if (params_B <= 13) quants.unshift({ q: "Q2_K", quality: "low" });

  return quants.map(({ q, quality }) => {
    const gb = estimateGb(params_B, QUANT_BITS[q]);
    return {
      quantization: q,
      ramRequired: gb,
      vramRequired: gb,
      quality,
    };
  });
}

/** Extract model ID from a HuggingFace URL or plain "owner/repo" string */
export function parseHfUrl(input: string): string | null {
  input = input.trim();
  // Full URL: https://huggingface.co/owner/repo or .../resolve/main/...
  try {
    const url = new URL(input);
    if (url.hostname === "huggingface.co") {
      const parts = url.pathname.split("/").filter(Boolean);
      if (parts.length >= 2) return `${parts[0]}/${parts[1]}`;
    }
  } catch {
    // Not a URL — try as plain "owner/repo"
  }
  if (/^[\w.-]+\/[\w.-]+$/.test(input)) return input;
  return null;
}

/** Extract parameter count (in billions) from a model name string */
function parseParamCount(name: string): number {
  // MoE: "8x7B" → 8 × 7 = 56
  const moe = name.match(/(\d+)x(\d+(?:\.\d+)?)[Bb]/);
  if (moe) return parseInt(moe[1]) * parseFloat(moe[2]);

  // Standard: "7B", "1.5B", "72b"
  const std = name.match(/(\d+(?:\.\d+)?)[Bb]/);
  if (std) return parseFloat(std[1]);

  return 7; // fallback
}

interface HfApiResponse {
  id: string;
  modelId?: string;
  cardData?: {
    model_name?: string;
    language?: string[];
    license?: string;
    tags?: string[];
  };
  tags?: string[];
  likes?: number;
  downloads?: number;
  pipeline_tag?: string;
  safetensors?: { parameters?: Record<string, number> };
  config?: { max_position_embeddings?: number };
}

/** Fetch model info from HuggingFace API and build a Model object */
export async function importHfModel(modelId: string): Promise<Model> {
  const url = `https://huggingface.co/api/models/${modelId}`;
  const res = await fetch(url, {
    headers: HF_TOKEN ? { Authorization: `Bearer ${HF_TOKEN}` } : {},
  });

  if (!res.ok) {
    throw new Error(
      `HuggingFace API error ${res.status}: ${res.statusText}. Check the model ID or URL.`,
    );
  }

  const data: HfApiResponse = await res.json();

  // Derive parameter count
  const [owner, repo] = modelId.split("/");
  const params_B = (() => {
    // Try safetensors parameter count first
    const sf = data.safetensors?.parameters;
    if (sf) {
      const total = Object.values(sf).reduce((a, b) => a + b, 0);
      if (total > 0) return total / 1e9;
    }
    // Fall back to parsing from the repo name
    return parseParamCount(repo);
  })();

  const contextLength = data.config?.max_position_embeddings ?? 4096;

  // Determine license
  const licenseTag = (data.cardData?.license ?? "").toLowerCase();
  const license: "open" | "restricted" =
    licenseTag.includes("mit") ||
    licenseTag.includes("apache") ||
    licenseTag.includes("llama") ||
    licenseTag === "open"
      ? "open"
      : "restricted";

  // Infer use cases from pipeline tag / tags
  const tags = [...(data.tags ?? []), data.pipeline_tag ?? ""];
  const useCases: string[] = [];
  if (tags.some((t) => /cod/i.test(t))) useCases.push("coding");
  if (tags.some((t) => /chat|instruct|conversation/i.test(t)))
    useCases.push("chat");
  if (tags.some((t) => /math/i.test(t))) useCases.push("math");
  if (tags.some((t) => /reason/i.test(t))) useCases.push("reasoning");
  if (useCases.length === 0) useCases.push("general");

  const displayName = repo
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    id: `custom-${owner}-${repo}`.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
    huggingFace: `https://huggingface.co/${modelId}`,
    name: displayName,
    family: owner,
    parameters: Math.round(params_B * 10) / 10,
    variants: buildVariants(params_B),
    useCases,
    contextLength,
    description: `Imported from HuggingFace: ${modelId}`,
    strengths: [],
    license,
    isCustom: true,
  };
}

export function loadCustomModels(): Model[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Model[];
  } catch {
    return [];
  }
}

export function saveCustomModel(model: Model): void {
  const existing = loadCustomModels().filter((m) => m.id !== model.id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, model]));
}

export function removeCustomModel(id: string): void {
  const updated = loadCustomModels().filter((m) => m.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}
