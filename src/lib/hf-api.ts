export interface HfModelMeta {
  downloads: number;
  likes: number;
  lastModified: string;
}

// Two-layer cache: in-memory (instant) + sessionStorage (survives re-renders)
const memCache = new Map<string, HfModelMeta | null>();

function extractModelId(hfUrl: string): string | null {
  const match = hfUrl.match(/huggingface\.co\/([^/?#]+\/[^/?#]+)/);
  return match ? match[1] : null;
}

export async function fetchHfMeta(hfUrl: string): Promise<HfModelMeta | null> {
  if (memCache.has(hfUrl)) return memCache.get(hfUrl) ?? null;

  try {
    const stored = sessionStorage.getItem(`hf:${hfUrl}`);
    if (stored) {
      const parsed = JSON.parse(stored) as HfModelMeta;
      memCache.set(hfUrl, parsed);
      return parsed;
    }
  } catch {}

  const modelId = extractModelId(hfUrl);
  if (!modelId) {
    memCache.set(hfUrl, null);
    return null;
  }

  const hfToken = import.meta.env.VITE_HF_TOKEN as string | undefined;
  const headers: HeadersInit = hfToken
    ? { Authorization: `Bearer ${hfToken}` }
    : {};

  try {
    const res = await fetch(`https://huggingface.co/api/models/${modelId}`, {
      headers,
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      memCache.set(hfUrl, null);
      return null;
    }

    const data = await res.json();
    const meta: HfModelMeta = {
      downloads: data.downloads ?? 0,
      likes: data.likes ?? 0,
      lastModified: data.lastModified ?? "",
    };

    memCache.set(hfUrl, meta);
    try {
      sessionStorage.setItem(`hf:${hfUrl}`, JSON.stringify(meta));
    } catch {}
    return meta;
  } catch {
    memCache.set(hfUrl, null);
    return null;
  }
}

export function formatDownloads(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export function formatRelativeDate(iso: string): string {
  if (!iso) return "";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days === 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

// Estimate GGUF download size: params × bits-per-weight ÷ 8
const QUANT_BITS: Record<string, number> = {
  Q2_K: 2.625,
  Q4_K_M: 4.85,
  Q8_0: 8.5,
  F16: 16,
};

export function estimateFileSizeGb(
  params_B: number,
  quantization: string,
): number {
  const bits = QUANT_BITS[quantization] ?? 4.85;
  return parseFloat(((params_B * bits) / 8).toFixed(1));
}
