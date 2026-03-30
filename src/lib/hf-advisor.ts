import type {
  HardwareProfile,
  AdvisorMessage,
  CompatibleModel,
} from "../types";

// Free serverless inference — uses the same VITE_HF_TOKEN already in .env.local
const HF_TOKEN = import.meta.env.VITE_HF_TOKEN as string | undefined;
const MODEL = "Qwen/Qwen2.5-7B-Instruct";
// In dev, proxy through Vite to avoid CORS; in prod the direct URL works fine
const HF_BASE = import.meta.env.DEV
  ? "/api/hf"
  : "https://router.huggingface.co";

function buildSystemPrompt(
  hardware: HardwareProfile,
  compatible: CompatibleModel[],
): string {
  const modelList = compatible
    .map((c) => {
      const mem = c.runOnGpu
        ? `${c.bestVariant.vramRequired}GB VRAM`
        : `${c.bestVariant.ramRequired}GB RAM`;
      return `- ${c.model.name} (${c.bestVariant.quantization}, ${mem}, ${c.runOnGpu ? "GPU" : "CPU"}): ${c.model.useCases.join(", ")}`;
    })
    .join("\n");

  return `You are an expert LLM advisor helping a developer choose the right local language model for their hardware and use case.

The user's hardware:
- RAM: ${hardware.ram}GB
- VRAM: ${hardware.vram}GB${hardware.hasGpu ? " (GPU available)" : " (no dedicated GPU)"}

Models they can run (already filtered for their hardware):
${modelList}

Your role:
1. Recommend the BEST specific model for their use case from the list above
2. Explain WHY it's the best fit (capabilities + hardware efficiency)
3. Mention the quantization format and whether it runs on GPU or CPU
4. Give one practical tip for getting started (e.g. Ollama command)
5. If relevant, mention a strong second option

Keep responses concise and practical. Focus on the specific question. Don't mention models they can't run.
Use the format: recommendation → reasoning → quick-start tip.`;
}

export async function* streamHfAdvisorResponse(
  messages: AdvisorMessage[],
  hardware: HardwareProfile,
  compatible: CompatibleModel[],
): AsyncGenerator<string> {
  const res = await fetch(`${HF_BASE}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(HF_TOKEN ? { Authorization: `Bearer ${HF_TOKEN}` } : {}),
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: buildSystemPrompt(hardware, compatible) },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      max_tokens: 1024,
      stream: false,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`HuggingFace API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const fullText: string = data.choices?.[0]?.message?.content ?? "";

  if (fullText) yield fullText;
}
