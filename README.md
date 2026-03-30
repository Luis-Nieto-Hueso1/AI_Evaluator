# LLM Evaluator

A comprehensive ML toolkit that helps you find which LLMs your hardware can run, pick the right algorithm, choose a framework, and plan model deployment -- all in one interactive app.

## Features

- **LLM Compatibility Checker** -- Enter your hardware (RAM, GPU, CPU) and see which models you can run locally, graded S through F by performance
- **Live Model Feed** -- Automatically fetches trending models from HuggingFace Hub + Ollama library (24h cache), so new releases appear without code changes
- **Add Custom Models** -- Paste any HuggingFace URL to import a model with auto-estimated RAM/VRAM requirements
- **Tier List** -- Visual tier list view of all models grouped by grade
- **Model Comparison** -- Side-by-side comparison of any two models
- **Benchmark Leaderboard** -- Sortable table of MMLU, HumanEval, and MT-Bench scores
- **Algorithm Picker** -- Interactive questionnaire to find the right ML algorithm (37 algorithms, 5 task types)
- **Framework Picker** -- Choose between PyTorch, TensorFlow, JAX, scikit-learn, and 6 more frameworks based on your needs
- **Deployment Guide** -- Pick your target environment and get ranked inference stack recommendations (Ollama, vLLM, TGI, TensorRT-LLM, etc.) with install commands and config flags
- **Model Timeline** -- Visual history of open-source LLM milestones, with live models auto-inserted
- **AI Advisor Chat** -- HuggingFace-powered chat for use-case recommendations
- **Benchmark Calibrator** -- Enter your real-world tok/s to calibrate speed estimates
- **Export** -- Download results as CSV or JSON
- **PWA** -- Installable as a Progressive Web App with offline support

## Tech Stack

- **React 19** + **TypeScript**
- **Vite 8** (build + dev server + HF API proxy)
- **Tailwind CSS v4**
- **Vitest** (unit tests)
- **HuggingFace Router API** (AI advisor + live model feed)

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9

### Install

```bash
git clone https://github.com/your-username/AI_Evaluator.git
cd AI_Evaluator
npm install
```

### Environment Variables

Copy the example file and fill in your tokens:

```bash
cp .env.local.example .env.local
```

| Variable                 | Required    | Description                                                                 |
| ------------------------ | ----------- | --------------------------------------------------------------------------- |
| `VITE_HF_TOKEN`          | Recommended | HuggingFace token (write permission) for the AI advisor and live model feed |
| `VITE_ANTHROPIC_API_KEY` | Optional    | Anthropic API key to use Claude instead of HuggingFace for the advisor chat |

### Development

```bash
npm run dev        # Start dev server at http://localhost:5173
npm test           # Run unit tests
npm run build      # Production build to dist/
npm run preview    # Preview production build locally
npm run lint       # ESLint check
npm run coverage   # Test coverage report
```

### Deploy

The app is a static SPA. Deploy `dist/` to any static host:

- **Vercel** -- `vercel.json` included, zero-config deploy
- **Netlify** -- `public/_redirects` included for SPA routing
- **GitHub Pages** -- build and push `dist/` to `gh-pages` branch

## Project Structure

```
src/
  components/       # React components (ModelCard, AlgorithmSelector, etc.)
  data/             # Static JSON datasets (models, algorithms, frameworks, stacks)
  lib/              # Business logic (compatibility scoring, HF API, live models, etc.)
  types.ts          # TypeScript interfaces
  App.tsx           # Main app with 8-tab layout
  index.css         # Tailwind entry point
```

## License

MIT
