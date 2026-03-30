import type { CompatibleModel } from "../types";

function download(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function formatToks(toks: number): string {
  if (toks >= 100) return ">100";
  if (toks >= 1) return `~${Math.round(toks)}`;
  return "<1";
}

export function exportCsv(models: CompatibleModel[], tag: string) {
  const header = [
    "Name",
    "Family",
    "Parameters (B)",
    "Grade",
    "Score",
    "Quantization",
    "Memory Used (GB)",
    "Memory Type",
    "Speed (tok/s)",
    "Context",
    "Use Cases",
    "License",
  ].join(",");

  const rows = models.map((m) => {
    const memUsed = m.runOnGpu
      ? m.bestVariant.vramRequired
      : m.bestVariant.ramRequired;
    const cols = [
      `"${m.model.name}"`,
      m.model.family,
      m.model.parameters,
      m.grade,
      m.score,
      m.bestVariant.quantization,
      memUsed,
      m.runOnGpu ? "VRAM" : "RAM",
      m.fits ? formatToks(m.tokensPerSec) : "N/A",
      m.model.contextLength,
      `"${m.model.useCases.join(", ")}"`,
      m.model.license,
    ];
    return cols.join(",");
  });

  download([header, ...rows].join("\n"), `llm-results-${tag}.csv`, "text/csv");
}

export function exportJson(models: CompatibleModel[], tag: string) {
  const payload = models.map((m) => ({
    id: m.model.id,
    name: m.model.name,
    family: m.model.family,
    parameters: m.model.parameters,
    grade: m.grade,
    score: m.score,
    fits: m.fits,
    quantization: m.bestVariant.quantization,
    memoryUsedGb: m.runOnGpu
      ? m.bestVariant.vramRequired
      : m.bestVariant.ramRequired,
    memoryType: m.runOnGpu ? "VRAM" : "RAM",
    tokensPerSec: m.fits ? m.tokensPerSec : 0,
    contextLength: m.model.contextLength,
    useCases: m.model.useCases,
    license: m.model.license,
    huggingFace: m.model.huggingFace,
  }));

  download(
    JSON.stringify(payload, null, 2),
    `llm-results-${tag}.json`,
    "application/json",
  );
}
