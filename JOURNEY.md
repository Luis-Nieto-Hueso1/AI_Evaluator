# LLM Evaluator — Project Journey

A running log of everything built, decisions made, and what comes next.

---

## What Is This?

**LLM Evaluator** — a hardware-aware tool that tells you which open-source LLMs you can run locally, how well they'll perform, and why.

**Differentiator over canirun.ai:** The AI Advisor answers "which model should I use for synthetic data generation on my 16 GB machine?" — not just "can I run this specific model?"

**Tech stack:** React · TypeScript · Vite · Tailwind CSS v4 · Anthropic SDK

---

## Phase 1 — Initial Build

**Scaffolded with Vite + React + TypeScript + Tailwind CSS v4.**

Implemented:

- Static JSON model database (`src/data/models.json`)
- Hardware profile form (RAM picker + GPU selector)
- Compatibility engine (`src/lib/compatibility.ts`) — VRAM/RAM check, best-variant selection
- Model cards with grade (A/B/C/D) and speed estimate
- Claude API advisor chat (`src/lib/advisor.ts` + `AdvisorChat.tsx`)
- Hardware auto-detection via WebGL renderer string

---

## Phase 2 — Scoring & Expanded Database

Inspired by canirun.ai's scoring algorithm. Full rewrite of the engine.

**Composite 0–100 score:**

```text
score = speedScore × 0.55 + memScore × 0.35 + qualityBonus × 0.10
```

- Speed score: 80+ tok/s → 100, 40+ → 85, 20+ → 65, 10+ → 45, 5+ → 25, <5 → 10
- Memory headroom score: ≤30% → 100, ≤50% → 80, ≤70% → 55, ≤85% → 30, >85% → 10
- Quality bonus: `Math.min(15, Math.log2(params + 1) × 2.5)` (larger = small bonus)
- Tight-fit penalty: if `memPercent > 0.85`, score × 0.65

**Grade mapping:** 85+ → S, 70+ → A, 55+ → B, 40+ → C, 20+ → D, <20 or no fit → F

**New views added:**

- **Tier List** — all models grouped by grade S→F, with Copy as text button
- **Compare** — pick two devices side-by-side, score comparison, win counters

**Model database expanded:** 18 → 42 models

- Gemma 3 (1B/4B/12B/27B), Qwen 3 (1.7B–32B), Qwen 2.5 Coder, Mixtral 8x7B/8x22B, DeepSeek R1/V3, Mistral Small 3.1, Llama 3.1 70B/405B, CodeLlama 34B, Command R, TinyLlama

**Other improvements:**

- Grade F ("Too heavy") — shown in Tier List, dimmed in Results, filtered from Advisor
- Memory percentage display per card (colour-coded green→red)
- Score badge overlaid on grade letter
- Apple Silicon unified memory support (75% usable cap)
- GPU picker with VRAM/bandwidth lookup table
- CPU picker (Intel/AMD, for display)
- Performance-based sort dropdown
- Grade filter pills + use-case filter pills

---

## Phase 3 — Hardware Detection & Polish

**GPU detection improvements:**

- WebGL `WEBGL_debug_renderer_info` (unmasked renderer) already in place
- Added **WebGPU async detection** (`navigator.gpu.requestAdapter()`) — gives real GPU name in Chrome 113+ even when WebGL is anonymised
- WebGL result shows instantly; WebGPU refines it asynchronously
- Improved name-matching logic (first 2 words, not fragile 6-char slice)
- Added RTX 5000 series to GPU list, VRAM table, and bandwidth map

**RAM detection:**

- `navigator.deviceMemory` is capped at 8 GB by browsers — unfixable
- Added amber "browser-capped — please confirm" warning on the 8 GB button
- Warning clears as soon as the user selects their real amount

**UX quick wins:**

- Dark mode toggle (sun/moon) in header — reads system preference, persists to `localStorage`
- Search box in Results — filters by model name, family, or use case; has × clear button
- Quantization tooltips — hover over `Q4_K_M` / `Q8_0` / `F16` / `Q2_K` badge for plain-English explanation

---

## Phase 4 — How to Run, Detail Panel, CPU Scoring, URL State

**"How to run" commands:**

- Clicking `▶ How to run` on any fitting card expands a panel with exact commands for all three runtimes
- Ollama: `ollama run llama3.1:8b` (41-model lookup table, `OLLAMA_IDS`)
- llama.cpp: `llama-cli -m ./{Model}.{Quant}.gguf -ngl 99 -p "..."` (adds `-ngl 99` flag for GPU runs)
- LM Studio: search + quant + download instruction
- Each command has a one-click copy button (turns to ✓ after copy)

**Runtime recommendation:**

- Each "How to run" panel shows a `★ Recommended` badge on the best runtime for the user's setup
- Has GPU → **Ollama** (native CUDA/Metal support)
- Has coding use-cases → **llama.cpp** (CLI/editor integration)
- Otherwise → **LM Studio** (GUI, best for CPU-only general use)

**Model detail panel:**

- Clicking the model name (with chevron) expands an in-card detail panel
- Shows all variants (Q2/Q4/Q8/F16) with per-variant: score, grade, memory GB, and fit status — computed live against current hardware
- Shows full `model.strengths` list

**CPU speed integration:**

- `getCpuBandwidth(cpu)` added to `hardware-detect.ts` — maps CPU series to real dual-channel RAM bandwidth
- DDR5 desktop (13th/14th Gen Intel, Ryzen 7000/9000): 77–83 GB/s
- DDR4 desktop (12th Gen Intel, Ryzen 5000): 51 GB/s
- Laptop (LPDDR5): 68 GB/s
- `estimateToksPerSec` in `compatibility.ts` now uses provided bandwidth for CPU mode (was hardcoded 50 GB/s)
- `HardwareForm` passes `bandwidth` + `cpuId` in the CPU-only submit path
- Selecting an i9 vs i5 (same generation) doesn't change bandwidth, but DDR5 vs DDR4 generation gives ~50% higher tok/s

**URL state:**

- Hardware config encoded in URL on every submit: `?ram=32&gpu=rtx-4080&cpu=i9-14900k`
- On page load with URL params, results are shown immediately with that hardware profile
- **Share** button next to sort dropdown copies `window.location.href` to clipboard

---

## Roadmap — Feature Backlog

### Tier 1 — High impact (directly serves CV goal)

- [x] **"How to run" commands** ✅ Phase 4
- [x] **URL state** ✅ Phase 4
- [x] **Model detail panel** ✅ Phase 4
- [x] **CPU speed integration** ✅ Phase 4
- [x] **HuggingFace links** ✅ Phase 3
- [x] **Runtime recommendation** ✅ Phase 4

### Tier 2 — UX polish

- [x] **Search box in Results** ✅ Phase 3
- [x] **Quantization tooltips** ✅ Phase 3
- [x] **Dark mode toggle** ✅ Phase 3
- [x] **Quick pick recommendation** ✅ Phase 5 — top 3 picks shown above the results grid: best score, best coding model, most memory-efficient.
- [x] **Mobile / responsive layout** ✅ Phase 5 — stats bar wraps on mobile, tab nav scrolls horizontally, hero padding fixed.
- [x] **Keyboard shortcut** ✅ Phase 5 — press `/` to focus search from anywhere; placeholder hints the shortcut.
- [x] **"No results" empty state** ✅ Phase 5 — context-aware message + one-click clear buttons for each active filter.

### Tier 3 — Technical quality

- [x] **Export results as CSV/JSON** ✅ Phase 5 — CSV and JSON download buttons in Results stats bar and Tier List header; uses `URL.createObjectURL` + temp `<a>` tag.
- [x] **Unit test suite (Vitest)** ✅ Phase 5 — 33 tests covering `computeScore`, `scoreToGrade`, `estimateToksPerSec`, `getCompatibleModels`, `getAllModels`, `getVariantScores`; run with `npm test`.
- [x] **Error boundary** ✅ Phase 5 — `ErrorBoundary` class component wraps `AdvisorChat`; async API errors now show a Retry button that replays the last message.
- [x] **Accessibility pass** ✅ Phase 6 — `aria-label` on dark mode toggle + clear search ×; GPU/CPU picker triggers and list items now have `tabIndex`, `role`, `aria-expanded`, `aria-selected`, and `onKeyDown` Enter/Space handlers.
- [x] **More models** ✅ Phase 6 — Added WizardLM 2 7B, Granite 3.1 8B, Granite 3.1 2B (45 total). Phi-4 14B, Llama 3.3 70B, Gemma 3 27B were already present.
- [x] **PWA / offline support** ✅ Phase 6 — `public/manifest.json` with name, icons, theme colour; `public/sw.js` cache-first service worker; SW registered in `index.html`; page title and meta description updated.

### Tier 4 — Future / post-MVP

- [x] **HuggingFace Hub API integration** ✅ Phase 6 — `src/lib/hf-api.ts` fetches download count, likes, and last-updated from the HF API when a card's detail panel is opened; two-layer cache (memory + sessionStorage); bearer token via `VITE_HF_TOKEN`; estimated GGUF file sizes shown per variant; graceful no-op on failure.
- [x] **Vercel / Netlify deployment** ✅ Phase 6 — `vercel.json` (SPA rewrites + build config) and `public/_redirects` (Netlify) added; zero-config deploy from repo root.
- [x] **GitHub Actions CI** ✅ Phase 6 — `.github/workflows/ci.yml` runs lint → tsc → vitest on every push to `main`/`Realese` and on all PRs; blocks merges on failure.
- [x] **Benchmark mode** ✅ Phase 6 — `BenchmarkCalibrator` component lets users select a model they tested and enter actual tok/s; computes a calibration factor stored in `localStorage`; applied to all speed displays in Results and Tier List with a small `cal` badge.

- [x] **Algorithm Picker** ✅ Phase 7 — New tab with 37 algorithms across 5 task types; step-by-step questionnaire (task · dataset size · interpretability · feature count); results ranked live; each card expandable with pros/cons, complexity, docs link, and SVG visual of how the algorithm works.
- [x] **Benchmark scores on model cards** ✅ Phase 7 — MMLU, HumanEval, MT-Bench bar charts in the detail panel for all 45 models.
- [x] **Context window calculator** ✅ Phase 7 — Shows estimated max tokens and page count based on your available RAM/VRAM after loading the model (uses per-model KV cache MB/token).
- [x] **API cost comparison** ✅ Phase 7 — Shows cheapest API equivalent (provider, $/1M tokens, - [x] **Model Timeline** ✅ Phase 7 — New "Timeline" tab with 25+ open-source LLM milestones from ChatGPT (2022) to Qwen 3 / LLaMA 4 (2025); filter by org; milestone-only toggle; "in this app" badges.monthly cost at 100K tok/day) in the detail panel.


---

## Phase 8 — Live Model Registry & Custom Import

**Goal:** model database is never stale — new releases appear automatically.

**Live model feed (auto):**

- `src/lib/live-models.ts` — fetches top models from two sources on page load:
  - **HuggingFace Hub API** (`?filter=gguf&full=true&sort=downloads`) — top 40 GGUF + top 40 text-generation models
  - **Ollama library API** (`/api/search?sort=popular`) — their curated popular list
- Results are cached in `localStorage` for 24 hours; stale cache is refreshed in the background
- Models are deduplicated against the static DB (fuzzy match on org + ±20% parameter count)
- New models from `getCompatibleModels` / `getAllModels` now accept an optional `extra: Model[]` param — live + custom models flow through the same scoring engine
- Stats bar shows `● +N live ↻` with cache-age tooltip; ↻ button forces an immediate refresh
- Green `Live` badge on model cards; `Live · HF ↗` link badge in the Timeline

**Add by HF URL (manual):**

- `src/lib/hf-model-import.ts` — parses any HF URL or `owner/repo` string, fetches the model card, extracts parameter count (MoE-aware), generates Q2_K / Q4_K_M / Q8_0 / F16 variants, persists to `localStorage`
- `src/components/AddModelForm.tsx` — collapsible widget in the left sidebar: URL input, loading spinner, success/error states, removable custom model list
- Purple `Custom` badge on model cards

**Timeline integration:**

- Live models with a `releaseDate` (from `lastModified` / `createdAt`) are inserted into the Timeline in correct chronological order
- `Live (N)` toggle button in controls bar; hides/shows live entries independently
- `isLive`, `isCustom`, `releaseDate` added to the `Model` type

**Bug fix:**

- `AdvisorChat` scroll: replaced `scrollIntoView()` (which jumped the whole page) with `container.scrollTop = container.scrollHeight` scoped to the chat box only.

---

## Backlog

### High priority

- [x] **Algorithm AI Advisor** ✅ Phase 9 — Collapsible chat sidebar in Algorithm Picker; HF-powered (Qwen 2.5); system prompt includes current questionnaire state (task, size, interp, features) + top 5 ranked results; suggested questions like "I have 10K labelled samples" and "Which is faster: Random Forest or XGBoost?".
- [x] **Framework Picker** ✅ Phase 9 — New "Framework Picker" tab with 10 frameworks (scikit-learn, PyTorch, TensorFlow, JAX, HuggingFace, XGBoost, fast.ai, ONNX, MLX, llama.cpp); 4-step questionnaire (task type → goal → team size → hardware target); weighted scoring; expandable cards with pros/cons, ecosystem, learning curve, hardware tags, and docs links.
- [x] **Deployment Guide tab** ✅ Phase 9 — New "Deploy Guide" tab with 7 inference stacks (Ollama, llama.cpp, vLLM, TGI, TensorRT-LLM, MLX, ExLlamaV2); 3-step questionnaire (target environment → GPU availability → priority); each card expands with install/run commands (copy buttons), config flags, memory notes, quant format tags, pros/cons, and docs links.
- [x] **Share button on Algorithm Picker** ✅ Phase 9 — Encodes questionnaire state (`algo_task`, `algo_size`, `algo_interp`, `algo_feat`) in URL params; reads them back on load to restore state; "Share" button copies link to clipboard with "Copied!" feedback.

### Medium priority

- [x] **Model benchmark leaderboard** ✅ Phase 9 — New "Leaderboard" tab with sortable table: Rank, Model, Params, MMLU %, HumanEval %, MT-Bench /10. Color-coded scores (green/amber/red). Click column headers to toggle sort direction.
- [x] **Scikit-learn code snippets** — One-click copy of minimal sklearn quickstart code for each algorithm (fit + predict + metrics). All 37 algorithms have "Quick Start" code blocks with copy button in expanded card.
- [x] **Algorithm complexity comparison table** — Side-by-side train/inference complexity for all results in the current query. Toggle "Complexity" button in results header shows sortable table with color-coded Big-O notation.
- [x] **Onboarding tooltip tour** — First-visit walkthrough highlighting hardware form → grade badges → detail panel → advisor chat. 4-step spotlight tour with skip/next, stored in localStorage.
- [x] **Keyboard shortcut help modal** ✅ Phase 9 — Press `?` to show all shortcuts (`/` focus search, `?` toggle modal, `Esc` close). Styled overlay with kbd tags, closes on backdrop click or Escape.

### Low priority / Polish

- [x] **Algorithm interactive flowchart** — SVG decision tree with 25 nodes mirroring sklearn cheat sheet. Click to navigate, backtrack by clicking visited nodes, "Share path" URL encoding via `flowpath` param.
- [x] **Model timeline enhancements** — Year zoom filter pills, hover-to-expand detail cards (vertical mode) and hover popup (horizontal mode), horizontal scroll toggle for widescreen.
- [x] **Cost calculator improvements** — Tokens/day slider (10K–5M), input/output ratio selector (50/50, 80/20, 20/80), 3-column cost breakdown, CSV export button.

---

## Future Project Ideas

### Algorithm Selector (scikit-learn style)

A companion tool — or a new tab in this app — that helps users pick the right **ML algorithm** for their problem, the same way this tool picks the right LLM for their hardware.

**Concept:**

- User answers a short decision-tree questionnaire: task type (classification / regression / clustering / dimensionality reduction), dataset size, interpretability requirement, whether labels exist, etc.
- Tool walks them down a flowchart (like the [scikit-learn algorithm cheat sheet](https://scikit-learn.org/stable/machine_learning_map.html)) and returns a ranked list of algorithm candidates with trade-off explanations.
- Each result card shows: algorithm name, typical use cases, pros/cons, complexity (train + inference), and a one-click link to the scikit-learn or statsmodels docs page.

**Algorithm categories to cover:**

| Task                     | Candidates                                                                        |
| ------------------------ | --------------------------------------------------------------------------------- |
| Regression               | Linear, Ridge, Lasso, ElasticNet, SVR, Random Forest, Gradient Boosting, XGBoost  |
| Classification           | Logistic Regression, KNN, SVM, Decision Tree, Random Forest, XGBoost, Naive Bayes |
| Clustering               | K-Means, DBSCAN, Agglomerative, GMM                                               |
| Dimensionality reduction | PCA, t-SNE, UMAP, LDA                                                             |
| Time series              | ARIMA, Prophet, LSTM guidance                                                     |

**Interactive algorithm map:**

- Visual flowchart (SVG or a lightweight canvas lib) mirroring the scikit-learn cheat sheet, but interactive — hover a node to preview the algorithm, click to expand a detail card.
- User's current path through the tree is highlighted so they can backtrack and explore alternatives.
- "Share this path" button encodes the decision tree state in the URL (same pattern as the LLM hardware URL state).

**AI Advisor extension:**

- Same Claude-powered chat sidebar, but scoped to algorithm selection: "I have 10 000 labelled samples, I need to explain predictions to a non-technical stakeholder — what do you recommend?"
- Advisor is given a system prompt describing the algorithm DB and the user's questionnaire answers.

**Implementation notes:**

- Algorithm DB as a static JSON (same pattern as `models.json`) — fields: `id`, `task`, `name`, `complexity`, `interpretability`, `minSamples`, `pros`, `cons`, `docsUrl`.
- Decision tree logic as a pure function (easy to unit test with Vitest — same pattern as `computeScore`).
- Could live as a second route (`/algorithms`) using React Router, or as a new tab in the existing tab nav.

---

## Architecture Notes

```text
src/
├── App.tsx                  — shell, tab nav, state owner (hardware, view, filters)
├── types.ts                 — Model, HardwareProfile, CompatibleModel, Grade
├── data/
│   └── models.json          — static model database (42 models)
├── lib/
│   ├── compatibility.ts     — scoring engine, getAllModels, getCompatibleModels
│   ├── hardware-detect.ts   — WebGL + WebGPU detection, GPU_LIST, GPU_BANDWIDTH
│   └── advisor.ts           — Claude streaming advisor
└── components/
    ├── HardwareForm.tsx     — GPU/CPU/RAM picker, auto-detect integration
    ├── ModelCard.tsx        — card with grade, score, memory %, quant tooltip
    ├── TierList.tsx         — tier-grouped list + Copy as text
    ├── CompareView.tsx      — two device pickers, side-by-side scores
    └── AdvisorChat.tsx      — Claude-powered chat, streaming
```

**Key decisions:**

- Static JSON model DB for MVP — future: pull from HuggingFace Hub API
- Speed estimate = `bandwidth × efficiency / bytes_per_token` (GPU ~0.70, CPU ~0.12)
- `getCompatibleModels` (fits only) → Results + Advisor; `getAllModels` (includes F) → Tier List
- Apple Silicon detected via `isUnified = hasGpu && vram > 0 && ram === vram`
- MoE models (Mixtral): use total parameter count for VRAM estimation
