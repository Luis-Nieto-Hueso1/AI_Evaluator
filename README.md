# LLM Evaluator

<p align="center">
  <img src="src/assets/logo-2i.svg" alt="2i Logo" width="120" />
</p>

<p align="center">
  <strong>Find which AI models your hardware can run — and learn how to choose the right one.</strong>
</p>

<p align="center">
  <a href="#features">Features</a> ·
  <a href="#getting-started">Getting Started</a> ·
  <a href="#tabs-overview">Tabs Overview</a> ·
  <a href="#tech-stack">Tech Stack</a> ·
  <a href="#project-structure">Project Structure</a> ·
  <a href="#environment-variables">Environment Variables</a> ·
  <a href="#testing">Testing</a> ·
  <a href="#deployment">Deployment</a>
</p>

---

## What Is This?

**LLM Evaluator** is a hardware-aware tool that tells you which open-source LLMs you can run locally, how well they'll perform, and why. It goes beyond simple "can I run this?" checks — it grades every model against your specific hardware, estimates speed, recommends the best runtime, and provides an AI-powered advisor for personalised recommendations.

Built as a training and educational tool, it's designed for people who are new to AI/ML as well as experienced practitioners looking for a quick hardware compatibility check.

**What makes it different from canirun.ai:**

- AI Advisor answers questions like _"Which model should I use for synthetic data generation on my 16 GB machine?"_
- Algorithm Picker, Framework Picker, and Deployment Guide help you choose the full ML stack — not just the model
- Glossary tab explains every concept and tag in depth for beginners
- Educational LearnBanner on every tab with expandable concept cards

---

## Features

- **Hardware detection** — auto-detects GPU (WebGL + WebGPU) and suggests RAM; supports NVIDIA, AMD, Intel, and Apple Silicon
- **60+ models** — static database plus live feed from HuggingFace Hub and Ollama library
- **Scoring engine** — composite 0–100 score based on speed, memory headroom, and quantization quality
- **Grade system** — S/A/B/C/D/F grades with color-coded badges
- **Quantization variants** — shows Q2_K, Q4_K_M, Q8_0, F16 options with memory and quality trade-offs
- **Speed estimates** — tokens/second based on your GPU/CPU bandwidth
- **How to run** — copy-paste commands for Ollama, llama.cpp, and LM Studio
- **AI Advisor** — Claude-powered chat for personalised model recommendations (requires API key)
- **Benchmark scores** — MMLU, HumanEval, MT-Bench on every model card
- **API cost comparison** — shows what you'd pay for the equivalent cloud API
- **URL state** — share your hardware config and results via URL
- **Dark mode** — system preference + manual toggle, persisted
- **PWA** — installable, works offline
- **Educational content** — LearnBanner on every tab, 50+ glossary terms, 32 use-case tag explanations

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- npm 9+

### Install & Run

```bash
# Clone the repository
git clone https://github.com/LuisNietoHueso/AI_Evaluator.git
cd AI_Evaluator

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Commands

| Command              | Description                      |
| -------------------- | -------------------------------- |
| `npm run dev`        | Start dev server with hot reload |
| `npm run build`      | Type-check + production build    |
| `npm run preview`    | Preview production build locally |
| `npm test`           | Run test suite (Vitest)          |
| `npm run test:watch` | Run tests in watch mode          |
| `npm run coverage`   | Run tests with coverage report   |
| `npm run lint`       | ESLint check                     |

---

## Tabs Overview

### Results

The main view. Enter your hardware (RAM, GPU, CPU) and see all compatible models ranked by score. Each model card shows grade (S–F), score (0–100), parameters, context window, speed estimate (tok/s), memory usage, quantization format, expandable detail panel with all variants and benchmark scores, API cost comparison, and "How to run" commands for Ollama, llama.cpp, and LM Studio.

### Guided Discovery

Answer a few questions about your problem, data, and experience level. Get personalised recommendations for algorithms, frameworks, and deployment strategies — no prior ML knowledge needed.

### Tier List

All models grouped by grade (S → F). Quick visual overview of what fits your hardware. Exportable as CSV/JSON.

### Compare

Pick two hardware configurations and compare side by side. See which models each can run and how scores differ.

### Algorithm Picker

37 ML algorithms across 5 task types (classification, regression, clustering, dimensionality reduction, time series). Interactive questionnaire narrows results. Each card shows pros/cons, complexity, scikit-learn code snippets, and a visual explanation. Includes an interactive SVG flowchart mirroring the scikit-learn cheat sheet.

### Framework Picker

10 ML frameworks (PyTorch, TensorFlow, scikit-learn, JAX, HuggingFace, XGBoost, fast.ai, ONNX, MLX, llama.cpp) ranked by a 4-step questionnaire. Expandable cards with ecosystem details, learning curve, and hardware compatibility.

### Deploy Guide

7 inference stacks (Ollama, llama.cpp, vLLM, TGI, TensorRT-LLM, MLX, ExLlamaV2) with install commands, config flags, and resource requirements. Interactive flowchart for choosing the right deployment strategy.

### Leaderboard

Sortable benchmark table: model name, parameters, MMLU, HumanEval, MT-Bench. Click column headers to sort. Color-coded scores.

### Timeline

Visual history of open-source LLMs from ChatGPT (2022) to Qwen 3 and Llama 4 (2025). Filter by organization. Live models appear in chronological order.

### Glossary

32 use-case tags explained in depth (RAG, agents, coding, chain-of-thought, function-calling, etc.). Each entry has a detailed explanation, example use cases, and clickable related tags. Searchable with category filters: Language & Writing, Code & Dev, Data & Extraction, Reasoning & Science, Vision & Multimodal, Deployment.

---

## Educational Features

Every tab includes a **LearnBanner** — a dismissible panel with expandable concept cards tailored to that section:

| Tab              | Topics covered                                                                                          |
| ---------------- | ------------------------------------------------------------------------------------------------------- |
| Results          | What is an LLM, parameters, quantization, RAM vs VRAM, context window, grades, model choice, algorithms |
| Guided Discovery | What it is, programming needs, ML workflow, when NOT to use AI                                          |
| Tier List        | What tiers mean, same model in different tiers, S-tier vs capability, grading factors                   |
| Compare          | Why compare, tok/s, benchmarks, bigger model vs better quantization                                     |
| Algorithms       | ML vs LLM, supervised/unsupervised, classification/regression, overfitting, deep learning, evaluation   |
| Frameworks       | What frameworks are, PyTorch vs TensorFlow, scikit-learn, JAX, Hugging Face                             |
| Deploy           | Deployment basics, inference engines, cloud vs local, GGUF, Ollama                                      |
| Leaderboard      | What benchmarks are, score interpretation, MMLU, HumanEval                                              |
| Timeline         | Open-source AI importance, LLaMA moment, field speed, model families                                    |

Each banner is independently dismissible (persisted in localStorage) and can be re-shown by clearing localStorage.

The **Glossary** tab provides 32 detailed entries for every use-case tag (RAG, agents, coding, etc.) plus a **Tooltip** component with 50+ inline term definitions available throughout the UI.

---

## Tech Stack

| Layer      | Technology                                                 |
| ---------- | ---------------------------------------------------------- |
| Framework  | React 19                                                   |
| Language   | TypeScript 5.9                                             |
| Build tool | Vite 8                                                     |
| Styling    | Tailwind CSS v4                                            |
| AI Advisor | Anthropic SDK (Claude) / HuggingFace Router API (Qwen 2.5) |
| Testing    | Vitest + v8 coverage                                       |
| Linting    | ESLint 9                                                   |
| Live data  | HuggingFace Hub API + Ollama API                           |

---

## Project Structure

```
src/
├── App.tsx                    — shell, 10-tab nav, state owner
├── types.ts                   — Model, HardwareProfile, CompatibleModel, Grade
├── data/
│   └── models.json            — static model database (60+ models)
├── lib/
│   ├── compatibility.ts       — scoring engine, getAllModels, getCompatibleModels
│   ├── hardware-detect.ts     — WebGL + WebGPU detection, GPU/CPU lists
│   ├── advisor.ts             — Claude streaming advisor
│   ├── live-models.ts         — HuggingFace + Ollama live feed
│   ├── hf-api.ts              — HuggingFace Hub metadata fetcher
│   ├── hf-model-import.ts     — custom model import by URL
│   ├── calibration.ts         — user speed calibration
│   └── export.ts              — CSV/JSON export
├── assets/
│   ├── logo-2i.svg            — 2i brand logo
│   └── hero.png               — hero image
└── components/
    ├── HardwareForm.tsx        — GPU/CPU/RAM picker, auto-detect
    ├── ModelCard.tsx            — card with grade, score, benchmarks, cost calc
    ├── SkeletonModelCard.tsx    — loading placeholder
    ├── TierList.tsx             — tier-grouped list
    ├── CompareView.tsx          — side-by-side hardware comparison
    ├── AdvisorChat.tsx          — Claude-powered chat
    ├── AlgoAdvisorChat.tsx      — algorithm advisor chat
    ├── AlgorithmSelector.tsx    — algorithm questionnaire + results
    ├── AlgorithmFlowchart.tsx   — interactive SVG decision tree
    ├── FrameworkPicker.tsx      — framework questionnaire + results
    ├── FrameworkFlowchart.tsx   — framework decision flowchart
    ├── DeploymentGuide.tsx      — deployment stack picker
    ├── DeploymentFlowchart.tsx  — deployment decision flowchart
    ├── ModelTimeline.tsx        — LLM history timeline
    ├── Leaderboard.tsx          — benchmark leaderboard table
    ├── BenchmarkCalibrator.tsx  — user speed calibration
    ├── AddModelForm.tsx         — custom model import
    ├── GuidedDiscovery.tsx      — guided ML stack questionnaire
    ├── Glossary.tsx             — searchable tag/concept glossary (32 entries)
    ├── LearnBanner.tsx          — educational concept cards (9 topic sets)
    ├── Tooltip.tsx              — inline term tooltip (50+ definitions)
    ├── OnboardingTour.tsx       — first-visit walkthrough
    └── ErrorBoundary.tsx        — error boundary with retry
```

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
# Required for AI Advisor chat with Claude (optional — falls back to HuggingFace)
VITE_ANTHROPIC_API_KEY=sk-ant-...

# Recommended — HuggingFace token for higher API rate limits on live model feed
VITE_HF_TOKEN=hf_...
```

| Variable                 | Required    | Description                                                   |
| ------------------------ | ----------- | ------------------------------------------------------------- |
| `VITE_ANTHROPIC_API_KEY` | Optional    | Anthropic API key for Claude-powered advisor chat             |
| `VITE_HF_TOKEN`          | Recommended | HuggingFace token for live model feed and AI advisor fallback |

Without any API keys, the app works fully — only the AI Advisor chat is disabled.

---

## Testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run coverage      # With coverage report
```

Tests cover the scoring engine (`computeScore`, `scoreToGrade`, `estimateToksPerSec`), model compatibility logic (`getCompatibleModels`, `getAllModels`, `getVariantScores`), and export utilities.

---

## Deployment

The app is a static SPA. Build and deploy `dist/` to any static host.

### Vercel

```bash
vercel
```

Configuration in `vercel.json` (SPA rewrites + build config).

### Netlify

Push to a connected repo — `public/_redirects` handles SPA routing automatically.

### GitHub Actions CI

`.github/workflows/ci.yml` runs lint → type-check → tests on every push to `main`/`Realese` and on all PRs.

---

## Brand

The app uses the **2i** brand identity:

| Token          | Hex       | Usage            |
| -------------- | --------- | ---------------- |
| `brand-50`     | `#F7F9F9` | Light background |
| `brand-100`    | `#DBE6F9` | Light blue       |
| `brand-200`    | `#3571DD` | Medium blue      |
| `brand-300`    | `#1F61D9` | Primary blue     |
| `brand-400`    | `#004AD3` | Dark blue        |
| `brand-500`    | `#283583` | Darkest blue     |
| `brand-accent` | `#54D499` | Green accent     |

---

## License

MIT — see [LICENSE](LICENSE) for details.
