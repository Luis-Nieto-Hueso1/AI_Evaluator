# LLM Evaluator — Architecture Documentation

## System Overview

LLM Evaluator is a single-page React application that helps users determine which open-source LLMs they can run on their hardware, select the right ML algorithms, choose frameworks, and plan deployments. The app runs entirely in the browser with optional API integrations for live data and AI-powered recommendations.

---

## High-Level Architecture

```
+------------------------------------------------------------------+
|                        Browser (SPA)                              |
|                                                                   |
|  +------------------+    +------------------+    +--------------+ |
|  |    App Shell     |    |   Tab Router     |    | Dark Mode /  | |
|  |  (App.tsx)       |--->|  8 Views         |    | URL State    | |
|  +------------------+    +------------------+    +--------------+ |
|          |                        |                               |
|  +-------v--------+    +---------v----------+                     |
|  |  Hardware       |    |   View Layer       |                    |
|  |  Profile Form   |    |   (18 Components)  |                    |
|  +-------+--------+    +---------+----------+                     |
|          |                        |                               |
|  +-------v------------------------v----------+                    |
|  |           Core Engine Layer                |                    |
|  |  compatibility.ts | calibration.ts         |                    |
|  |  advisor.ts | algo-advisor.ts              |                    |
|  |  hf-model-import.ts | live-models.ts       |                    |
|  +--------------------+-----------+----------+                    |
|                       |           |                               |
|  +--------------------v--+  +-----v----------+                    |
|  |   Static Data Layer   |  | Cache Layer    |                    |
|  |  models.json (45+)    |  | localStorage   |                    |
|  |  algorithms.json (37) |  | sessionStorage |                    |
|  |  frameworks.json      |  +----------------+                    |
|  |  deployment-stacks.json|                                       |
|  +-----------------------+                                        |
+------------------------------------------------------------------+
          |                    |                    |
  +-------v------+   +--------v-------+   +-------v--------+
  | HuggingFace  |   | HuggingFace    |   | Anthropic      |
  | Hub API      |   | Router API     |   | Claude API     |
  | (live models)|   | (AI chat)      |   | (AI advisor)   |
  +--------------+   +----------------+   +----------------+
```

---

## Layer Breakdown

### 1. App Shell (`App.tsx`)

The root component manages:

- **Tab routing** — 8 views selected via state (`view`), no client-side router needed
- **Hardware profile** — lifted state shared across all views
- **Dark mode** — toggles `dark` class on `<html>`, persists to localStorage
- **URL state** — encodes hardware config + active view in query params
- **Live models** — fetched on mount, merged into static DB
- **Custom models** — user-imported via HF URL, persisted in localStorage

### 2. View Layer (8 Tabs)

| Tab         | Component(s)                                                   | Purpose                       |
| ----------- | -------------------------------------------------------------- | ----------------------------- |
| Results     | `HardwareForm` + `ModelCard` + `AdvisorChat`                   | Core compatibility checker    |
| Tier List   | `TierList`                                                     | Models grouped by grade S-F   |
| Compare     | `CompareView`                                                  | Side-by-side model comparison |
| Algorithms  | `AlgorithmFlowchart` + `AlgorithmSelector` + `AlgoAdvisorChat` | ML algorithm recommendation   |
| Frameworks  | `FrameworkFlowchart` + `FrameworkPicker`                       | ML framework selection        |
| Deploy      | `DeploymentFlowchart` + `DeploymentGuide`                      | Inference stack selection     |
| Leaderboard | `Leaderboard`                                                  | Benchmark score table         |
| Timeline    | `ModelTimeline`                                                | LLM release history           |

### 3. Core Engine (`src/lib/`)

| Module               | Responsibility                                                        |
| -------------------- | --------------------------------------------------------------------- |
| `compatibility.ts`   | VRAM/RAM check, variant selection, tok/s estimation, scoring, grading |
| `calibration.ts`     | User-provided tok/s calibration factor (localStorage)                 |
| `advisor.ts`         | Claude API streaming chat for use-case recommendations                |
| `hf-advisor.ts`      | HuggingFace Router API fallback for AI chat                           |
| `algo-advisor.ts`    | Algorithm recommendation AI chat                                      |
| `hf-api.ts`          | HuggingFace model metadata (downloads, likes, GGUF sizes)             |
| `hf-model-import.ts` | Parse HF URL, fetch model card, generate variants                     |
| `live-models.ts`     | Auto-fetch trending models from HF Hub + Ollama                       |
| `hardware-detect.ts` | WebGL/WebGPU GPU detection, CPU bandwidth lookup                      |
| `export.ts`          | CSV/JSON export utilities                                             |

### 4. Data Layer (`src/data/`)

| File                     | Records | Contents                                              |
| ------------------------ | ------- | ----------------------------------------------------- |
| `models.json`            | 45+     | LLM definitions (params, variants, benchmarks, costs) |
| `algorithms.json`        | 37      | ML algorithms (complexity, tasks, sklearn snippets)   |
| `frameworks.json`        | 10      | ML frameworks (tasks, targets, team fit scores)       |
| `deployment-stacks.json` | 8       | Inference stacks (install cmds, config flags)         |

---

## Data Flow

### Compatibility Scoring Pipeline

```
HardwareProfile ──> getCompatibleModels()
                         |
                         ├── For each model:
                         |     ├── Select best variant (highest quality that fits)
                         |     ├── Determine GPU vs CPU execution
                         |     ├── estimateToksPerSec(params, quant, gpu, bandwidth)
                         |     ├── computeScore(toks, memPercent, params)
                         |     └── scoreToGrade(score) → S/A/B/C/D/F
                         |
                         └── Returns CompatibleModel[]
                               ├── Sorted by score (desc)
                               ├── Filtered by grade/use-case/search
                               └── Rendered as ModelCard grid
```

### Scoring Formula

```
score = speedScore × 0.55 + memScore × 0.35 + qualityBonus × 0.10

Speed tiers:    80+ tok/s → 100 | 40+ → 85 | 20+ → 65 | 10+ → 45 | 5+ → 25 | <5 → 10
Memory tiers:   ≤30% used → 100 | ≤50% → 80 | ≤70% → 55 | ≤85% → 30 | >85% → 10
Quality bonus:  min(15, log2(params + 1) × 2.5)
Tight-fit:      if memPercent > 0.85 → score × 0.65

Grade mapping:  85+ → S | 70+ → A | 55+ → B | 40+ → C | 20+ → D | <20 → F
```

### Token Speed Estimation

```
GPU: tok/s = bandwidth(GB/s) × 0.70 / bytesPerToken
CPU: tok/s = bandwidth(GB/s) × 0.12 / bytesPerToken

bytesPerToken = (params_B × bitsPerWeight) / 8

Quantization bits: Q2_K=2.625 | Q4_K_M=4.85 | Q8_0=8.5 | F16=16
```

---

## External Integrations

### HuggingFace Hub API

- **Purpose**: Live model feed + model metadata
- **Endpoints**: `/api/models?filter=gguf&sort=downloads`, `/api/models/{id}`
- **Caching**: localStorage, 24h TTL
- **Auth**: Optional `VITE_HF_TOKEN` bearer token

### HuggingFace Router API

- **Purpose**: AI advisor chat (free tier)
- **Model**: Qwen 2.5 72B via HF inference
- **Fallback**: Used when no Anthropic API key is set

### Anthropic Claude API

- **Purpose**: Premium AI advisor chat
- **Model**: Claude (via `@anthropic-ai/sdk`)
- **Auth**: `VITE_ANTHROPIC_API_KEY`
- **Features**: Streaming responses, hardware-aware context

---

## State Management

No external state library — React `useState` + prop drilling from App.tsx.

| State              | Location                          | Persistence                 |
| ------------------ | --------------------------------- | --------------------------- |
| Hardware profile   | `App.tsx`                         | URL params                  |
| Dark mode          | `App.tsx`                         | localStorage                |
| Active view/tab    | `App.tsx`                         | URL params                  |
| Live models        | `App.tsx`                         | localStorage (24h)          |
| Custom models      | `App.tsx`                         | localStorage                |
| Calibration factor | `BenchmarkCalibrator`             | localStorage                |
| Tour completed     | `OnboardingTour`                  | localStorage                |
| Chat messages      | `AdvisorChat` / `AlgoAdvisorChat` | In-memory only              |
| Flowchart path     | `*Flowchart` components           | URL params (algorithm only) |

---

## Build & Deploy

```
Vite 8 (dev + build)
├── vite.config.ts — HF API proxy (/hf-api → huggingface.co)
├── TypeScript strict mode
├── Tailwind CSS v4 (@tailwindcss/vite plugin)
├── Vitest (33 unit tests)
└── ESLint 9 (flat config)

Output: dist/ (static SPA)
├── Vercel: vercel.json (SPA rewrites)
├── Netlify: public/_redirects
├── GitHub Pages: supported
└── PWA: manifest.json + sw.js (cache-first)
```

---

## Component Dependency Graph

```
App.tsx
├── HardwareForm ─────────────────────────── hardware-detect.ts
├── AddModelForm ─────────────────────────── hf-model-import.ts
├── ModelCard ────────────────────────────── compatibility.ts, hf-api.ts
│   └── CostCalculator (inline)
├── AdvisorChat ──────────────────────────── advisor.ts / hf-advisor.ts
├── TierList ─────────────────────────────── compatibility.ts
├── CompareView ──────────────────────────── compatibility.ts
├── AlgorithmFlowchart ───────────────────── (self-contained SVG)
├── AlgorithmSelector ────────────────────── algorithms.json
│   └── AlgoAdvisorChat ──────────────────── algo-advisor.ts
├── FrameworkFlowchart ───────────────────── (self-contained SVG)
├── FrameworkPicker ──────────────────────── frameworks.json
├── DeploymentFlowchart ──────────────────── (self-contained SVG)
├── DeploymentGuide ──────────────────────── deployment-stacks.json
├── Leaderboard ──────────────────────────── models.json
├── ModelTimeline ────────────────────────── models.json + live-models.ts
├── BenchmarkCalibrator ──────────────────── calibration.ts
├── OnboardingTour ───────────────────────── (self-contained)
└── ErrorBoundary ────────────────────────── (wrapper)
```

---

## Security Considerations

- API keys are environment variables (`VITE_` prefix = client-exposed)
- HF API proxy in dev mode prevents CORS issues
- No server-side code — all logic runs in-browser
- Service worker uses cache-first strategy
- No user auth, no database, no PII collection

---

## Test Coverage

33 unit tests in `src/lib/__tests__/compatibility.test.ts`:

- `computeScore` — verifies scoring formula across speed/memory/param ranges
- `scoreToGrade` — boundary tests for S/A/B/C/D/F
- `estimateToksPerSec` — GPU vs CPU, different quantizations
- `getCompatibleModels` — integration test with real model data
- `getAllModels` — verifies static + live model merging
- `getVariantScores` — per-variant scoring for detail panel
