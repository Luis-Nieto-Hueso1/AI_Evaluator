import { useState } from "react";

interface Concept {
  title: string;
  icon: string;
  short: string;
  detail: string;
}

interface LearnBannerProps {
  id: string;
  heading: string;
  subtitle: string;
  concepts: Concept[];
  initialVisible?: number;
}

const RESULTS_CONCEPTS: Concept[] = [
  {
    title: "What is an LLM?",
    icon: "🧠",
    short:
      "A Large Language Model is an AI trained on text that can understand and generate human language.",
    detail:
      "LLMs like Llama, Qwen, and Mistral are neural networks with billions of parameters trained on massive text datasets. They predict the next word in a sequence, which lets them write code, answer questions, translate languages, and reason through problems. Larger models (more parameters) are generally smarter but need more memory and compute.",
  },
  {
    title: "What are parameters?",
    icon: "🔢",
    short:
      "Parameters are the learned values inside the model — more parameters usually means more capable.",
    detail:
      "A 7B model has 7 billion parameters. Each parameter is a number that was adjusted during training. More parameters = more knowledge and reasoning ability, but also more RAM/VRAM needed. A rough rule: each billion parameters needs ~0.5–2 GB of memory depending on the quantization format.",
  },
  {
    title: "What is quantization?",
    icon: "📦",
    short:
      "Quantization compresses a model so it uses less memory, with a small quality trade-off.",
    detail:
      "Full-precision models store each parameter as a 16-bit number (F16). Quantization reduces this to 8-bit (Q8), 4-bit (Q4), or even 2-bit. This cuts memory usage by 2–8× with only a small loss in quality. For example, a 7B model at F16 needs ~14 GB, but at Q4 it needs only ~4 GB. Formats like GGUF make this easy to use with tools like llama.cpp.",
  },
  {
    title: "RAM vs VRAM",
    icon: "💾",
    short:
      "RAM is your system memory; VRAM is your GPU's memory. Models run faster on VRAM.",
    detail:
      "Running a model on your GPU (VRAM) is 5–20× faster than on CPU (RAM) because GPUs are designed for parallel math. If your model doesn't fit in VRAM, it can run on CPU using system RAM — it will be slower but still works. Some setups split the model across both.",
  },
  {
    title: "What is a context window?",
    icon: "📄",
    short:
      "The context window is how much text the model can read and remember in one conversation.",
    detail:
      "Measured in tokens (roughly ¾ of a word), the context window sets the limit for input + output combined. A 4K context model can handle ~3,000 words; a 128K model can process entire books. Larger context windows need more memory.",
  },
  {
    title: "What do the grades mean?",
    icon: "🏆",
    short:
      "Grades (S/A/B/C/D/F) show how well each model fits YOUR specific hardware.",
    detail:
      "S = perfect fit, runs fast with room to spare. A = runs well. B = runs but may be slow. C = tight fit, usable but limited. D = barely fits, expect slow speeds. F = won't run on your hardware.",
  },
  {
    title: "How to choose a model?",
    icon: "🎯",
    short:
      "Match the model to your task: coding, chat, reasoning, translation — each has specialists.",
    detail:
      "Start with your use case. Need a coding assistant? Look for models tagged 'coding' or 'code-completion'. Want a general chatbot? 'chat' models work great. For complex reasoning, pick models with 'reasoning' or 'chain-of-thought' tags. Then filter by what your hardware can run — a fast B-grade model often beats a slow S-grade one for interactive use.",
  },
  {
    title: "What is an algorithm?",
    icon: "⚙️",
    short:
      "An algorithm is a step-by-step method for solving a specific type of problem with data.",
    detail:
      "In machine learning, algorithms like Linear Regression, Random Forest, or Neural Networks each approach problems differently. Some are great for tabular data (like spreadsheets), others excel at images or text. You don't always need a giant LLM — sometimes a simple algorithm is faster, cheaper, and more interpretable.",
  },
];

const TIERLIST_CONCEPTS: Concept[] = [
  {
    title: "What is a tier list?",
    icon: "📊",
    short:
      "A ranking that groups models into tiers (S/A/B/C/D/F) based on how well they fit your hardware.",
    detail:
      "Tier lists come from gaming culture — they rank items from best (S-tier) to worst (F-tier). Here, models are grouped by their compatibility score with your hardware. S-tier models run perfectly; F-tier won't run at all. This makes it easy to see at a glance which models are worth trying.",
  },
  {
    title: "Why does the same model appear in different tiers?",
    icon: "🔄",
    short:
      "Different quantization levels of the same model have different memory requirements and quality.",
    detail:
      "A model like Llama 3.2 7B might be S-tier at Q4 quantization (small, fast) but C-tier at F16 (full quality but needs lots of RAM). The tier list shows each variant separately so you can pick the best trade-off between quality and performance for your machine.",
  },
  {
    title: "Should I always pick S-tier?",
    icon: "🤔",
    short:
      "Not necessarily — S-tier means best fit, but a larger B-tier model might be smarter for your task.",
    detail:
      "S-tier means the model runs comfortably on your hardware, but it might be a smaller, less capable model. A B-tier model with more parameters could give better answers, just slower. For batch processing (not real-time), speed matters less. For interactive chat, pick the highest-tier model that still feels responsive.",
  },
  {
    title: "What affects tier placement?",
    icon: "📐",
    short:
      "Memory usage, estimated speed, quantization quality, and whether it uses GPU or CPU.",
    detail:
      "The grading considers: (1) Does it fit in your available memory? (2) How fast will it generate tokens? (3) Is the quantization level good enough for useful output? (4) Can it use your GPU for acceleration? A model that barely fits in RAM with heavy quantization gets a lower tier than one that runs comfortably.",
  },
];

const COMPARE_CONCEPTS: Concept[] = [
  {
    title: "Why compare models?",
    icon: "⚖️",
    short:
      "Comparing helps you see trade-offs between speed, quality, size, and capability side by side.",
    detail:
      "Two models might both run on your hardware, but one could be faster while the other handles longer conversations. Comparing them side by side reveals these trade-offs. Look at parameters (capability), context window (conversation length), VRAM usage (resource cost), and use-case tags (specialisation).",
  },
  {
    title: "What is tokens per second (tok/s)?",
    icon: "⚡",
    short:
      "How fast the model generates text — higher is better for interactive use.",
    detail:
      "Tokens per second measures generation speed. 1 token ≈ ¾ of a word. For comfortable chat, you want 10+ tok/s. Below 5 tok/s feels sluggish. These are estimates based on your hardware — actual speed depends on prompt length, quantization, and system load. CPU inference is typically 1–10 tok/s; GPU can reach 30–100+ tok/s.",
  },
  {
    title: "What are benchmark scores?",
    icon: "📈",
    short:
      "Standardised tests that measure model capability — like exams for AI.",
    detail:
      "MMLU tests general knowledge across 57 subjects. HumanEval tests coding ability. MT-Bench measures conversation quality. Higher scores = more capable model, but benchmarks don't capture everything. A model that scores lower overall might still be the best choice for your specific use case.",
  },
  {
    title: "Bigger model vs better quantization?",
    icon: "🎚️",
    short:
      "A bigger model at lower quality (Q4) often beats a smaller model at full quality (F16).",
    detail:
      "Research shows that a 13B model at Q4 quantization usually outperforms a 7B model at F16, even though Q4 loses some precision. The extra parameters carry more knowledge than the precision lost. So if your RAM allows it, prefer a larger model with moderate quantization over a smaller model at full precision.",
  },
];

const ALGORITHM_CONCEPTS: Concept[] = [
  {
    title: "ML algorithm vs LLM — what's the difference?",
    icon: "🔬",
    short:
      "LLMs handle language; traditional ML algorithms handle structured data, images, and predictions.",
    detail:
      "LLMs are great for text tasks (chat, code, translation), but for predicting house prices, classifying images, or detecting fraud in spreadsheets, traditional ML algorithms like Random Forest, XGBoost, or SVMs are often better, faster, and cheaper. This tab helps you pick the right tool for your specific problem.",
  },
  {
    title: "Supervised vs unsupervised learning",
    icon: "🏷️",
    short:
      "Supervised learning needs labelled examples; unsupervised finds patterns in unlabelled data.",
    detail:
      "If you have data with known answers (e.g., emails labelled 'spam' or 'not spam'), use supervised learning — algorithms like Decision Trees or Neural Networks learn from those labels. If you just have raw data and want to find groups or patterns (e.g., customer segments), use unsupervised learning like K-Means clustering or PCA.",
  },
  {
    title: "Classification vs regression",
    icon: "📋",
    short:
      "Classification predicts categories (spam/not spam); regression predicts numbers (price, temperature).",
    detail:
      "These are the two main types of supervised learning. Classification: 'Is this email spam?' (yes/no), 'What breed is this dog?' (one of many classes). Regression: 'What will this house sell for?' (a continuous number). Some algorithms do both (like Random Forest), others specialise in one.",
  },
  {
    title: "What is overfitting?",
    icon: "📉",
    short:
      "When a model memorises training data instead of learning general patterns — it fails on new data.",
    detail:
      "Imagine studying for an exam by memorising all practice questions word-for-word, but failing when questions are rephrased. That's overfitting. Complex models (deep neural nets) are more prone to it. Solutions: use more training data, simplify the model, add regularisation, or use cross-validation. Simpler algorithms like Linear Regression overfit less.",
  },
  {
    title: "When do I need deep learning?",
    icon: "🧬",
    short:
      "For images, audio, video, or text — when patterns are too complex for traditional algorithms.",
    detail:
      "Deep learning (neural networks with many layers) excels at unstructured data: images (CNNs), sequences/text (Transformers), audio (RNNs). For tabular/structured data (spreadsheets, databases), traditional algorithms like XGBoost often perform equally well or better, train faster, and are easier to interpret. Don't use deep learning just because it sounds impressive.",
  },
  {
    title: "How to evaluate an algorithm?",
    icon: "✅",
    short:
      "Split data into train/test sets. Measure accuracy, precision, recall, or RMSE depending on the task.",
    detail:
      "Never evaluate on training data — that just tests memorisation. Split data: ~80% for training, ~20% for testing. For classification, check accuracy (% correct), precision (of predicted positives, how many are real), and recall (of real positives, how many were found). For regression, use RMSE (average error size). Cross-validation gives more reliable estimates.",
  },
];

const FRAMEWORK_CONCEPTS: Concept[] = [
  {
    title: "What is an ML framework?",
    icon: "🛠️",
    short:
      "Software libraries that provide building blocks for creating, training, and running ML models.",
    detail:
      "Frameworks like PyTorch, TensorFlow, and scikit-learn give you pre-built components — neural network layers, optimisers, data loaders — so you don't code everything from scratch. Think of them like game engines for AI: they handle the hard math and GPU acceleration, you focus on your model's design.",
  },
  {
    title: "PyTorch vs TensorFlow",
    icon: "⚔️",
    short:
      "PyTorch is more popular in research and easier to debug; TensorFlow is strong in production deployment.",
    detail:
      "PyTorch (by Meta) uses dynamic computation graphs — you write normal Python and it 'just works'. It dominates research and is the default for most new LLMs. TensorFlow (by Google) was the original leader, has great production tools (TF Serving, TF Lite for mobile), but its eager mode caught up late. Most new projects choose PyTorch unless they need TensorFlow's deployment ecosystem.",
  },
  {
    title: "When to use scikit-learn?",
    icon: "📊",
    short:
      "For traditional ML on structured data — it's the simplest, fastest way to get started.",
    detail:
      "scikit-learn is perfect for tabular data (CSVs, databases) and classic algorithms: Random Forest, SVM, K-Means, PCA. It has a consistent API (fit/predict), great documentation, and works on CPU. Use it when you don't need deep learning. It's often the right starting point — only move to PyTorch/TensorFlow if scikit-learn isn't enough.",
  },
  {
    title: "What about JAX?",
    icon: "🚀",
    short:
      "Google's high-performance framework — fast on TPUs, functional style, popular in cutting-edge research.",
    detail:
      "JAX is NumPy on steroids: it auto-differentiates, auto-vectorises, and compiles to GPU/TPU. It uses a functional programming style (no mutable state), which makes it harder to learn but enables powerful optimisations. Used by Google DeepMind for frontier research. Choose JAX if you need maximum performance on TPUs or enjoy functional programming.",
  },
  {
    title: "What is Hugging Face?",
    icon: "🤗",
    short:
      "A platform and library that makes it easy to download, use, and share pre-trained models.",
    detail:
      "Hugging Face Transformers library lets you load thousands of pre-trained models in 3 lines of code. It sits on top of PyTorch or TensorFlow. The Hub hosts models, datasets, and demos. If you want to use an existing model (not train from scratch), Hugging Face is usually the fastest path. This tool pulls live model data from the Hugging Face Hub.",
  },
];

const DEPLOY_CONCEPTS: Concept[] = [
  {
    title: "What does 'deploying a model' mean?",
    icon: "🚢",
    short:
      "Making your model available for real use — whether on a server, in an app, or on a device.",
    detail:
      "Training a model is step one. Deployment is making it useful: hosting it as an API that apps can call, running it on a phone, embedding it in a website. Deployment involves choosing an inference engine (the software that runs the model), hardware (cloud GPU, local CPU), and serving strategy (real-time vs batch).",
  },
  {
    title: "What is an inference engine?",
    icon: "⚡",
    short:
      "Software that runs a trained model efficiently — like llama.cpp, vLLM, or Ollama.",
    detail:
      "The inference engine loads your model into memory and generates responses. Different engines optimise for different things: llama.cpp runs on CPU with minimal dependencies, vLLM maximises GPU throughput for serving many users, Ollama provides a simple Docker-like experience. The best choice depends on your hardware and scale.",
  },
  {
    title: "Cloud vs local deployment",
    icon: "☁️",
    short:
      "Cloud gives you powerful GPUs on demand; local gives you privacy and no ongoing costs.",
    detail:
      "Cloud (AWS, GCP, Azure): pay per hour for powerful GPUs, scale up/down easily, no hardware management. Best for production APIs serving many users. Local: one-time hardware cost, full privacy, no internet needed. Best for personal use, sensitive data, or when you need predictable costs. Many teams use cloud for development and local for inference.",
  },
  {
    title: "What is GGUF?",
    icon: "📁",
    short:
      "A file format for quantized models — designed for efficient CPU inference with llama.cpp.",
    detail:
      "GGUF (GPT-Generated Unified Format) packages a model into a single file with built-in quantization. It's the standard for running LLMs on consumer hardware. You'll see filenames like 'model-Q4_K_M.gguf' — the Q4_K_M part tells you the quantization level. Most models on Hugging Face have GGUF variants ready to download and run.",
  },
  {
    title: "What is Ollama?",
    icon: "🦙",
    short:
      "A tool that makes running LLMs locally as easy as running Docker containers.",
    detail:
      "Ollama wraps llama.cpp in a simple CLI: 'ollama run llama3.2' downloads and runs the model. It handles model management, GPU detection, and provides an API. Great for beginners and local development. For production or maximum performance, you might want vLLM (GPU) or raw llama.cpp (CPU) instead.",
  },
];

const LEADERBOARD_CONCEPTS: Concept[] = [
  {
    title: "What is a benchmark?",
    icon: "📏",
    short:
      "A standardised test that measures how good a model is at specific tasks.",
    detail:
      "Benchmarks are like exams for AI models. MMLU tests knowledge across 57 subjects (history, science, law). HumanEval tests if the model can write working code. MT-Bench measures multi-turn conversation quality. Each produces a score you can compare across models. But no single benchmark captures everything — a model that tops MMLU might struggle at coding.",
  },
  {
    title: "Do higher scores always mean better?",
    icon: "🤷",
    short:
      "Higher scores show general capability, but the best model for YOU depends on your specific use case.",
    detail:
      "A model scoring 90 on MMLU knows more facts than one scoring 70, but if you need a coding assistant, HumanEval scores matter more. Also, benchmark scores don't capture: how natural the conversation feels, how well it follows your specific instructions, or how fast it runs on your hardware. Use scores as a starting filter, then test with your actual use case.",
  },
  {
    title: "What is MMLU?",
    icon: "🎓",
    short:
      "Massive Multitask Language Understanding — tests knowledge across 57 academic subjects.",
    detail:
      "MMLU presents multiple-choice questions from subjects like abstract algebra, anatomy, astronomy, and US history. A score of 70+ indicates strong general knowledge. GPT-4 class models score 85+. Smaller models (1–3B parameters) typically score 30–50. It's the most widely used benchmark for comparing LLM general intelligence.",
  },
  {
    title: "What is HumanEval?",
    icon: "💻",
    short:
      "A coding benchmark — gives the model a function signature and docstring, tests if it writes working code.",
    detail:
      "HumanEval has 164 Python programming problems. The model must write a complete function that passes unit tests. Scores are reported as pass@1 (first attempt passes). Top coding models score 80+%. If you're choosing a model for coding tasks, this benchmark is more relevant than MMLU.",
  },
];

const TIMELINE_CONCEPTS: Concept[] = [
  {
    title: "Why does open-source AI matter?",
    icon: "🔓",
    short:
      "Open models let anyone run AI privately, customise it, and build on it without depending on a company.",
    detail:
      "Closed models (GPT-4, Claude) require sending your data to a company's servers and paying per use. Open-weight models (Llama, Qwen, Mistral) can be downloaded and run anywhere — on your laptop, your company's servers, or in the cloud. This means full privacy, no usage costs after hardware, and the ability to fine-tune the model for your specific needs.",
  },
  {
    title: "What was the LLaMA moment?",
    icon: "🦙",
    short:
      "Meta's LLaMA (Feb 2023) proved that smaller open models could rival much larger closed ones.",
    detail:
      "Before LLaMA, the best open models were far behind GPT-3.5. Meta released LLaMA with 7B–65B parameters, and the community discovered that with the right training data, a 13B open model could match GPT-3.5 on many tasks. This sparked an explosion of open-source development — Alpaca, Vicuna, and hundreds of fine-tunes followed within weeks.",
  },
  {
    title: "How fast is the field moving?",
    icon: "🏎️",
    short:
      "Extremely fast — today's small models (7B) outperform last year's large models (70B).",
    detail:
      "In 2023, you needed a 70B model for good results. By 2024, 7B models like Llama 3.1 and Qwen 2.5 matched or exceeded them. Training techniques, data quality, and architecture improvements mean each generation does more with less. A model that was state-of-the-art 6 months ago is often surpassed by something half its size.",
  },
  {
    title: "What are model families?",
    icon: "👨‍👩‍👧‍👦",
    short:
      "Groups of models from the same creator — like Llama (Meta), Qwen (Alibaba), Mistral (Mistral AI).",
    detail:
      "Each family releases models in multiple sizes (1B, 3B, 7B, 14B, 70B+) and variants (base, instruct/chat, code-specialised). The base model is the raw trained model; 'instruct' or 'chat' versions are fine-tuned to follow instructions. Within a family, larger sizes are smarter but need more resources. Different families have different strengths.",
  },
];

const GUIDE_CONCEPTS: Concept[] = [
  {
    title: "What is Guided Discovery?",
    icon: "🧭",
    short:
      "An interactive questionnaire that recommends the right ML stack based on your specific needs.",
    detail:
      "Instead of browsing through hundreds of options, answer a few questions about your problem, data, and experience level. The tool recommends algorithms, frameworks, and deployment strategies tailored to your situation. It's like having a senior ML engineer help you make your first decisions — no prior AI knowledge needed.",
  },
  {
    title: "Do I need to know programming?",
    icon: "👩‍💻",
    short:
      "Basic Python helps, but many tools now make AI accessible without deep coding knowledge.",
    detail:
      "For running pre-trained LLMs: tools like Ollama require zero coding — just a terminal command. For traditional ML: scikit-learn needs basic Python (loops, variables, imports). For deep learning research: you'll need solid Python plus framework knowledge. The Guided Discovery adapts recommendations to your experience level.",
  },
  {
    title: "What's the typical ML workflow?",
    icon: "🔄",
    short:
      "Define problem → collect data → choose algorithm → train → evaluate → deploy → monitor.",
    detail:
      "1) Define what you're predicting or generating. 2) Gather and clean data. 3) Pick an algorithm (this tool helps!). 4) Train the model on your data. 5) Test it on held-out data to measure performance. 6) Deploy it where users can access it. 7) Monitor for degradation over time. For LLMs, you often skip steps 2–4 by using a pre-trained model.",
  },
  {
    title: "When should I NOT use AI?",
    icon: "🚫",
    short:
      "When simple rules work, when you lack data, or when you need 100% explainable decisions.",
    detail:
      "AI is overkill for problems solvable with if/else rules, SQL queries, or simple statistics. It needs enough training data to learn patterns — 50 examples usually isn't enough. And for regulated domains (healthcare, finance), you may need fully explainable decisions that ML models can't guarantee. Always start with the simplest solution that could work.",
  },
];

export const SECTION_LEARN: Record<
  string,
  { heading: string; subtitle: string; concepts: Concept[] }
> = {
  results: {
    heading: "New to AI models?",
    subtitle:
      "Learn the key concepts to choose the right model for your hardware and use case.",
    concepts: RESULTS_CONCEPTS,
  },
  tierlist: {
    heading: "Understanding tier lists",
    subtitle:
      "How models are ranked and what the tiers mean for your hardware.",
    concepts: TIERLIST_CONCEPTS,
  },
  compare: {
    heading: "How to compare models",
    subtitle:
      "Key metrics and trade-offs to consider when choosing between models.",
    concepts: COMPARE_CONCEPTS,
  },
  algorithms: {
    heading: "ML algorithms explained",
    subtitle:
      "Core concepts to help you pick the right algorithm for your problem.",
    concepts: ALGORITHM_CONCEPTS,
  },
  frameworks: {
    heading: "Understanding ML frameworks",
    subtitle:
      "What frameworks do and how to pick the right one for your project.",
    concepts: FRAMEWORK_CONCEPTS,
  },
  deploy: {
    heading: "Deployment basics",
    subtitle:
      "Key concepts for getting your model from training to real-world use.",
    concepts: DEPLOY_CONCEPTS,
  },
  leaderboard: {
    heading: "Reading benchmarks",
    subtitle:
      "What benchmark scores mean and how to use them when choosing a model.",
    concepts: LEADERBOARD_CONCEPTS,
  },
  timeline: {
    heading: "The open-source AI story",
    subtitle:
      "Context for understanding how we got here and where things are heading.",
    concepts: TIMELINE_CONCEPTS,
  },
  guide: {
    heading: "Before you start",
    subtitle: "Key context to get the most out of Guided Discovery.",
    concepts: GUIDE_CONCEPTS,
  },
};

export function LearnBanner({
  id,
  heading,
  subtitle,
  concepts,
  initialVisible = 4,
}: LearnBannerProps) {
  const storageKey = `learn-${id}-dismissed`;
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(storageKey) === "true",
  );
  const [expanded, setExpanded] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  if (dismissed) return null;

  const needsToggle = concepts.length > initialVisible;
  const visible =
    showAll || !needsToggle ? concepts : concepts.slice(0, initialVisible);

  return (
    <div className="mb-8 rounded-2xl border border-brand-200/30 dark:border-brand-500/30 bg-gradient-to-br from-brand-50 to-white dark:from-brand-500/10 dark:to-zinc-900 p-5 sm:p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-brand-500 dark:text-brand-100 flex items-center gap-2">
            <span className="text-2xl">📚</span> {heading}
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            {subtitle}
          </p>
        </div>
        <button
          onClick={() => {
            setDismissed(true);
            localStorage.setItem(storageKey, "true");
          }}
          className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer shrink-0 ml-4"
          title="Dismiss"
        >
          ✕ Hide
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {visible.map((c, i) => (
          <button
            key={i}
            onClick={() => setExpanded(expanded === i ? null : i)}
            className={`text-left rounded-xl border p-3 transition-all cursor-pointer ${
              expanded === i
                ? "border-brand-300 dark:border-brand-accent bg-white dark:bg-zinc-800 shadow-sm"
                : "border-zinc-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-800/60 hover:border-brand-200 dark:hover:border-brand-accent/50"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{c.icon}</span>
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {c.title}
              </span>
              <svg
                className={`w-3.5 h-3.5 ml-auto text-zinc-400 transition-transform ${expanded === i ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {c.short}
            </p>
            {expanded === i && (
              <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-700">
                {c.detail}
              </p>
            )}
          </button>
        ))}
      </div>

      {needsToggle && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-3 text-xs font-medium text-brand-300 dark:text-brand-accent hover:underline cursor-pointer"
        >
          Show {concepts.length - initialVisible} more concepts ↓
        </button>
      )}
      {needsToggle && showAll && (
        <button
          onClick={() => setShowAll(false)}
          className="mt-3 text-xs font-medium text-brand-300 dark:text-brand-accent hover:underline cursor-pointer"
        >
          Show less ↑
        </button>
      )}
    </div>
  );
}
