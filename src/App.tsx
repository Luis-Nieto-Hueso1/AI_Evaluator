import { useState, useMemo, useEffect, useRef } from "react";
import type { HardwareProfile, CompatibleModel, Grade, Model } from "./types";
import { getCompatibleModels, getAllModels } from "./lib/compatibility";
import { GPU_LIST, GPU_BANDWIDTH } from "./lib/hardware-detect";
import { exportCsv, exportJson } from "./lib/export";
import { loadCalibration, type CalibrationData } from "./lib/calibration";
import { loadCustomModels } from "./lib/hf-model-import";
import {
  fetchLiveModels,
  getCachedLiveModels,
  refreshLiveModels,
  getLiveCacheAge,
} from "./lib/live-models";
import { HardwareForm } from "./components/HardwareForm";
import { ModelCard } from "./components/ModelCard";
import { SkeletonModelCard } from "./components/SkeletonModelCard";
import { AdvisorChat } from "./components/AdvisorChat";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { TierList } from "./components/TierList";
import { CompareView } from "./components/CompareView";
import { BenchmarkCalibrator } from "./components/BenchmarkCalibrator";
import { AlgorithmSelector } from "./components/AlgorithmSelector";
import { ModelTimeline } from "./components/ModelTimeline";
import { AddModelForm } from "./components/AddModelForm";
import { Leaderboard } from "./components/Leaderboard";
import { FrameworkPicker } from "./components/FrameworkPicker";
import { DeploymentGuide } from "./components/DeploymentGuide";
import { OnboardingTour } from "./components/OnboardingTour";
import { AlgorithmFlowchart } from "./components/AlgorithmFlowchart";
import { FrameworkFlowchart } from "./components/FrameworkFlowchart";
import { DeploymentFlowchart } from "./components/DeploymentFlowchart";
import { GuidedDiscovery } from "./components/GuidedDiscovery";
import { LearnBanner, SECTION_LEARN } from "./components/LearnBanner";
import { Glossary } from "./components/Glossary";
import logo2i from "./assets/logo-2i.svg";

const DEFAULT_HARDWARE: HardwareProfile = { ram: 16, vram: 0, hasGpu: false };
const HAS_API_KEY = Boolean(import.meta.env.VITE_ANTHROPIC_API_KEY);

type SortKey = "score" | "grade" | "speed" | "params" | "vram" | "context";
type View =
  | "results"
  | "tierlist"
  | "compare"
  | "algorithms"
  | "timeline"
  | "leaderboard"
  | "frameworks"
  | "deploy"
  | "guide"
  | "glossary";

const GRADE_ORDER: Grade[] = ["S", "A", "B", "C", "D", "F"];

const USE_CASE_INFO: Record<string, string> = {
  agents:
    "Autonomous tool-using workflows — plans steps, calls APIs, and iterates toward a goal",
  analysis:
    "Structured data interpretation — extracts insights, spots patterns, and summarises findings",
  architecture:
    "Software architecture guidance — system design, API design, and codebase organisation",
  "chain-of-thought":
    "Step-by-step reasoning made visible — shows its work before giving an answer",
  chat: "Open-ended conversation — general Q&A, brainstorming, and everyday assistant tasks",
  classification:
    "Assigns labels or categories to text — sentiment, intent, topic, spam detection, etc.",
  "code-completion":
    "Inline code suggestions — fills in the next tokens as you type in an editor",
  "code-review":
    "Reviews pull requests and diffs — flags bugs, style issues, and security concerns",
  coding:
    "General-purpose code generation — writes functions, scripts, and full programs from prompts",
  "creative-writing":
    "Fiction, poetry, marketing copy — generates text with style, tone, and narrative flair",
  "data-extraction":
    "Pulls structured fields from unstructured text — names, dates, amounts, entities",
  debugging:
    "Diagnoses and fixes broken code — reads stack traces, suggests patches",
  "document-qa":
    "Answers questions grounded in a provided document — PDFs, reports, manuals",
  edge: "Optimised for low-resource hardware — phones, Raspberry Pi, and embedded devices",
  "function-calling":
    "Generates structured JSON tool calls — connects the model to external APIs and actions",
  "image-analysis":
    "Understands and describes images — OCR, object detection, chart reading",
  "instruction-following":
    "Precisely follows complex multi-step instructions and formatting constraints",
  math: "Solves mathematical problems — arithmetic, algebra, calculus, and competition-level proofs",
  multilingual:
    "Strong performance across many languages — translation-ready and cross-lingual transfer",
  multimodal:
    "Accepts multiple input types — text, images, audio, or video in a single prompt",
  "on-device":
    "Runs entirely on-device with no internet — privacy-first, offline-capable deployments",
  rag: "Retrieval-Augmented Generation — answers questions using retrieved context from a knowledge base",
  reasoning:
    "Complex multi-step logical thinking — planning, deduction, and problem decomposition",
  research:
    "Deep open-ended investigation — literature review, fact synthesis, and report generation",
  science:
    "Scientific reasoning and domain knowledge — biology, chemistry, physics, and more",
  sql: "Generates and explains SQL queries — schema understanding, joins, aggregations",
  summarization:
    "Condenses long text into key points — articles, meetings, documents",
  "text-generation":
    "General text output — drafts, expansions, and completions without a specific task",
  translation:
    "Translates text between languages with nuance, context, and terminology awareness",
  vision:
    "Processes visual inputs — images and screenshots as part of the conversation",
  writing:
    "Produces clear, well-structured prose — emails, essays, documentation, and reports",
};

const GRADE_COLORS: Record<Grade, string> = {
  S: "bg-emerald-500 text-white",
  A: "bg-blue-500 text-white",
  B: "bg-brand-500 text-white",
  C: "bg-amber-500 text-white",
  D: "bg-red-500 text-white",
  F: "bg-zinc-500 text-white",
};

const GRADE_INACTIVE: Record<Grade, string> = {
  S: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40",
  A: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40",
  B: "bg-brand-50 dark:bg-brand-500/20 text-brand-400 dark:text-brand-accent hover:bg-brand-100 dark:hover:bg-brand-500/40",
  C: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40",
  D: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40",
  F: "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700",
};

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem("theme");
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return [dark, setDark] as const;
}

function parseUrlHardware(): HardwareProfile | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const ramStr = params.get("ram");
    if (!ramStr) return null;
    const ram = parseInt(ramStr, 10);
    if (isNaN(ram)) return null;

    const gpuId = params.get("gpu");
    if (gpuId) {
      const gpu = GPU_LIST.find((g) => g.id === gpuId);
      if (gpu) {
        const bandwidth = GPU_BANDWIDTH[gpuId];
        if (gpu.unified) {
          return {
            ram: gpu.vram,
            vram: gpu.vram,
            hasGpu: true,
            bandwidth,
            gpuId,
          };
        }
        return { ram, vram: gpu.vram, hasGpu: true, bandwidth, gpuId };
      }
    }

    const cpuId = params.get("cpu");
    return { ram, vram: 0, hasGpu: false, cpuId: cpuId ?? undefined };
  } catch {
    return null;
  }
}

function updateUrl(profile: HardwareProfile) {
  const params = new URLSearchParams();
  params.set("ram", String(profile.ram));
  if (profile.gpuId) params.set("gpu", profile.gpuId);
  if (profile.cpuId) params.set("cpu", profile.cpuId);
  window.history.replaceState(null, "", `?${params.toString()}`);
}

const INITIAL_HARDWARE = parseUrlHardware() ?? DEFAULT_HARDWARE;
const INITIAL_CUSTOM = loadCustomModels();
const INITIAL_LIVE = getCachedLiveModels(); // instant from localStorage, empty on first visit

export default function App() {
  const [dark, setDark] = useDarkMode();
  const [hardware, setHardware] = useState<HardwareProfile>(INITIAL_HARDWARE);
  const [customModels, setCustomModels] = useState<Model[]>(INITIAL_CUSTOM);
  const [liveModels, setLiveModels] = useState<Model[]>(INITIAL_LIVE);
  const [liveStatus, setLiveStatus] = useState<
    "idle" | "loading" | "done" | "error"
  >(INITIAL_LIVE.length > 0 ? "done" : "loading");
  const [compatible, setCompatible] = useState<CompatibleModel[]>(() =>
    getCompatibleModels(INITIAL_HARDWARE, [...INITIAL_CUSTOM, ...INITIAL_LIVE]),
  );
  const [allModels, setAllModels] = useState<CompatibleModel[]>(() =>
    getAllModels(INITIAL_HARDWARE, [...INITIAL_CUSTOM, ...INITIAL_LIVE]),
  );
  const [filterGrade, setFilterGrade] = useState<Grade | null>(null);
  const [filterUseCase, setFilterUseCase] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [view, setView] = useState<View>("results");
  const [shareCopied, setShareCopied] = useState(false);
  const [calibration, setCalibration] = useState<CalibrationData | null>(() =>
    loadCalibration(),
  );
  const searchRef = useRef<HTMLInputElement>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Fetch live models from HF Hub + Ollama on mount (cached for 24h)
  useEffect(() => {
    fetchLiveModels()
      .then((live) => {
        setLiveModels(live);
        setLiveStatus("done");
        setCompatible(
          getCompatibleModels(hardware, [...customModels, ...live]),
        );
        setAllModels(getAllModels(hardware, [...customModels, ...live]));
      })
      .catch(() => setLiveStatus("error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleRefreshLive() {
    setLiveStatus("loading");
    try {
      const live = await refreshLiveModels();
      setLiveModels(live);
      setLiveStatus("done");
      setCompatible(getCompatibleModels(hardware, [...customModels, ...live]));
      setAllModels(getAllModels(hardware, [...customModels, ...live]));
    } catch {
      setLiveStatus("error");
    }
  }

  // Press "/" to focus search. preventDefault blocks character insertion;
  // requestAnimationFrame defers focus until after the full keystroke cycle
  // so the "/" never lands in the input even if the browser processes it late.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "/") {
        e.preventDefault();
        requestAnimationFrame(() => searchRef.current?.focus());
      }
      if (e.key === "?") {
        e.preventDefault();
        setShowShortcuts((v) => !v);
      }
      if (e.key === "Escape") setShowShortcuts(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  function handleHardwareSubmit(profile: HardwareProfile) {
    setHardware(profile);
    setCompatible(
      getCompatibleModels(profile, [...customModels, ...liveModels]),
    );
    setAllModels(getAllModels(profile, [...customModels, ...liveModels]));
    setFilterGrade(null);
    setFilterUseCase(null);
    setSearch("");
    updateUrl(profile);
  }

  function handleCustomModelsChanged(updated: Model[]) {
    setCustomModels(updated);
    setCompatible(getCompatibleModels(hardware, [...updated, ...liveModels]));
    setAllModels(getAllModels(hardware, [...updated, ...liveModels]));
  }

  function handleShare() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 1500);
    });
  }

  // Grade counts (fits-only models in results view)
  const gradeCounts = useMemo(
    () =>
      GRADE_ORDER.reduce(
        (acc, g) => ({
          ...acc,
          [g]: compatible.filter((c) => c.grade === g).length,
        }),
        {} as Record<Grade, number>,
      ),
    [compatible],
  );

  const allUseCases = useMemo(
    () =>
      Array.from(new Set(compatible.flatMap((c) => c.model.useCases))).sort(),
    [compatible],
  );

  // Filter
  const afterFilter = useMemo(() => {
    let list = compatible;
    if (filterGrade) list = list.filter((c) => c.grade === filterGrade);
    if (filterUseCase)
      list = list.filter((c) => c.model.useCases.includes(filterUseCase));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.model.name.toLowerCase().includes(q) ||
          c.model.family.toLowerCase().includes(q) ||
          c.model.useCases.some((uc) => uc.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [compatible, filterGrade, filterUseCase, search]);

  // Quick picks — top 3 models by role, no API required
  const quickPicks = useMemo(() => {
    if (compatible.length === 0) return [];
    const picks: { item: CompatibleModel; reason: string }[] = [];

    const best = compatible[0];
    picks.push({ item: best, reason: "Highest score on your hardware" });

    const coder = compatible.find(
      (c) =>
        c !== best &&
        c.model.useCases.some((uc) =>
          ["coding", "code-completion", "debugging"].includes(uc),
        ),
    );
    if (coder)
      picks.push({ item: coder, reason: "Top coding model that fits" });

    const memKey = (c: CompatibleModel) =>
      c.runOnGpu ? c.bestVariant.vramRequired : c.bestVariant.ramRequired;
    const efficient = [...compatible]
      .filter((c) => c !== best && c !== coder)
      .sort((a, b) => memKey(a) - memKey(b))[0];
    if (efficient)
      picks.push({
        item: efficient,
        reason: "Smallest footprint, fastest inference",
      });

    return picks;
  }, [compatible]);

  // Sort
  const sorted = useMemo(() => {
    const list = [...afterFilter];
    switch (sortKey) {
      case "score":
        return list.sort((a, b) => b.score - a.score);
      case "grade":
        return list.sort((a, b) => {
          const d = GRADE_ORDER.indexOf(a.grade) - GRADE_ORDER.indexOf(b.grade);
          return d !== 0 ? d : b.model.parameters - a.model.parameters;
        });
      case "speed":
        return list.sort((a, b) => b.tokensPerSec - a.tokensPerSec);
      case "params":
        return list.sort((a, b) => b.model.parameters - a.model.parameters);
      case "vram":
        return list.sort(
          (a, b) => a.bestVariant.vramRequired - b.bestVariant.vramRequired,
        );
      case "context":
        return list.sort(
          (a, b) => b.model.contextLength - a.model.contextLength,
        );
    }
  }, [afterFilter, sortKey]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b border-brand-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={logo2i}
              alt="2i logo"
              className="w-10 h-10 text-brand-300 dark:text-brand-200"
            />
            <div>
              <h1 className="text-xl font-bold text-brand-500 dark:text-brand-100">
                LLM Evaluator
              </h1>
              <p className="text-xs text-brand-400 dark:text-brand-accent">
                Find which models your hardware can run
              </p>
            </div>
          </div>
          <button
            onClick={() => setDark(!dark)}
            title={dark ? "Switch to light mode" : "Switch to dark mode"}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            {dark ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
        </div>

        {/* Tab nav */}
        <div className="max-w-6xl mx-auto px-4 pb-0 flex gap-1 overflow-x-auto scrollbar-none">
          {(
            [
              "results",
              "guide",
              "tierlist",
              "compare",
              "algorithms",
              "frameworks",
              "deploy",
              "leaderboard",
              "timeline",
              "glossary",
            ] as View[]
          ).map((v) => {
            const labels: Record<View, string> = {
              results: "Results",
              guide: "Guided Discovery",
              tierlist: "Tier List",
              compare: "Compare",
              algorithms: "Algorithm Picker",
              frameworks: "Framework Picker",
              deploy: "Deploy Guide",
              leaderboard: "Leaderboard",
              timeline: "Timeline",
              glossary: "Glossary",
            };
            return (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
                  view === v
                    ? "text-brand-400 dark:text-brand-accent border-brand-300 dark:border-brand-accent bg-brand-50 dark:bg-brand-400/10"
                    : "text-zinc-500 dark:text-zinc-400 border-transparent hover:text-brand-300 dark:hover:text-brand-100"
                }`}
              >
                {labels[v]}
              </button>
            );
          })}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {view === "guide" ? (
          <>
            <div className="text-center mb-8 px-2">
              <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
                Find Your ML Stack
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto text-sm sm:text-base">
                Answer a few questions and discover the perfect algorithm,
                framework, and deployment strategy for your problem.
              </p>
            </div>
            <LearnBanner id="guide" {...SECTION_LEARN.guide} />
            <GuidedDiscovery />
          </>
        ) : view === "timeline" ? (
          <>
            <div className="text-center mb-8 px-2">
              <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
                Open-Source LLM History
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto text-sm sm:text-base">
                Key milestones in the open-weight LLM movement — from LLaMA 1 to
                Qwen 3 and beyond.
              </p>
            </div>
            <LearnBanner id="timeline" {...SECTION_LEARN.timeline} />
            <ModelTimeline liveModels={liveModels} />
          </>
        ) : view === "algorithms" ? (
          <>
            <div className="text-center mb-8 px-2">
              <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
                Which ML algorithm should I use?
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto text-sm sm:text-base">
                Answer a few questions and get a ranked list of algorithms with
                pros, cons, and complexity — like a scikit-learn cheat sheet,
                but interactive.
              </p>
            </div>
            <LearnBanner id="algorithms" {...SECTION_LEARN.algorithms} />
            <AlgorithmFlowchart />
            <div className="mt-8" />
            <AlgorithmSelector />
          </>
        ) : view === "frameworks" ? (
          <>
            <div className="text-center mb-8 px-2">
              <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
                Which ML framework should I use?
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto text-sm sm:text-base">
                Answer a few questions and get ranked recommendations — PyTorch
                vs TensorFlow vs JAX vs scikit-learn and more.
              </p>
            </div>
            <LearnBanner id="frameworks" {...SECTION_LEARN.frameworks} />
            <FrameworkFlowchart />
            <FrameworkPicker />
          </>
        ) : view === "deploy" ? (
          <>
            <div className="text-center mb-8 px-2">
              <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
                How should I deploy this model?
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto text-sm sm:text-base">
                Pick your target environment and we'll recommend the best
                inference stack — with install commands, config flags, and
                resource requirements.
              </p>
            </div>
            <LearnBanner id="deploy" {...SECTION_LEARN.deploy} />
            <DeploymentFlowchart />
            <DeploymentGuide />
          </>
        ) : view === "leaderboard" ? (
          <>
            <div className="text-center mb-8 px-2">
              <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
                Benchmark Leaderboard
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto text-sm sm:text-base">
                All models ranked by MMLU, HumanEval, and MT-Bench scores. Click
                column headers to sort.
              </p>
            </div>
            <LearnBanner id="leaderboard" {...SECTION_LEARN.leaderboard} />
            <Leaderboard />
          </>
        ) : view === "compare" ? (
          <>
            <LearnBanner id="compare" {...SECTION_LEARN.compare} />
            <CompareView />
          </>
        ) : view === "glossary" ? (
          <>
            <div className="text-center mb-8 px-2">
              <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
                AI & ML Glossary
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto text-sm sm:text-base">
                Every tag, concept, and term explained — from RAG to
                quantization. Click any term to learn more.
              </p>
            </div>
            <Glossary />
          </>
        ) : (
          <>
            {/* Hero — only on results */}
            {view === "results" && (
              <div className="text-center mb-8 px-2">
                <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
                  Which LLMs can your machine run?
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto text-sm sm:text-base">
                  Enter your hardware and we'll show you which models you can
                  run locally — graded by how well they'll actually perform.
                </p>
              </div>
            )}

            {view === "results" && (
              <LearnBanner id="results" {...SECTION_LEARN.results} />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left column */}
              <div className="lg:col-span-1 space-y-4">
                <div data-tour="hardware-form">
                  <HardwareForm
                    onSubmit={handleHardwareSubmit}
                    initial={hardware}
                  />
                </div>
                <AddModelForm
                  customModels={customModels}
                  onChanged={handleCustomModelsChanged}
                />
                {view === "results" && (
                  <div data-tour="advisor-chat">
                    <ErrorBoundary>
                      <AdvisorChat
                        hardware={hardware}
                        compatible={compatible}
                        hasApiKey={HAS_API_KEY}
                      />
                    </ErrorBoundary>
                  </div>
                )}
              </div>

              {/* Right column */}
              <div className="lg:col-span-2">
                {view === "results" ? (
                  <>
                    {/* Stats + sort bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 shrink-0 flex items-center gap-2 flex-wrap">
                        <span>
                          <span className="text-brand-300 dark:text-brand-accent font-bold">
                            {compatible.length}
                          </span>{" "}
                          models ·{" "}
                        </span>
                        {liveStatus === "loading" && (
                          <span className="flex items-center gap-1 text-xs text-zinc-400">
                            <svg
                              className="w-3 h-3 animate-spin"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                              />
                            </svg>
                            fetching live models…
                          </span>
                        )}
                        {liveStatus === "done" && liveModels.length > 0 && (
                          <span className="flex items-center gap-1 text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                              +{liveModels.length} live
                            </span>
                            <button
                              onClick={handleRefreshLive}
                              title={`Refresh live models (cache age: ${Math.round((getLiveCacheAge() ?? 0) / 3600000)}h)`}
                              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer ml-0.5"
                            >
                              ↻
                            </button>
                          </span>
                        )}
                        {liveStatus === "error" && (
                          <span className="text-xs text-zinc-400">
                            (live feed unavailable)
                          </span>
                        )}
                        {hardware.hasGpu ? (
                          <>
                            <span className="text-brand-300 dark:text-brand-accent font-bold">
                              {hardware.vram} GB VRAM
                            </span>
                            <span className="text-zinc-400 dark:text-zinc-500 text-xs font-normal">
                              {" "}
                              (primary)
                            </span>
                            {" · "}
                            {hardware.ram} GB RAM
                          </>
                        ) : (
                          <>{hardware.ram} GB RAM</>
                        )}
                      </p>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleShare}
                          className="text-xs px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer font-medium"
                        >
                          {shareCopied ? "Copied!" : "Share"}
                        </button>
                        <button
                          onClick={() => {
                            const tag = hardware.hasGpu
                              ? `${hardware.vram}gb-vram`
                              : `${hardware.ram}gb-ram`;
                            exportCsv(compatible, tag);
                          }}
                          className="text-xs px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer font-medium"
                        >
                          CSV
                        </button>
                        <button
                          onClick={() => {
                            const tag = hardware.hasGpu
                              ? `${hardware.vram}gb-vram`
                              : `${hardware.ram}gb-ram`;
                            exportJson(compatible, tag);
                          }}
                          className="text-xs px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer font-medium"
                        >
                          JSON
                        </button>
                        <select
                          value={sortKey}
                          onChange={(e) =>
                            setSortKey(e.target.value as SortKey)
                          }
                          aria-label="Sort models by"
                          className="text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg px-3 py-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500"
                        >
                          <option value="score">Sort: Score</option>
                          <option value="grade">Sort: Grade</option>
                          <option value="speed">Sort: Speed</option>
                          <option value="params">Sort: Parameters</option>
                          <option value="vram">Sort: VRAM (low→high)</option>
                          <option value="context">Sort: Context</option>
                        </select>
                      </div>
                    </div>

                    {/* Quick picks */}
                    {quickPicks.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mb-2">
                          Top picks for your hardware
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {quickPicks.map(({ item, reason }) => (
                            <div
                              key={item.model.id}
                              className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-brand-200 dark:hover:border-brand-400 transition-colors"
                            >
                              <div
                                className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white ${
                                  item.grade === "S"
                                    ? "bg-emerald-500"
                                    : item.grade === "A"
                                      ? "bg-blue-500"
                                      : item.grade === "B"
                                        ? "bg-brand-500"
                                        : "bg-amber-500"
                                }`}
                              >
                                {item.grade}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-tight truncate">
                                  {item.model.name}
                                </p>
                                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5 leading-tight">
                                  {reason}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Search */}
                    <div className="relative mb-3">
                      <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      <input
                        ref={searchRef}
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder='Search models, families, use cases… (press "/" to focus)'
                        aria-label="Search models"
                        className="w-full pl-8 pr-8 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                      {search && (
                        <button
                          onClick={() => setSearch("")}
                          aria-label="Clear search"
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      )}
                    </div>

                    {/* Grade filter pills */}
                    <div
                      data-tour="grade-badges"
                      className="flex flex-wrap gap-1.5 mb-3"
                    >
                      <button
                        onClick={() => setFilterGrade(null)}
                        className={`text-xs px-3 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                          !filterGrade
                            ? "bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                        }`}
                      >
                        All {compatible.length}
                      </button>
                      {GRADE_ORDER.filter((g) => gradeCounts[g] > 0).map(
                        (g) => (
                          <button
                            key={g}
                            onClick={() =>
                              setFilterGrade(filterGrade === g ? null : g)
                            }
                            className={`text-xs px-3 py-1 rounded-full font-bold transition-colors cursor-pointer ${
                              filterGrade === g
                                ? GRADE_COLORS[g]
                                : GRADE_INACTIVE[g]
                            }`}
                          >
                            {g} · {gradeCounts[g]}
                          </button>
                        ),
                      )}
                    </div>

                    {/* Use-case filter pills */}
                    {allUseCases.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {allUseCases.map((uc) => (
                          <button
                            key={uc}
                            onClick={() =>
                              setFilterUseCase(filterUseCase === uc ? null : uc)
                            }
                            title={USE_CASE_INFO[uc] ?? uc}
                            className={`text-xs px-3 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                              filterUseCase === uc
                                ? "bg-brand-300 text-white"
                                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                            }`}
                          >
                            {uc}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Benchmark calibrator */}
                    {compatible.length > 0 && (
                      <div className="mb-3">
                        <BenchmarkCalibrator
                          models={compatible}
                          calibration={calibration}
                          onCalibrationChange={setCalibration}
                        />
                      </div>
                    )}

                    {/* Model grid */}
                    {liveStatus === "loading" && compatible.length === 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <SkeletonModelCard key={i} />
                        ))}
                      </div>
                    ) : sorted.length === 0 ? (
                      <div className="flex flex-col items-center justify-center gap-3 py-10 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium text-center px-4">
                          {search && filterGrade
                            ? `No grade-${filterGrade} models matching "${search}"`
                            : search && filterUseCase
                              ? `No "${filterUseCase}" models matching "${search}"`
                              : search
                                ? `No models match "${search}"`
                                : filterGrade && filterUseCase
                                  ? `No grade-${filterGrade} "${filterUseCase}" models in your results`
                                  : filterGrade
                                    ? `No grade-${filterGrade} models in your results`
                                    : filterUseCase
                                      ? `No "${filterUseCase}" models fit your hardware`
                                      : "No models match"}
                        </p>
                        <div className="flex gap-2 flex-wrap justify-center">
                          {search && (
                            <button
                              onClick={() => setSearch("")}
                              className="text-xs px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer font-medium"
                            >
                              Clear search
                            </button>
                          )}
                          {filterGrade && (
                            <button
                              onClick={() => setFilterGrade(null)}
                              className="text-xs px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer font-medium"
                            >
                              Clear grade filter
                            </button>
                          )}
                          {filterUseCase && (
                            <button
                              onClick={() => setFilterUseCase(null)}
                              className="text-xs px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer font-medium"
                            >
                              Clear use-case filter
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div
                        data-tour="detail-panel"
                        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                      >
                        {sorted.map((item) => (
                          <ModelCard
                            key={item.model.id}
                            item={item}
                            hardware={hardware}
                            calibrationFactor={calibration?.factor ?? 1}
                          />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <TierList
                    hardware={hardware}
                    allModels={allModels}
                    calibrationFactor={calibration?.factor ?? 1}
                  />
                )}
              </div>
            </div>
          </>
        )}
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-xs text-zinc-400 dark:text-zinc-500">
          Speed estimates are approximate (based on memory bandwidth). Actual
          performance varies by runtime, quantization, and system load.
        </div>
      </footer>

      {/* Keyboard shortcut modal */}
      {showShortcuts && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setShowShortcuts(false)}
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl w-80 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Keyboard Shortcuts
              </h3>
              <button
                onClick={() => setShowShortcuts(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <div className="space-y-2">
              {[
                { key: "/", desc: "Focus search" },
                { key: "?", desc: "Toggle this modal" },
                { key: "Esc", desc: "Close modal / clear focus" },
              ].map((s) => (
                <div key={s.key} className="flex items-center justify-between">
                  <span className="text-xs text-zinc-600 dark:text-zinc-300">
                    {s.desc}
                  </span>
                  <kbd className="text-xs px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 font-mono">
                    {s.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Onboarding tooltip tour (first visit only) */}
      <OnboardingTour />
    </div>
  );
}
