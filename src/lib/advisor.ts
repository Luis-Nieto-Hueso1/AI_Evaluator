import Anthropic from "@anthropic-ai/sdk";
import type {
  HardwareProfile,
  AdvisorMessage,
  CompatibleModel,
} from "../types";

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
});

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

export async function* streamAdvisorResponse(
  messages: AdvisorMessage[],
  hardware: HardwareProfile,
  compatible: CompatibleModel[],
): AsyncGenerator<string> {
  const stream = await client.messages.stream({
    model: "claude-opus-4-6",
    max_tokens: 1024,
    system: buildSystemPrompt(hardware, compatible),
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      yield event.delta.text;
    }
  }
}
