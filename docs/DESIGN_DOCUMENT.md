# AI Evaluator - Design Document

**Version:** 1.0  
**Last Updated:** April 2026  
**Author:** Luis Nieto Hueso  
**Status:** Production-Ready

---

## Executive Summary

**AI Evaluator** is an interactive web application that helps developers, data scientists, and technical decision-makers determine which AI/ML models (both traditional and large language models) can run on their specific hardware, with instant compatibility grades, performance estimates, and deployment guidance.

The platform addresses a critical gap in the ML landscape: **the inability to quickly match hardware capabilities to model requirements**. Teams waste weeks testing models that won't run on their infrastructure, or deploy suboptimal solutions due to incomplete information.

---

## Table of Contents

1. [Overview](#overview)
2. [Core Features](#core-features)
3. [Architecture](#architecture)
4. [Technology Stack](#technology-stack)
5. [Key Modules](#key-modules)
6. [Data Flow](#data-flow)
7. [Limitations](#limitations)
8. [Future Enhancements](#future-enhancements)
9. [Performance Considerations](#performance-considerations)
10. [Security & Privacy](#security--privacy)

---

## Overview

### Problem Statement

**The Challenge:**

- 50+ open-source LLMs released annually with inconsistent documentation
- Hardware requirements buried in READMEs with conflicting specs
- No standardized way to compare models across different setups
- Teams spend days/weeks testing—only to find models don't fit their GPUs
- Deployment costs spike due to wasted engineering time on incompatibility issues

**The Market Gap:**

- Hardware vendors (NVIDIA, Apple, AMD) publish specs but not ML compatibility
- Model publishers (Hugging Face, Ollama) list requirements but not performance estimates
- No tool connects the two: _"Given my hardware, what models run?"_

### Solution

AI Evaluator bridges this gap with:

- **Instant Hardware-to-Model Matching** (< 2 seconds)
- **Letter Grade System** (S–F) for non-technical stakeholders
- **Performance Predictions** (tokens/sec, latency)
- **AI-Powered Recommendations** via Claude API
- **Guided Discovery Flows** for ML algorithm, framework, and deployment selection
- **Live Model Feed** synced with Hugging Face Hub + Ollama

---

## Core Features

### 1. **Hardware Compatibility Engine** ⚙️

**What it does:**

- Users input RAM, GPU model, CPU, and VRAM
- System instantly calculates which models fit and how well they perform
- Assigns letter grades (S = excellent, F = won't fit)

**Key Metrics:**

- **Memory utilization** — % of available VRAM/RAM used
- **Tokens per second** — inference speed estimate
- **Grade** — composite score S–F based on performance tier
- **Fit status** — boolean (model fits or doesn't)

**Algorithm:**

```
1. For each model variant:
   - Calculate memory footprint (params × quantization bits)
   - Estimate KV cache size from context length
   - Determine if it fits in available VRAM/RAM
   - Estimate throughput using bandwidth × token width
   - Score performance tier (S if >50 tok/s, A if >30, etc.)

2. Filter to compatible models (fits=true)
3. Rank by score, grade, and speed
```

### 2. **AI Use-Case Advisor** 💬

**What it does:**

- Claude-powered chat that understands user's specific ML task
- Recommends models tailored to their requirements
- Provides deployment guidance and cost estimates

**Example:**

- User: _"I need a model for code review and summarization on MacBook M3 36GB"_
- AI: _"Qwen2.5 Coder 14B (S-tier, 35 tok/s) — excels at code + handles 32K context for docs. Deploy via Ollama in 10 minutes."_

**Implementation:**

- Uses Anthropic Claude API (or Hugging Face as fallback)
- Receives hardware profile + compatible models as context
- Returns structured recommendations with reasoning

### 3. **Model Leaderboard & Tier List** 🏆

**Leaderboard Tab:**

- Sortable table of 50+ models with benchmarks
- Columns: MMLU%, HumanEval%, MT-Bench score, params, context length
- Link to Hugging Face for downloads

**Tier List Tab:**

- Visual S-tier to F-tier ranking
- Groups models by performance grade on user's hardware
- Drag-to-compare functionality

### 4. **Side-by-Side Model Comparison** ⚖️

**What it does:**

- Select any 2 models
- View specs, benchmarks, hardware requirements, use cases, costs side-by-side
- Color-coded differences highlight strengths/weaknesses

**Comparison Metrics:**

- Parameters, quantization variants
- Context length, inference speed
- Benchmark scores (MMLU, HumanEval, MT-Bench)
- VRAM/RAM requirements, cost per 1M tokens
- Use-case tags, license type

### 5. **Guided Discovery Flow** 🧭 (NEW)

**3-Step Wizard:**

**Step 1: Algorithm Selection**

- User clicks algorithm grid (K-Means, Random Forest, Logistic Regression, etc.)
- See pros/cons/use cases instantly
- Filtered list of 37 classical ML algorithms

**Step 2: Framework Recommendation**

- System auto-filters frameworks that support chosen algorithm
- Show PyTorch, TensorFlow, scikit-learn, JAX, etc.
- Rank by learn curve, community size, and task fit

**Step 3: Personalized Summary**

- Gradient cards: Algorithm | Framework | Next Steps
- Installation snippet (e.g., `pip install pytorch`)
- Link to official documentation
- 4-step getting-started guide

**Use Case:**

- Student: _"I'm doing classification on tabular data"_
  - Flow recommends: K-Means → scikit-learn → Deploy guide
- Enterprise: _"NLP with production requirements"_
  - Flow recommends: Transformer → PyTorch/TensorFlow → Deployment stack guide

### 6. **Algorithm Picker** 🔀

**Interactive Flowchart:**

- Decision tree based on scikit-learn cheat sheet
- Questions: data size, prediction type (category/quantity), features
- Clickable nodes → navigate and backtrack
- **Highlights:** Recommended algorithm in teal, visited path in purple

**Output:**

- Algorithm name + use cases
- Pros/cons, complexity analysis
- scikit-learn code snippet
- Link to full documentation

### 7. **Framework Picker** 📦

**Questionnaire:**

- Task type (tabular, NLP, CV, generative, audio, RL, scientific)
- Goal (production, research, learning)
- Team size (solo, small, large)
- Target deployment (CPU, GPU, edge, cloud)

**Scoring Algorithm:**

```
Score =
  30 × (task match) +
  25 × (goal fit) +
  25 × (team size fit) +
  20 × (deployment target fit)
```

**Output:**

- Ranked frameworks (top 5 recommended)
- Learn curve, ecosystem, pros/cons
- Cost/effort scores

### 8. **Deployment Guide** 🚀

**Deployment Targets:**

- Local (single machine)
- Docker container
- Kubernetes cluster
- Cloud (AWS, GCP, Azure)
- Edge/mobile

**For Each Target:**

- Recommended inference stack (Ollama, vLLM, TGI, TensorRT-LLM, CoreML)
- Installation commands
- Config flags for your hardware
- Cost breakdown
- Expected latency/throughput

**Example:**

```
Target: RTX 4090 + 96GB RAM + FastAPI
Recommendation: vLLM + FastAPI
Install:
  pip install vllm fastapi
Deploy:
  python -m vllm.entrypoints.api_server \
    --model meta-llama/Llama-2-70b-hf \
    --tensor-parallel-size 2 \
    --gpu-memory-utilization 0.9
Cost: $5-10/hour on AWS
Expected: 200-300 tok/s
```

### 9. **Live Model Feed** 📡

**Auto-Sync with Registries:**

- Hugging Face Hub (updated hourly)
- Ollama library (updated hourly)
- Custom model URLs (user-provided)

**Caching:**

- 24-hour cache in localStorage
- Shows "last updated: 2 hours ago" badge
- Manual refresh button + countdown

**Detection:**

- New models auto-appear without code changes
- Release date metadata preserved
- Automatic VRAM/RAM estimation for new models

### 10. **Benchmark Calibrator** 📊

**Purpose:**

- Run a real benchmark on your hardware
- Calibrate speed predictions to match actual performance

**How it works:**

1. User clicks "Calibrate" button
2. App downloads a small model (e.g., Phi-2 2B)
3. Runs 100 inference passes, measures tok/s
4. Calculates calibration factor (predicted ÷ actual)
5. Applies factor to all speed estimates
6. Stores in localStorage

**Benefit:**

- M1 Macs, old GPUs, low-power CPUs have different characteristics
- Calibration makes predictions **personal to your hardware**

### 11. **Skeleton Loaders** ⏳

**Purpose:**

- Show animated placeholders while live models load from APIs
- Prevent blank white space during fetch

**Implementation:**

- 6 skeleton cards with shimmer animation
- Matches real `ModelCard` layout structure
- Smooth fade-in transition when real data arrives

---

## Architecture

### High-Level Design

```
┌─────────────────────────────────────────────────────────────┐
│                     React 19 + Vite                          │
│                      (Frontend SPA)                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────┐ │
│  │  Hardware Form   │  │  Model Cards     │  │  AI Advisor│ │
│  │  (Input)         │  │  (Results Grid)  │  │  Chat      │ │
│  └────────┬─────────┘  └────────┬─────────┘  └────┬───────┘ │
│           │                      │                  │         │
│           └──────────────────────┼──────────────────┘         │
│                                  │                            │
│                          ┌───────▼────────┐                  │
│                          │  State (React) │                  │
│                          │  - hardware    │                  │
│                          │  - compatible  │                  │
│                          │  - filters     │                  │
│                          └───────┬────────┘                  │
│                                  │                            │
│  ┌──────────────────────────────┼──────────────────────┐    │
│  │                              │                      │    │
│  ▼                              ▼                      ▼    │
│┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  Compatibility    │  │  Live Models     │  │  Claude API  │ │
│  Library          │  │  (HF + Ollama)   │  │  (if enabled)│ │
│  (Scoring Logic)  │  │  (24h cache)     │  │              │ │
│└──────┬───────────┘  └──────┬───────────┘  └──────┬───────┘ │
│       │                     │                     │         │
│       ▼                     ▼                     ▼         │
│    ┌─────────────────────────────────────────────────┐    │
│    │        localStorage + Session State            │    │
│    │  - Cached models (24h)                         │    │
│    │  - User calibration factor                     │    │
│    │  - Theme preference (light/dark)               │    │
│    │  - Hardware history                            │    │
│    └─────────────────────────────────────────────────┘    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### File Structure

```
src/
├── App.tsx                          # Main app container + tab routing
├── types.ts                         # TypeScript interfaces (Model, HardwareProfile, etc.)
├── index.css                        # Tailwind entry point
│
├── components/
│   ├── HardwareForm.tsx             # Hardware input (RAM, GPU, CPU picker)
│   ├── ModelCard.tsx                # Individual model result card
│   ├── SkeletonModelCard.tsx        # Skeleton loader for model cards
│   ├── AdvisorChat.tsx              # Claude/HF-powered AI advisor chat
│   ├── AlgoAdvisorChat.tsx          # Algorithm-specific advisor
│   ├── TierList.tsx                 # Tier list view (S/A/B/C/D/F)
│   ├── CompareView.tsx              # Side-by-side model comparison
│   ├── Leaderboard.tsx              # Benchmark leaderboard table
│   ├── AlgorithmSelector.tsx        # Algorithm picker (questionnaire)
│   ├── AlgorithmFlowchart.tsx       # Algorithm flowchart (interactive tree)
│   ├── FrameworkPicker.tsx          # Framework recommendation UI
│   ├── FrameworkFlowchart.tsx       # Framework selection flowchart
│   ├── DeploymentGuide.tsx          # Deployment target guidance
│   ├── DeploymentFlowchart.tsx      # Deployment selection flowchart
│   ├── ModelTimeline.tsx            # Timeline view (model release history)
│   ├── AddModelForm.tsx             # Import custom models from HF URL
│   ├── BenchmarkCalibrator.tsx      # Hardware calibration tool
│   ├── OnboardingTour.tsx           # First-time user walkthrough
│   ├── GuidedDiscovery.tsx          # NEW: 3-step wizard (Algorithm → Framework → Summary)
│   ├── ErrorBoundary.tsx            # Error handling wrapper
│   └── ...
│
├── lib/
│   ├── compatibility.ts             # Core logic: grading, scoring, filtering
│   ├── hardware-detect.ts           # GPU/CPU detection + bandwidth lookup
│   ├── live-models.ts               # Hugging Face + Ollama API integration
│   ├── hf-model-import.ts           # Parse HF model cards + estimate specs
│   ├── hf-api.ts                    # Helper functions for HF API calls
│   ├── export.ts                    # CSV/JSON export utilities
│   ├── calibration.ts               # Benchmark calibration logic
│   └── ...
│
├── data/
│   ├── models.json                  # 50+ hardcoded model definitions
│   ├── algorithms.json              # 37 ML algorithms with metadata
│   ├── frameworks.json              # 9 ML frameworks with scoring
│   ├── deployment-stacks.json       # Inference stacks (Ollama, vLLM, etc.)
│   └── ...
│
└── index.html                       # Vite entry point
```

---

## Technology Stack

### Frontend Framework

- **React 19.2.4** — Component-based UI with hooks
- **TypeScript 5.9** — Type-safe development
- **Vite 8** — Lightning-fast dev server & builds (HMR, automatic imports)

### Styling

- **Tailwind CSS 4.2** — Utility-first CSS framework
- **Dark mode** — OS preference detection + manual toggle
- **CSS-in-JS** — Inline animations, gradients, shadows

### State Management

- **React Hooks** — useState, useMemo, useEffect, useCallback
- **localStorage** — Persist user preferences, cache, calibration
- **URL params** — Shareable hardware configs

### API Integrations

- **Anthropic Claude API** (optional) — AI advisor
- **Hugging Face Hub API** — Live model feed + model card parsing
- **Ollama Registry API** — Alternative model source

### Build & Testing

- **TypeScript Compiler** — Type checking (tsc -b)
- **ESLint** — Code linting
- **Vitest** — Unit testing framework
- **GitHub Actions** (implied) — CI/CD

### Data

- **JSON data files** — Models, algorithms, frameworks (static, no DB)
- **localStorage** — Client-side caching (24h for live models)

### Deployment

- **Static SPA** — dist/ folder only
- **Vercel** — Zero-config (vercel.json included)
- **Netlify** — SPA routing (\_redirects)
- **GitHub Pages** — Build + gh-pages branch

---

## Key Modules

### 1. **Compatibility Scoring** (`lib/compatibility.ts`)

```typescript
function getCompatibleModels(
  hardware: HardwareProfile,
  models: Model[],
): CompatibleModel[] {
  return models.map((model) => {
    const bestVariant = selectBestVariant(model, hardware);
    const fits = checkMemoryFit(bestVariant, hardware);
    const tokensPerSec = estimateThroughput(bestVariant, hardware);
    const grade = computeGrade(tokensPerSec, fits);
    const score = computeScore(grade, tokensPerSec, bestVariant);

    return { model, bestVariant, fits, tokensPerSec, grade, score };
  });
}
```

**Grade Logic:**

- S: fits + tok/s > 50
- A: fits + tok/s > 30
- B: fits + tok/s > 15
- C: fits + tok/s > 5
- D: fits + tok/s > 0
- F: doesn't fit

### 2. **Hardware Detection** (`lib/hardware-detect.ts`)

**GPU Database:**

- 30+ NVIDIA, AMD, Apple Silicon, Intel GPUs
- Specs: VRAM, memory bandwidth (GB/s), compute capability
- Bandwidth crucial for inference speed calculation

**CPU Detection:**

- Automatic detection on page load (via feature detection)
- User override via dropdown selector
- Fallback to generic CPU specs if detection fails

**Memory Bandwidth:**

```
Throughput = (tokens × bits_per_token) / bandwidth_GB_per_sec
Example: 1 token × 16 bits / 432 GB/s (RTX 4090) = 0.037 μs per token
```

### 3. **Live Model Integration** (`lib/live-models.ts`)

```typescript
async function fetchLiveModels(): Promise<Model[]> {
  // 1. Fetch trending models from HF Hub
  const hfModels = await fetch(
    "https://huggingface.co/api/models?filter=text-generation&sort=downloads",
  );

  // 2. Fetch Ollama library
  const ollamaModels = await fetch("https://registry.ollama.ai/v2/_catalog");

  // 3. Parse & deduplicate
  // 4. Estimate VRAM/RAM requirements
  // 5. Cache in localStorage with timestamp
  // 6. Return merged list
}
```

**Cache Strategy:**

- 24-hour localStorage cache
- Check age on page load
- Manual refresh button overrides cache
- Shows "last updated: Xh ago" badge

### 4. **AI Advisor** (`components/AdvisorChat.tsx`)

```typescript
async function sendMessage(userMsg: string) {
  const context = {
    hardware: hardware,
    compatibleModels: compatible.map((c) => c.model.name),
    userHistory: messages.slice(-5), // Context window
  };

  const response = await anthropic.messages.create({
    model: "claude-opus-4-6",
    system: ADVISOR_PROMPT,
    messages: [...messages, { role: "user", content: userMsg }],
  });

  return response.content[0].text;
}
```

**Fallback:**

- If no Anthropic key: use Hugging Face inference API
- If both fail: show error, suggest manual model browsing

### 5. **Guided Discovery** (`components/GuidedDiscovery.tsx`)

**3-Step State Machine:**

```typescript
type Step = "algorithm" | "framework" | "summary";

const [step, setStep] = useState<Step>("algorithm");
const [selectedAlgorithmId, setSelectedAlgorithmId] = useState<string | null>(
  null,
);
const [selectedFrameworkId, setSelectedFrameworkId] = useState<string | null>(
  null,
);

// Step 1: Click algorithm card → set selectedAlgorithmId
// Step 2: Frameworks auto-filter by algorithm.tasks
//        User clicks framework → set selectedFrameworkId
// Step 3: Show summary cards (Algorithm | Framework | Next Steps)
```

**Framework Filtering:**

```typescript
const compatibleFrameworks = useMemo(() => {
  return FRAMEWORKS.filter((fw) =>
    selectedAlgorithm.tasks.some((task) => fw.tasks.includes(task)),
  ).sort((a, b) => {
    // Frameworks with more matching tasks rank higher
    const aMatches = a.tasks.filter((t) =>
      selectedAlgorithm.tasks.includes(t),
    ).length;
    const bMatches = b.tasks.filter((t) =>
      selectedAlgorithm.tasks.includes(t),
    ).length;
    return bMatches - aMatches;
  });
}, [selectedAlgorithm]);
```

---

## Data Flow

### User Journey: Hardware → Results

```
1. User enters hardware:
   ┌──────────────────────┐
   │ RAM: 16 GB           │
   │ GPU: RTX 4070        │
   │ VRAM: 12 GB          │
   └──────────┬───────────┘
              │
              ▼
2. App calculates compatibility:
   ┌──────────────────────────────┐
   │ For each of 50+ models:      │
   │ - Check VRAM fit             │
   │ - Estimate speed             │
   │ - Assign grade               │
   │ - Calculate score            │
   └──────────┬───────────────────┘
              │
              ▼
3. Results displayed:
   ┌──────────────────────────────┐
   │ Llama 3.1 8B   [S-tier]      │
   │ Mistral 7B     [A-tier]      │
   │ Qwen2 14B      [B-tier]      │
   │ ...                          │
   └──────────┬───────────────────┘
              │
              ▼
4. User can:
   - Filter by grade/use-case
   - Sort by speed/params
   - Compare 2 models
   - Export results
   - Share via URL
   - Ask AI advisor
```

### User Journey: Guided Discovery

```
Step 1: Algorithm Selection
┌────────────────────────────────────┐
│ Choose algorithm from grid         │
│ (K-Means, Random Forest, etc.)     │
│ See pros/cons instantly            │
└────────────┬─────────────────────┘
             │
             ▼
Step 2: Framework Recommendation
┌────────────────────────────────────┐
│ System filters frameworks by:      │
│ - Algorithm's task type            │
│ - User's goal (prod/research)      │
│ - Team size, target deployment     │
│ User clicks framework              │
└────────────┬─────────────────────┘
             │
             ▼
Step 3: Summary & Action
┌────────────────────────────────────┐
│ 3 gradient cards:                  │
│ - Algorithm details                │
│ - Framework details + learn curve  │
│ - 4-step getting started guide     │
│ - "pip install" snippet            │
│ Links to docs                      │
└────────────────────────────────────┘
```

### API Call Sequence (Live Models)

```
App mounts
  │
  ├─ Check localStorage for cached models
  │  ├─ If cache is fresh (< 24h): use it ✓
  │  └─ If cache is stale: fetch new
  │
  └─ If no cache:
     │
     ├─ Fetch from HF Hub (/api/models?filter=text-generation)
     ├─ Fetch from Ollama (/v2/_catalog)
     ├─ Merge & deduplicate
     ├─ Estimate VRAM/RAM for new models
     ├─ Cache in localStorage + timestamp
     └─ Update UI with skeleton → real cards
```

---

## Limitations

### 1. **Hardware Scope**

- ✗ Only covers 30+ popular GPUs/CPUs
- ✓ User can manually input VRAM + bandwidth for unsupported hardware
- ✗ No integration with enterprise hardware (TPU, Cerebras, etc.)

### 2. **Model Coverage**

- ✓ 50+ models auto-synced from HF + Ollama
- ✗ Proprietary models (GPT-4, Claude API) not included
- ✗ Small/custom fine-tuned models require manual URL import
- ⚠️ Model data depends on HF/Ollama metadata accuracy

### 3. **Performance Estimation**

- ✗ **Peak performance only** — doesn't account for batching, quantization overhead, or system load
- ✗ **Assumes single-GPU inference** — no multi-GPU/tensor parallelism estimates
- ✗ **Benchmark scores** may be outdated (MMLU benchmarks change)
- ⚠️ **Calibrator assumes stable hardware** — won't adapt if you swap GPUs or change RAM

### 4. **Inference Stack Recommendations**

- ✗ No real-time testing — recommendations based on static data
- ✗ Doesn't detect if Ollama/vLLM are already installed
- ✗ No cost estimation for cloud providers (AWS, GCP prices change)
- ⚠️ Assumes standard deployment patterns — doesn't handle complex setups

### 5. **Framework Selection**

- ✗ Only covers 9 mainstream frameworks (no Jax, Flax, Hugging Face Transformers as separate entities)
- ✗ Scoring algorithm is heuristic-based, not machine-learned
- ⚠️ Framework recommendations don't account for existing codebase/team expertise

### 6. **Algorithm Picker**

- ✗ Limited to 37 classical ML algorithms — no deep learning architecture selection
- ✗ Flowchart based on scikit-learn, not exhaustive
- ⚠️ Doesn't recommend ensemble strategies

### 7. **Data Sources & Updates**

- ✗ **Static data files** (models.json, algorithms.json) — require manual updates
- ⚠️ **24-hour cache** — users might miss latest models released in past hours
- ✗ **No real-time benchmark updates** — MMLU/HumanEval scores are frozen at build time

### 8. **Security & Privacy**

- ✓ **Client-side only** — no server backend, no data logging
- ⚠️ **API keys exposed** — VITE_ANTHROPIC_API_KEY in env, visible in client-side requests
- ⚠️ **Hardware info in URL** — shareable but potentially sensitive (inferring company setup)
- ✗ **No auth** — anyone can use; no usage limits

### 9. **Mobile Experience**

- ✗ Model cards cramped on mobile
- ✗ Multi-column grids collapse poorly on narrow screens
- ✗ Flowchart (algorithm picker) doesn't zoom/pan on mobile

### 10. **Browser Compatibility**

- ✗ Requires ES2020+ (modern browsers only)
- ✗ localStorage required (disabled in private browsing on Safari)
- ✗ No IE11 support

---

## Future Enhancements

### Phase 1: User Experience (Q2 2026)

**1. PDF Export**

- Generate professional report with hardware specs, recommended models, deployment guide
- Include gradient summary cards, benchmarks, cost breakdown
- Use html2pdf or similar library

**2. Mobile Optimization**

- Responsive grid layouts (1 column on mobile, 2-3 on desktop)
- Touch-friendly filter pills
- Horizontal scroll for model comparison tables

**3. Save & Bookmark Configurations**

- Persistent "saved searches" in sidebar
- "Save this hardware setup" button
- Share a configuration link: `/config/rtx4070-32gb-ubuntu`

**4. "I'm Torn Between X and Y" AI Prompt**

- Advisor pop-up when comparing 2 models
- AI explains trade-offs + recommends one
- Example: _"Both fit your hardware. Qwen has better code skills, Llama has larger community."_

### Phase 2: Data & Accuracy (Q3 2026)

**1. Real Benchmark Integration**

- Auto-sync latest MMLU, HumanEval, MT-Bench scores from leaderboards
- Show score confidence (e.g., "MMLU: 72% ± 2%")
- Update monthly from papers/HF leaderboard API

**2. Cost Calculator**

- Real-time cloud pricing (AWS, GCP, Azure, Runpod)
- Breakdown: compute + storage + egress
- Compare local vs. cloud ROI

**3. Crowd-Sourced Calibration Data**

- Users submit actual benchmark results from their hardware
- Aggregate to refine speed estimates
- Trust score: "Based on 50+ real benchmarks on RTX 4090"

**4. Better Hardware Detection**

- Server-side detection (user visits /api/detect-hardware)
- Returns JSON with GPU, CPU, RAM, bandwidth
- Privacy: no data stored on server

### Phase 3: Intelligence (Q4 2026)

**1. ML-Based Framework Selection**

- Train small model on company/team metadata
- Learn which frameworks succeed for different team sizes/goals
- Personalization: "Teams like yours usually pick PyTorch"

**2. Deployment Intelligence**

- Auto-generate Dockerfile + docker-compose.yml
- Kubernetes YAML with resource requests
- Terraform configs for cloud deployment

**3. Fine-Tuning Advisor**

- "Best practices for fine-tuning [Model] on your hardware"
- Data format recommendations, batch size suggestions
- Estimated time to fine-tune

**4. Multi-Model Ensemble Guidance**

- "Can I run a 7B + 3B ensemble on my RTX 4070?"
- Rank ensemble combinations by accuracy vs. latency
- Deployment patterns (round-robin, adaptive routing)

### Phase 4: Scale & Integration (2027+)

**1. REST API**

- /api/compatibility (POST hardware, GET compatible models)
- /api/models (search, filter)
- /api/recommend (GET recommendation for use case)
- Rate-limited, API key auth

**2. Browser Extension**

- Right-click on HF model card → "Check compatibility on my hardware"
- Auto-fill hardware from saved profile
- Show grade badge inline

**3. VS Code Extension**

- Sidebar: Model browser + hardware manager
- Command: "Add model to project"
- Auto-insert download commands

**4. Slack Bot**

- `/eval-model llama-3.1-70b` → shows compatibility for team hardware
- `/add-hardware rtx4090` → saves team profile
- Shares results in channel

**5. Integration with Model Zoos**

- Official HF Hub integration (model card badge)
- Ollama native comparison
- ModelScope, SenseTime partnerships

**6. On-Premise SaaS Version**

- Docker image for internal deployment
- No external API calls (self-hosted models, HF proxies)
- LDAP/SSO auth, audit logs
- For enterprises with security requirements

### Phase 5: Advanced Features (2027+)

**1. Video Tutorials**

- "Deploying Llama 3 on RTX 4070" series
- Step-by-step: download → quantize → optimize → serve
- Interactive examples

**2. Latency Prediction**

- End-to-end latency, not just tokens/sec
- Breakdown: model loading, tokenization, inference, output
- Account for batch size, context length

**3. Precision Converter**

- "Convert FP32 to FP16/BF16?" → estimate memory savings & speedup
- "Quantize to INT8/INT4?" → trade-off matrix
- Interactive sliders

**4. Energy & Carbon Tracking**

- Estimate power draw: W/GPU × hours
- CO2 equivalent
- Compare local vs. cloud emissions

**5. A/B Test Builder**

- "Compare Llama vs. Mistral on production queries"
- Route % of traffic to each model
- Show quality metrics side-by-side

---

## Performance Considerations

### Frontend Optimization

**Bundle Size:**

- Current: ~580 KB gzipped (Vite optimized)
- Bottleneck: Anthropic SDK (~100 KB), datasets (models.json, algorithms.json)
- Future: Dynamic imports for tabs (algorithm picker only on /guide)

**Rendering:**

- All list grids use React.memo + useMemo to prevent re-renders
- Filter/sort operations cached with useMemo (dependency arrays tuned)
- No virtual scrolling (data < 100 items, acceptable)

**API Calls:**

- HF Hub: parallel fetch (model search + live feed)
- Ollama: timeout after 5 seconds (fallback to cache)
- Anthropic: streamed responses (show tokens as they arrive)

**localStorage Limits:**

- 5–10 MB available (most browsers)
- Current usage: ~2 MB (50 models × ~40 KB each)
- Safe margin for future growth

### Network

**First Load (Cold Cache):**

- HTML: 1 KB
- CSS: 10 KB
- JS: 150 KB
- Live models fetch: 500 KB (parallel, cached after)
- **Total: ~660 KB, <2 seconds on 4G**

**Subsequent Loads:**

- localStorage hit: load models instantly (< 100 ms)
- Static assets from browser cache
- **Total: <500 ms**

**Live Model Updates:**

- Runs in background while user browses other tabs
- Non-blocking UI updates (setState merges asynchronously)
- Grace period if network fails (show cached models)

### Computing (Server-Side, When Added)

**Backend Scaling Considerations (Phase 4):**

- Compatibility scoring: O(models × variants) = O(50 × 3) = fast
- Model search: O(n log n) with full-text index
- Recommendation inference: cached, not real-time ML
- Can run on Lambda/Cloud Functions (stateless)

---

## Security & Privacy

### Current (Client-Side Only)

**✓ No server → no data breaches**

- All computation happens in browser
- Models never uploaded to server
- User's hardware specs stored locally only

**⚠️ API Keys Exposed**

- VITE_ANTHROPIC_API_KEY visible in client requests
- Mitigation: use backend proxy (see Phase 4)
- Current: rotate key frequently, monitor usage

**⚠️ Hardware in URL**

- Hardware config is shareable: `/index.html?ram=32&gpu=rtx4070`
- Privacy: could infer company/team setup
- Mitigation: warn users before sharing

### Future (When Backend Added)

**Backend Proxy Pattern:**

```
Client: /api/recommend?usecase=...
  ↓
Backend (auth required):
  - Validate request
  - Call Anthropic/HF APIs (keep keys server-side)
  - Cache responses
  - Log anonymized queries (for analytics)
  ↓
Client: receives response
```

**Auth & Limits:**

- OAuth (GitHub, Google) for API tier distinction
- Rate limiting: 100 req/hour free, unlimited for paid
- Audit log: who queried what, no model contents logged

**Data Retention:**

- No user data stored (stateless)
- Query logs: anonymized, aggregated for analytics only
- Deleted after 30 days

---

## Monitoring & Metrics

### Current (Client-Side)

**Console Errors:**

- Error Boundary catches component crashes
- localStorage quota errors
- Network timeout errors

**User Behavior** (via Google Analytics suggested):

- Tab clicks (which features used)
- Export clicks (CSV/JSON downloads)
- AI advisor messages (content not logged, count only)
- Model filter/sort operations

### Future

**Backend Metrics:**

- API response times (p50, p95, p99)
- Error rates (HF API failures, Anthropic timeouts)
- Cache hit rates (localStorage vs. fresh fetch)
- Most searched hardware configs
- Popular algorithm/framework combinations

---

## Deployment

### Current Setup

**Build:**

```bash
npm run build
# Output: dist/ folder (static files only)
```

**Hosting Options:**

1. **Vercel** (recommended)

   ```bash
   npm i -g vercel
   vercel deploy
   # Auto-detects Vite, deploys dist/
   ```

2. **Netlify**

   ```bash
   netlify deploy --prod --dir dist/
   ```

3. **GitHub Pages**

   ```bash
   git subtree push --prefix dist origin gh-pages
   ```

4. **Self-Hosted (nginx)**
   ```nginx
   server {
     listen 80;
     root /var/www/ai-evaluator/dist;
     try_files $uri $uri/ /index.html;  # SPA routing
   }
   ```

### Environment Variables

```bash
# .env.local (for dev)
VITE_ANTHROPIC_API_KEY=sk-ant-...
VITE_HF_TOKEN=hf_...

# Vercel dashboard / netlify.toml
```

### CI/CD

**Suggested GitHub Actions:**

```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install && npm run build && npm run lint && npm run test
      - uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

---

## Glossary

| Term             | Definition                                                     |
| ---------------- | -------------------------------------------------------------- |
| **VRAM**         | Video RAM on GPU (used for model weights + KV cache)           |
| **MMLU**         | Massive Multitask Language Understanding — LLM benchmark       |
| **HumanEval**    | Code generation benchmark for LLMs                             |
| **MT-Bench**     | Multi-turn conversation quality benchmark                      |
| **KV Cache**     | Key-value cache size for attention (grows with context length) |
| **tok/s**        | Tokens per second (inference speed)                            |
| **Quantization** | Reducing precision (FP32→FP16→INT8) to fit smaller VRAM        |
| **Bandwidth**    | Memory throughput (GB/sec), bottleneck for LLM inference       |
| **Q4_K_M**       | GGUF quantization variant (4-bit, keeps important weights)     |

---

## References & Resources

### Documentation

- [React 19 Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Vite](https://vitejs.dev)
- [TypeScript](https://www.typescriptlang.org)

### ML Resources

- [Hugging Face Hub](https://huggingface.co)
- [Ollama](https://ollama.ai)
- [Anthropic Claude Docs](https://docs.anthropic.com)
- [NVIDIA GPU Specs](https://www.nvidia.com/en-us/geforce/graphics-cards/)

### Benchmarks

- [Open LLM Leaderboard](https://huggingface.co/spaces/HuggingFaceH4/open_llm_leaderboard)
- [Big Bench](https://github.com/google/BIG-bench)
- [HELM](https://crfm.stanford.edu/helm/)

### Community

- [r/MachineLearning](https://reddit.com/r/MachineLearning)
- [Papers with Code](https://paperswithcode.com)
- [Hugging Face Forum](https://discuss.huggingface.co)

---

## Appendix: Example Scenarios

### Scenario 1: Graduate Student

> _"I have an old MacBook Pro M1 with 16 GB. Can I run an LLM?"_

**Flow:**

1. Hardware Form: "M1 MacBook, 16 GB RAM, no GPU"
2. Results: S-tier (Phi-2 2B), A-tier (Mistral 7B + quantization)
3. AI Advisor: _"Phi-2 best for learning—fast, multilingual. Download via Ollama (2 min setup)."_
4. Deployment Guide: Shows native macOS setup (CoreML, MLX)

**Outcome:** Student deploys model in 10 minutes, pays $0.

---

### Scenario 2: Startup CTO

> _"Our team is building a code review tool. We have 2× RTX 4090s. What's best?"_

**Flow:**

1. Hardware Form: "2× RTX 4090, 192 GB RAM"
2. Results: S-tier (Qwen2.5 Coder 32B, Llama 3.1 70B)
3. Guided Discovery:
   - Algorithm: **Classification + Code Understanding** → Transformer
   - Framework: **Production, large team, GPU** → PyTorch
   - Summary: Shows vLLM deployment with tensor parallelism
4. Export: PDF report with benchmarks, cost/latency estimates

**Outcome:** CTO presents to stakeholders with confidence. Deploys Qwen 32B on vLLM, gets 200 tok/s.

---

### Scenario 3: ML Engineer

> _"I want to fine-tune a 13B model on medical text. What hardware do I need?"_

**Flow:**

1. (Reverse lookup) Guides to RTX 4090 / A100 recommendation
2. Algorithm Picker: Classification + Text → shows Transformer fine-tuning
3. Framework Picker: Production, medium team, GPU → PyTorch
4. Deployment Guide: Shows fine-tuning config (LoRA, DeepSpeed)

**Outcome:** Engineer estimates cost ($1,000-2,000 on cloud), decides on single RTX 4090 locally.

---

## Conclusion

AI Evaluator democratizes AI deployment by answering one critical question: **"Does this model run on my hardware?"**

With a clean UI, instant feedback, guided discovery, and AI-powered recommendations, it reduces deployment friction from weeks to minutes.

The foundation is solid (React + Vite, live data feeds, modular components), but opportunities abound for expansion: real-time benchmarks, cloud integration, video tutorials, and a thriving API ecosystem.

---

**Document Version:** 1.0  
**Last Updated:** April 2026  
**Maintained By:** Luis Nieto Hueso  
**License:** MIT
