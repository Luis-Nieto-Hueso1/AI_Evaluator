import type { AdvisorMessage } from "../types";

const HF_TOKEN = import.meta.env.VITE_HF_TOKEN as string | undefined;
const MODEL = "Qwen/Qwen2.5-7B-Instruct";
const HF_BASE = import.meta.env.DEV
  ? "/api/hf"
  : "https://router.huggingface.co";

export const HAS_ALGO_ADVISOR =
  Boolean(HF_TOKEN) || Boolean(import.meta.env.VITE_ANTHROPIC_API_KEY);

interface AlgoContext {
  task: string | null;
  size: string | null;
  interp: string | null;
  features: string | null;
  topResults: string[];
}

function buildSystemPrompt(ctx: AlgoContext): string {
  const state = [
    ctx.task ? `Task type: ${ctx.task}` : null,
    ctx.size ? `Dataset size: ${ctx.size}` : null,
    ctx.interp ? `Interpretability need: ${ctx.interp}` : null,
    ctx.features ? `Feature count: ${ctx.features}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const results =
    ctx.topResults.length > 0
      ? `\nCurrent top-ranked algorithms:\n${ctx.topResults.map((r, i) => `${i + 1}. ${r}`).join("\n")}`
      : "";

  return `You are an expert machine learning advisor helping a developer choose the right ML algorithm for their problem.

The user is using an interactive algorithm picker tool. Here is their current questionnaire state:
${state || "(No selections yet)"}
${results}

Your role:
1. Help them pick the BEST algorithm for their specific situation
2. Explain tradeoffs in plain language (accuracy vs speed vs interpretability)
3. Give practical advice: dataset prep, hyperparameter tips, common pitfalls
4. Suggest scikit-learn or equivalent code snippets when helpful
5. If they describe their data, recommend specific preprocessing steps

Keep responses concise (3-5 paragraphs max). Use bullet points for comparisons.
Focus on practical, actionable advice — not textbook definitions.`;
}

export async function* streamAlgoAdvisorResponse(
  messages: AdvisorMessage[],
  ctx: AlgoContext,
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
        { role: "system", content: buildSystemPrompt(ctx) },
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
