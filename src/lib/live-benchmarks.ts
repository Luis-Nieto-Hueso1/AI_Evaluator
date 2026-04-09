/**
 * Live benchmark fetcher — pulls scores from the Open LLM Leaderboard v2 API.
 *
 * The API returns all models alphabetically with no filtering, so we fetch
 * everything, build a lookup map, and cache in localStorage for 24 hours.
 *
 * Benchmarks provided: IFEval, BBH, MATH Lvl 5, GPQA, MUSR, MMLU-PRO, Average.
 */

const API_BASE =
  "https://open-llm-leaderboard-open-llm-leaderboard.hf.space/api/leaderboard";
const CACHE_KEY = "llm-eval-live-benchmarks-v1";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const PAGE_SIZE = 200;
const MAX_PAGES = 40; // up to ~8000 models

export interface LiveBenchmarkEntry {
  fullname: string;
  params: number;
  average: number;
  ifEval: number;
  bbh: number;
  math: number;
  gpqa: number;
  musr: number;
  mmluPro: number;
  type: string;
}

interface RawEntry {
  fullname?: string;
  "#Params (B)"?: number;
  "Average ⬆️"?: number;
  IFEval?: number;
  BBH?: number;
  "MATH Lvl 5"?: number;
  GPQA?: number;
  MUSR?: number;
  "MMLU-PRO"?: number;
  T?: string;
}

function parseEntry(raw: RawEntry): LiveBenchmarkEntry | null {
  if (!raw.fullname) return null;
  return {
    fullname: raw.fullname,
    params: raw["#Params (B)"] ?? 0,
    average: raw["Average ⬆️"] ?? 0,
    ifEval: raw.IFEval ?? 0,
    bbh: raw.BBH ?? 0,
    math: raw["MATH Lvl 5"] ?? 0,
    gpqa: raw.GPQA ?? 0,
    musr: raw.MUSR ?? 0,
    mmluPro: raw["MMLU-PRO"] ?? 0,
    type: raw.T ?? "",
  };
}

// ── Mapping from our model IDs to HuggingFace fullnames ───────────────────────

const MODEL_HF_MAP: Record<string, string[]> = {
  "llama-3.3-70b": [
    "meta-llama/Llama-3.3-70B-Instruct",
    "meta-llama/Llama-3.3-70B",
  ],
  "llama-3.1-8b": [
    "meta-llama/Llama-3.1-8B-Instruct",
    "meta-llama/Llama-3.1-8B",
    "meta-llama/Meta-Llama-3.1-8B-Instruct",
    "meta-llama/Meta-Llama-3.1-8B",
  ],
  "llama-3.2-3b": [
    "meta-llama/Llama-3.2-3B-Instruct",
    "meta-llama/Llama-3.2-3B",
  ],
  "llama-3.2-1b": [
    "meta-llama/Llama-3.2-1B-Instruct",
    "meta-llama/Llama-3.2-1B",
  ],
  "llama-3.1-70b": [
    "meta-llama/Llama-3.1-70B-Instruct",
    "meta-llama/Llama-3.1-70B",
    "meta-llama/Meta-Llama-3.1-70B-Instruct",
    "meta-llama/Meta-Llama-3.1-70B",
  ],
  "llama-3.1-405b": [
    "meta-llama/Llama-3.1-405B-Instruct",
    "meta-llama/Llama-3.1-405B",
    "meta-llama/Meta-Llama-3.1-405B-Instruct",
    "meta-llama/Meta-Llama-3.1-405B",
  ],
  "llama-3.2-11b-vision": [
    "meta-llama/Llama-3.2-11B-Vision-Instruct",
    "meta-llama/Llama-3.2-11B-Vision",
  ],
  "deepseek-v3": ["deepseek-ai/DeepSeek-V3", "deepseek-ai/DeepSeek-V3-Base"],
  "deepseek-r1-7b": [
    "deepseek-ai/DeepSeek-R1-Distill-Qwen-7B",
    "deepseek-ai/DeepSeek-R1-Distill-Llama-7B",
  ],
  "deepseek-r1-14b": ["deepseek-ai/DeepSeek-R1-Distill-Qwen-14B"],
  "deepseek-r1-32b": ["deepseek-ai/DeepSeek-R1-Distill-Qwen-32B"],
  "deepseek-r1-1.5b": ["deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B"],
  "gemma-3-27b": ["google/gemma-3-27b-it", "google/gemma-3-27b-pt"],
  "gemma-3-12b": ["google/gemma-3-12b-it", "google/gemma-3-12b-pt"],
  "gemma-3-4b": ["google/gemma-3-4b-it", "google/gemma-3-4b-pt"],
  "gemma-3-1b": ["google/gemma-3-1b-it", "google/gemma-3-1b-pt"],
  "gemma-2-27b": ["google/gemma-2-27b-it", "google/gemma-2-27b"],
  "gemma-2-9b": ["google/gemma-2-9b-it", "google/gemma-2-9b"],
  "gemma-2-2b": ["google/gemma-2-2b-it", "google/gemma-2-2b"],
  "phi-4-14b": ["microsoft/phi-4"],
  "phi-3.5-mini": [
    "microsoft/Phi-3.5-mini-instruct",
    "microsoft/Phi-3-mini-4k-instruct",
  ],
  "qwen-2.5-72b": ["Qwen/Qwen2.5-72B-Instruct", "Qwen/Qwen2.5-72B"],
  "qwen-2.5-32b": ["Qwen/Qwen2.5-32B-Instruct", "Qwen/Qwen2.5-32B"],
  "qwen-2.5-14b": ["Qwen/Qwen2.5-14B-Instruct", "Qwen/Qwen2.5-14B"],
  "qwen-2.5-7b": ["Qwen/Qwen2.5-7B-Instruct", "Qwen/Qwen2.5-7B"],
  "qwen-2.5-coder-7b": [
    "Qwen/Qwen2.5-Coder-7B-Instruct",
    "Qwen/Qwen2.5-Coder-7B",
  ],
  "qwen-2.5-coder-32b": [
    "Qwen/Qwen2.5-Coder-32B-Instruct",
    "Qwen/Qwen2.5-Coder-32B",
  ],
  "qwen-3-32b": ["Qwen/Qwen3-32B"],
  "qwen-3-14b": ["Qwen/Qwen3-14B"],
  "qwen-3-8b": ["Qwen/Qwen3-8B"],
  "qwen-3-4b": ["Qwen/Qwen3-4B"],
  "qwen-3-1.7b": ["Qwen/Qwen3-1.7B"],
  "mistral-7b": [
    "mistralai/Mistral-7B-Instruct-v0.3",
    "mistralai/Mistral-7B-Instruct-v0.2",
    "mistralai/Mistral-7B-v0.3",
  ],
  "mistral-nemo-12b": [
    "mistralai/Mistral-Nemo-Instruct-2407",
    "mistralai/Mistral-Nemo-Base-2407",
  ],
  "mistral-small-24b": [
    "mistralai/Mistral-Small-3.1-24B-Instruct-2503",
    "mistralai/Mistral-Small-24B-Instruct-2501",
  ],
  "mixtral-8x7b": [
    "mistralai/Mixtral-8x7B-Instruct-v0.1",
    "mistralai/Mixtral-8x7B-v0.1",
  ],
  "mixtral-8x22b": [
    "mistralai/Mixtral-8x22B-Instruct-v0.1",
    "mistralai/Mixtral-8x22B-v0.1",
  ],
  "codellama-7b": ["codellama/CodeLlama-7b-Instruct-hf"],
  "codellama-34b": ["codellama/CodeLlama-34b-Instruct-hf"],
  "codestral-22b": ["mistralai/Codestral-22B-v0.1"],
  "command-r-35b": ["CohereForAI/c4ai-command-r-v01"],
  "tinyllama-1.1b": ["TinyLlama/TinyLlama-1.1B-Chat-v1.0"],
  "wizardlm-2-7b": ["WizardLMTeam/WizardLM-2-7B"],
  "granite-3.1-8b": [
    "ibm-granite/granite-3.1-8b-instruct",
    "ibm-granite/granite-3.1-8b-base",
  ],
  "granite-3.1-2b": [
    "ibm-granite/granite-3.1-2b-instruct",
    "ibm-granite/granite-3.1-2b-base",
  ],
};

// ── Cache ─────────────────────────────────────────────────────────────────────

interface CacheEntry {
  data: Record<string, LiveBenchmarkEntry>;
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

// ── Fetch ─────────────────────────────────────────────────────────────────────

async function fetchAllEntries(): Promise<Map<string, LiveBenchmarkEntry>> {
  const map = new Map<string, LiveBenchmarkEntry>();
  let offset = 0;

  for (let page = 0; page < MAX_PAGES; page++) {
    try {
      const res = await fetch(
        `${API_BASE}?offset=${offset}&limit=${PAGE_SIZE}`,
        {
          signal: AbortSignal.timeout(15000),
        },
      );
      if (!res.ok) break;
      const data = (await res.json()) as RawEntry[];
      if (!Array.isArray(data) || data.length === 0) break;

      for (const raw of data) {
        const entry = parseEntry(raw);
        if (entry) {
          // Keep the highest-average entry per fullname
          const existing = map.get(entry.fullname);
          if (!existing || entry.average > existing.average) {
            map.set(entry.fullname, entry);
          }
        }
      }

      if (data.length < PAGE_SIZE) break; // last page
      offset += PAGE_SIZE;
    } catch {
      break;
    }
  }

  return map;
}

/**
 * Fetch live benchmarks from the Open LLM Leaderboard v2.
 * Returns a map from our model IDs to their benchmark scores.
 * Cached for 24 hours in localStorage.
 */
export async function fetchLiveBenchmarks(): Promise<
  Record<string, LiveBenchmarkEntry>
> {
  // Check cache
  const cached = loadCache();
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
    return cached.data;
  }

  const allEntries = await fetchAllEntries();
  const result: Record<string, LiveBenchmarkEntry> = {};

  // Map our model IDs to leaderboard entries
  for (const [modelId, hfNames] of Object.entries(MODEL_HF_MAP)) {
    for (const hfName of hfNames) {
      const entry = allEntries.get(hfName);
      if (entry && entry.average > 0) {
        // Prefer instruct/chat versions (higher average usually)
        if (!result[modelId] || entry.average > result[modelId].average) {
          result[modelId] = entry;
        }
      }
    }
  }

  if (Object.keys(result).length > 0) {
    saveCache({ data: result, fetchedAt: Date.now() });
  }

  return result;
}

/** Force refresh, bypasses cache */
export async function refreshLiveBenchmarks(): Promise<
  Record<string, LiveBenchmarkEntry>
> {
  localStorage.removeItem(CACHE_KEY);
  return fetchLiveBenchmarks();
}

/** Get cached data instantly (no fetch) */
export function getCachedBenchmarks(): Record<string, LiveBenchmarkEntry> {
  const cached = loadCache();
  return cached?.data ?? {};
}

/** Age of the cache in ms, or null if no cache */
export function getBenchmarkCacheAge(): number | null {
  const cached = loadCache();
  if (!cached) return null;
  return Date.now() - cached.fetchedAt;
}
