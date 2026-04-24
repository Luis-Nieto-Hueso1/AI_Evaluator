import { useState, useRef, useEffect } from "react";

interface Props {
  term: string;
  children: React.ReactNode;
}

export function Tooltip({ term, children }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <span ref={ref} className="relative inline-block">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className="underline decoration-dotted decoration-brand-300/50 dark:decoration-brand-accent/50 underline-offset-2 cursor-help text-inherit"
      >
        {children}
      </button>
      {open && (
        <span className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 sm:w-72 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs rounded-xl px-3 py-2.5 shadow-lg leading-relaxed pointer-events-auto">
          <span className="font-semibold text-brand-accent dark:text-brand-300">
            {term}
          </span>
          <span className="mx-1">—</span>
          {GLOSSARY[term] ?? "No definition available."}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900 dark:border-t-zinc-100" />
        </span>
      )}
    </span>
  );
}

const GLOSSARY: Record<string, string> = {
  Parameters:
    "The learned numbers inside a model. A 7B model has 7 billion. More = smarter but needs more memory. Each billion ≈ 0.5–2 GB depending on quantization.",
  Quantization:
    "Compressing a model by reducing number precision (16-bit → 4-bit). Cuts memory 2–8× with small quality loss. Q4 = 4-bit, Q8 = 8-bit, F16 = full.",
  VRAM: "Video RAM — your GPU's dedicated memory. Models run 5–20× faster here than in system RAM. Check your GPU specs to see how much you have.",
  RAM: "System memory shared by all programs. Models can run on CPU using RAM, but slower than GPU. 16 GB is minimum for most small models.",
  Context:
    "How much text the model can process at once, measured in tokens (1 token ≈ ¾ word). 4K = ~3,000 words, 128K = entire books.",
  "Context Window":
    "How much text the model can process at once, measured in tokens (1 token ≈ ¾ word). 4K = ~3,000 words, 128K = entire books.",
  "tok/s":
    "Tokens per second — generation speed. 1 token ≈ ¾ word. 10+ tok/s feels responsive for chat. Below 5 feels sluggish. GPU is much faster than CPU.",
  "Tokens per second":
    "Generation speed. 1 token ≈ ¾ word. 10+ tok/s feels responsive for chat. Below 5 feels sluggish. GPU is much faster than CPU.",
  GGUF: "A file format for quantized models optimized for CPU inference with llama.cpp. Single file, easy to use. Most models on HuggingFace have GGUF versions.",
  Grade:
    "How well a model fits YOUR hardware. S = perfect, A = good, B = decent, C = tight fit, D = barely runs, F = won't run. Based on memory, speed, and quality.",
  Score:
    "A 0–100 number combining memory fit, estimated speed, and quantization quality. Higher = better match for your specific hardware.",
  Open: "Model weights are publicly available — you can download and run them freely. You control your data and pay no per-use fees.",
  Restricted:
    "Model has usage restrictions in its license — may limit commercial use, require attribution, or prohibit certain applications. Read the license before deploying.",
  F16: "Full 16-bit precision. Best quality but largest size. A 7B model at F16 needs ~14 GB. Use when you have plenty of memory and want maximum quality.",
  Q8_0: "8-bit quantization. Near-original quality with half the memory of F16. A 7B model needs ~7 GB. Good balance of quality and size.",
  Q4_K_M:
    "4-bit quantization (medium quality). Quarter the memory of F16 with small quality loss. A 7B model needs ~4 GB. Most popular for consumer hardware.",
  Q4_K_S:
    "4-bit quantization (small/fast variant). Slightly less quality than Q4_K_M but a bit smaller. Good for tight memory situations.",
  Q2_K: "2-bit quantization. Maximum compression, noticeable quality loss. Only use when nothing else fits. A 7B model needs ~3 GB.",
  CPU: "Central Processing Unit — your computer's main processor. Can run models using system RAM. Slower than GPU but works without a graphics card.",
  GPU: "Graphics Processing Unit — specialized chip for parallel computation. Much faster for AI inference. NVIDIA GPUs with CUDA are most common for ML.",
  Inference:
    "Running a trained model to get predictions or generate text. Distinct from training (which creates the model). This tool helps you run inference locally.",
  "Fine-tuning":
    "Adapting a pre-trained model to your specific data or task. Like teaching a general-purpose model to specialize. Requires more resources than inference.",
  Ollama:
    "A tool that makes running LLMs as easy as Docker. One command to download and run: 'ollama run llama3.2'. Handles GPU detection and model management.",
  "llama.cpp":
    "High-performance C++ inference engine. Runs models on CPU and GPU. Supports GGUF format. The foundation that Ollama and many other tools build on.",
  HuggingFace:
    "The largest platform for sharing AI models. Hosts thousands of pre-trained models with download stats, benchmarks, and community discussion.",
  MMLU: "Massive Multitask Language Understanding — a benchmark testing knowledge across 57 academic subjects. Score of 70+ = strong general knowledge.",
  HumanEval:
    "A coding benchmark with 164 Python problems. The model must write functions that pass unit tests. Score of 80%+ = strong coding ability.",
  "MT-Bench":
    "Multi-Turn Benchmark — tests conversation quality over multi-turn dialogues. Scored 1–10 by a judge model. 8+ = excellent conversational ability.",
  Benchmark:
    "A standardized test for measuring model capability. Like exams for AI. Different benchmarks test different skills (knowledge, coding, reasoning).",
  "Use case":
    "The specific task you want the model to do — coding, chat, translation, reasoning, etc. Different models specialize in different use cases.",
  "Model family":
    "A group of related models from the same creator (e.g., Llama by Meta, Qwen by Alibaba). Families release models in multiple sizes and variants.",
  Instruct:
    "A model variant fine-tuned to follow instructions and have conversations. Base models just predict text; instruct models understand 'do X for me'.",
  "Base model":
    "The raw pre-trained model before instruction tuning. Good for text completion but doesn't follow instructions well. Usually fine-tuned into chat/instruct variants.",
  Transformer:
    "The neural network architecture behind all modern LLMs. Uses 'attention' to understand relationships between words. Invented by Google in 2017.",
  Token:
    "The basic unit of text for LLMs. Roughly ¾ of a word. 'Hello world' = 2 tokens. Models read and generate text one token at a time.",
  "Batch processing":
    "Running many requests through a model at once instead of one at a time. More efficient for large workloads but adds latency per individual request.",
  "Supervised learning":
    "Training with labelled examples (input → correct output). The algorithm learns the mapping. Needs labelled data. E.g., spam detection with emails marked spam/not-spam.",
  "Unsupervised learning":
    "Finding patterns in unlabelled data. No correct answers provided. Used for clustering (grouping similar items), dimensionality reduction, anomaly detection.",
  Classification:
    "Predicting a category: spam/not-spam, cat/dog, positive/negative sentiment. Output is a discrete label from a fixed set.",
  Regression:
    "Predicting a continuous number: house price, temperature, stock return. Output is a value on a scale, not a category.",
  Overfitting:
    "When a model memorizes training data instead of learning general patterns. Performs great on training data, poorly on new data. Fix: more data, simpler model, regularization.",
  "Neural network":
    "A computing system inspired by the brain. Layers of connected nodes learn patterns from data. Deep = many layers. The foundation of modern AI.",
  "Random Forest":
    "An ensemble of decision trees that vote on the answer. Great for tabular data. Handles missing values, rarely overfits, easy to use. Often the first algorithm to try.",
  XGBoost:
    "Extreme Gradient Boosting — builds trees sequentially, each fixing the previous one's mistakes. Top performer on tabular data. Wins many Kaggle competitions.",
  SVM: "Support Vector Machine — finds the best boundary between classes. Good for small–medium datasets. Works in high-dimensional spaces. Less popular now but still useful.",
  "K-Means":
    "Unsupervised clustering algorithm. Groups data into K clusters based on distance. You choose K. Fast and simple. Good for customer segmentation, image compression.",
  PCA: "Principal Component Analysis — reduces data dimensions while keeping the most important information. Useful for visualization and preprocessing before other algorithms.",
  "Cross-validation":
    "Testing a model by training on subsets of data and testing on the rest, rotating. Gives more reliable performance estimates than a single train/test split.",
  PyTorch:
    "Meta's ML framework. Dynamic computation graphs, Pythonic feel, dominant in research. The default choice for most new ML projects and all major LLMs.",
  TensorFlow:
    "Google's ML framework. Strong production tools (TF Serving, TF Lite). Good for mobile deployment. Less popular in research since PyTorch took the lead.",
  "scikit-learn":
    "Python's classic ML library. Simple fit/predict API. Perfect for tabular data with traditional algorithms. Not for deep learning — use PyTorch/TensorFlow for that.",
  JAX: "Google's high-performance framework. Auto-differentiates, compiles to GPU/TPU. Functional programming style. Used in cutting-edge research at Google DeepMind.",
};
