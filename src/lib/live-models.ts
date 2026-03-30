/**
 * Live model registry — automatically fetches models from:
 *   1. HuggingFace Hub API (top text-generation models with GGUF availability)
 *   2. Ollama library API (their curated model list)
 *
 * Results are cached in localStorage for 24 hours so the API is not
 * hammered on every page load. The cache is refreshed in the background.
 */

import type { Model, ModelVariant } from "../types";
import modelsData from "../data/models.json";

const HF_TOKEN = import.meta.env.VITE_HF_TOKEN as string | undefined;
const CACHE_KEY = "llm-eval-live-v3";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

const STATIC_MODELS = modelsData as Model[];
// Pre-build a set of all known HF org names and (org, ~params) pairs for dedup
const STATIC_HF_URLS = new Set(
  STATIC_MODELS.map((m) => m.huggingFace?.toLowerCase() ?? ""),
);

// ── Type helpers ──────────────────────────────────────────────────────────────

const QUANT_BITS: Record<string, number> = {
  Q2_K: 2.625,
  Q4_K_M: 4.85,
  Q8_0: 8.5,
  F16: 16,
};

function estimateGb(params_B: number, bits: number): number {
  return Math.round(((params_B * bits) / 8) * 1.1 * 10) / 10;
}

function buildVariants(params_B: number): ModelVariant[] {
  const specs: Array<{ q: string; quality: ModelVariant["quality"] }> = [
    { q: "Q4_K_M", quality: "medium" },
    { q: "Q8_0", quality: "high" },
    { q: "F16", quality: "best" },
  ];
  if (params_B <= 13) specs.unshift({ q: "Q2_K", quality: "low" });
  return specs.map(({ q, quality }) => ({
    quantization: q,
    ramRequired: estimateGb(params_B, QUANT_BITS[q]),
    vramRequired: estimateGb(params_B, QUANT_BITS[q]),
    quality,
  }));
}

function parseParams(nameOrId: string): number {
  const part = nameOrId.split("/").pop() ?? nameOrId;
  // MoE: "8x7B"
  const moe = part.match(/(\d+)x(\d+(?:\.\d+)?)[Bb]/);
  if (moe) return parseInt(moe[1]) * parseFloat(moe[2]);
  // Standard: "7B", "72B", "1.5b"
  const std = part.match(/(\d+(?:\.\d+)?)[Bb]/);
  if (std) return parseFloat(std[1]);
  return 0;
}

function inferUseCases(combined: string): string[] {
  const s = combined.toLowerCase();
  const cases: string[] = [];
  if (/cod|program|developer/i.test(s)) cases.push("coding");
  if (/chat|instruct|conversation|assistant/i.test(s)) cases.push("chat");
  if (/math|stem|science/i.test(s)) cases.push("math");
  if (/reason|think|cot/i.test(s)) cases.push("reasoning");
  if (/sql|data/i.test(s)) cases.push("data");
  if (cases.length === 0) cases.push("general");
  return cases;
}

function isAlreadyInStaticDb(hfId: string, params_B: number): boolean {
  const normalised = `https://huggingface.co/${hfId}`.toLowerCase();
  if (STATIC_HF_URLS.has(normalised)) return true;

  // Fuzzy: same org + ±20% parameter count
  const org = hfId.split("/")[0]?.toLowerCase() ?? "";
  return STATIC_MODELS.some((m) => {
    if (!m.huggingFace?.toLowerCase().includes(org)) return false;
    if (params_B <= 0) return false;
    return Math.abs(m.parameters - params_B) / params_B < 0.2;
  });
}

// ── HuggingFace source ────────────────────────────────────────────────────────

interface HfApiModel {
  id: string;
  tags?: string[];
  pipeline_tag?: string;
  downloads?: number;
  private?: boolean;
  lastModified?: string; // ISO 8601
  createdAt?: string; // ISO 8601 — fallback date
  cardData?: { license?: string };
  safetensors?: { parameters?: Record<string, number> };
  config?: { max_position_embeddings?: number };
}

function hfModelToModel(raw: HfApiModel): Model | null {
  if (raw.private) return null;
  const id = raw.id;
  if (!id) return null;

  // Parameter count
  const fromSafetensors = raw.safetensors?.parameters
    ? Object.values(raw.safetensors.parameters).reduce((a, b) => a + b, 0) / 1e9
    : 0;
  const params_B = fromSafetensors || parseParams(id);
  if (params_B < 0.3 || params_B > 500) return null; // skip tiny / absurdly large

  if (isAlreadyInStaticDb(id, params_B)) return null;

  const [owner, repo = id] = id.split("/");
  const displayName = repo
    .replace(/-GGUF$/i, "")
    .replace(/-(?:Instruct|Chat|instruct|chat)$/i, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();

  const tags = raw.tags ?? [];
  const licenseRaw = (raw.cardData?.license ?? "").toLowerCase();
  const isOpen =
    licenseRaw.includes("mit") ||
    licenseRaw.includes("apache") ||
    licenseRaw.includes("llama") ||
    licenseRaw.includes("gemma") ||
    licenseRaw === "open";

  const combined = [displayName, ...tags, raw.pipeline_tag ?? ""].join(" ");

  return {
    id: `live-${id
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")}`,
    huggingFace: `https://huggingface.co/${id}`,
    name: displayName,
    family: owner,
    parameters: Math.round(params_B * 10) / 10,
    variants: buildVariants(params_B),
    useCases: inferUseCases(combined),
    contextLength: raw.config?.max_position_embeddings ?? 4096,
    description: `HuggingFace Hub · ${((raw.downloads ?? 0) / 1000).toFixed(0)}K downloads`,
    strengths: [],
    license: isOpen ? "open" : "restricted",
    isLive: true,
    // Use lastModified → createdAt → current month as fallback so the
    // model always has a date and appears in the Timeline tab
    releaseDate: (
      raw.lastModified ??
      raw.createdAt ??
      new Date().toISOString()
    ).slice(0, 7),
  };
}

async function fetchFromHuggingFace(): Promise<Model[]> {
  // full=true is required to get lastModified, cardData, safetensors, and config
  const endpoints = [
    "https://huggingface.co/api/models?filter=gguf&pipeline_tag=text-generation&sort=downloads&direction=-1&limit=40&full=true",
    "https://huggingface.co/api/models?pipeline_tag=text-generation&sort=downloads&direction=-1&limit=40&full=true",
  ];

  const headers: HeadersInit = HF_TOKEN
    ? { Authorization: `Bearer ${HF_TOKEN}` }
    : {};

  const results = await Promise.allSettled(
    endpoints.map((url) =>
      fetch(url, { headers }).then((r) => {
        if (!r.ok) throw new Error(`HF API ${r.status}`);
        return r.json() as Promise<HfApiModel[]>;
      }),
    ),
  );

  const seen = new Set<string>();
  const models: Model[] = [];

  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    for (const raw of result.value) {
      if (seen.has(raw.id)) continue;
      seen.add(raw.id);
      const m = hfModelToModel(raw);
      if (m) models.push(m);
    }
  }

  return models;
}

// ── Ollama source ─────────────────────────────────────────────────────────────

interface OllamaModel {
  name: string;
  description?: string;
  pulls?: number;
  tags?: string[];
}

function ollamaModelToModel(raw: OllamaModel): Model | null {
  const name = raw.name ?? "";
  if (!name) return null;

  const params_B = parseParams(name);
  if (params_B < 0.3 || params_B > 500) return null;

  if (isAlreadyInStaticDb(`ollama/${name}`, params_B)) return null;

  // Try to match with HF URL pattern — Ollama models map 1:1 to HF repos
  const displayName = name
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();

  const combined = [displayName, ...(raw.tags ?? [])].join(" ");

  return {
    id: `live-ollama-${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
    huggingFace: `https://huggingface.co/search/full-text?q=${encodeURIComponent(name)}&type=model`,
    name: displayName,
    family: "Ollama",
    parameters: Math.round(params_B * 10) / 10,
    variants: buildVariants(params_B),
    useCases: inferUseCases(combined + " " + (raw.description ?? "")),
    contextLength: 4096,
    description:
      raw.description ??
      `Ollama library · ${((raw.pulls ?? 0) / 1000).toFixed(0)}K pulls`,
    strengths: [],
    license: "open",
    isLive: true,
  };
}

async function fetchFromOllama(): Promise<Model[]> {
  // Ollama exposes their library search API — works from browser
  const res = await fetch(
    "https://ollama.com/api/search?q=&c=&p=1&ps=40&sort=popular",
    { signal: AbortSignal.timeout(6000) },
  );
  if (!res.ok) return [];
  const data = (await res.json()) as { models?: OllamaModel[] };
  const list =
    data?.models ?? (Array.isArray(data) ? (data as OllamaModel[]) : []);
  return list.flatMap((m) => ollamaModelToModel(m) ?? []);
}

// ── Cache ─────────────────────────────────────────────────────────────────────

interface CacheEntry {
  models: Model[];
  fetchedAt: number;
}

function loadCache(): CacheEntry | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CacheEntry;
  } catch {
    return null;
  }
}

function saveCache(entry: CacheEntry): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // localStorage full — skip
  }
}

export function getCachedLiveModels(): Model[] {
  const entry = loadCache();
  if (!entry) return [];
  return entry.models;
}

export function getLiveCacheAge(): number | null {
  const entry = loadCache();
  if (!entry) return null;
  return Date.now() - entry.fetchedAt;
}

/**
 * Fetch live models from all sources.
 * Always resolves (failures per-source are swallowed).
 * Updates the cache and returns the full list.
 */
export async function fetchLiveModels(): Promise<Model[]> {
  // Check cache TTL
  const entry = loadCache();
  if (entry && Date.now() - entry.fetchedAt < CACHE_TTL) {
    return entry.models;
  }

  const [hfModels, ollamaModels] = await Promise.allSettled([
    fetchFromHuggingFace(),
    fetchFromOllama(),
  ]);

  // Deduplicate across sources
  const seen = new Set<string>();
  const merged: Model[] = [];

  for (const result of [hfModels, ollamaModels]) {
    if (result.status !== "fulfilled") continue;
    for (const m of result.value) {
      if (!seen.has(m.id)) {
        seen.add(m.id);
        merged.push(m);
      }
    }
  }

  if (merged.length > 0) {
    saveCache({ models: merged, fetchedAt: Date.now() });
  }

  return merged;
}

/** Force a fresh fetch (bypasses cache TTL) */
export async function refreshLiveModels(): Promise<Model[]> {
  localStorage.removeItem(CACHE_KEY);
  return fetchLiveModels();
}
