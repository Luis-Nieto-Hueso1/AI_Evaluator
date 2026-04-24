import { useState } from "react";

interface Term {
  tag: string;
  name: string;
  icon: string;
  short: string;
  detail: string;
  examples: string[];
  related: string[];
}

const USE_CASE_TERMS: Term[] = [
  {
    tag: "rag",
    name: "RAG (Retrieval-Augmented Generation)",
    icon: "📚",
    short:
      "The model answers questions using retrieved documents from a knowledge base instead of relying only on its training data.",
    detail:
      "RAG works in two steps: (1) Retrieve — search a database of documents for relevant chunks using semantic similarity, (2) Generate — feed those chunks to the LLM as context so it can answer accurately with real sources. This solves the 'hallucination' problem because the model grounds its answers in actual documents. Think of it as giving the model an open-book exam instead of a closed-book one. Common tools: LangChain, LlamaIndex, ChromaDB, FAISS.",
    examples: [
      "Company knowledge base Q&A",
      "Legal document search",
      "Customer support from docs",
      "Research paper Q&A",
    ],
    related: ["document-qa", "chat", "reasoning"],
  },
  {
    tag: "agents",
    name: "AI Agents",
    icon: "🤖",
    short:
      "Autonomous AI workflows that plan steps, use tools, call APIs, and iterate toward a goal without constant human input.",
    detail:
      "An agent is an LLM that can take actions — not just generate text, but call functions, browse the web, write files, run code, and make decisions about what to do next. The LLM acts as the 'brain' that decides which tool to use and when. Agents can chain multiple steps: search for information → analyze it → write a report → send an email. They need models with strong reasoning and function-calling abilities. Popular frameworks: LangChain Agents, AutoGen, CrewAI.",
    examples: [
      "Research assistant that searches + summarizes",
      "Code assistant that writes + tests + debugs",
      "Data pipeline that collects + cleans + analyzes",
      "Customer service bot that looks up orders + processes returns",
    ],
    related: ["function-calling", "reasoning", "coding"],
  },
  {
    tag: "chat",
    name: "Chat / Conversation",
    icon: "💬",
    short:
      "Open-ended conversation — general Q&A, brainstorming, everyday assistant tasks.",
    detail:
      "Chat models are fine-tuned for multi-turn dialogue. They maintain context across messages, follow conversational norms, and handle a wide range of topics. This is the most general use case — if you're not sure what you need, start here. Chat models are usually 'instruct' variants that have been trained with RLHF (Reinforcement Learning from Human Feedback) to be helpful, harmless, and honest. Most models have a chat variant.",
    examples: [
      "Personal AI assistant",
      "Brainstorming partner",
      "Homework help",
      "General Q&A",
    ],
    related: ["reasoning", "creative-writing", "instruction-following"],
  },
  {
    tag: "coding",
    name: "Code Generation",
    icon: "💻",
    short:
      "Writes functions, scripts, and full programs from natural language descriptions.",
    detail:
      "Code-specialized models are trained on massive amounts of source code from GitHub and other repositories. They understand programming languages, APIs, design patterns, and best practices. Some models are specifically trained for code (like DeepSeek Coder, CodeLlama), while general models also perform well. Key capabilities: generating functions from docstrings, translating between languages, explaining code, and suggesting optimizations.",
    examples: [
      "Generate a Python function from a description",
      "Convert JavaScript to TypeScript",
      "Write SQL queries from natural language",
      "Create unit tests for existing code",
    ],
    related: ["code-completion", "code-review", "debugging"],
  },
  {
    tag: "code-completion",
    name: "Code Completion (Autocomplete)",
    icon: "⌨️",
    short:
      "Predicts the next code tokens as you type — like GitHub Copilot but running locally.",
    detail:
      "Code completion models are optimized for 'fill-in-the-middle' (FIM) — they see code before and after your cursor and predict what goes in between. This requires fast inference (low latency) since suggestions must appear while you type. Smaller models (1–3B) are preferred here because speed matters more than maximum intelligence. Tools like Continue.dev and Tabby let you use local models for autocomplete in VS Code.",
    examples: [
      "Autocomplete function bodies",
      "Suggest variable names and types",
      "Complete import statements",
      "Fill in boilerplate code",
    ],
    related: ["coding", "code-review"],
  },
  {
    tag: "code-review",
    name: "Code Review",
    icon: "🔍",
    short:
      "Reviews pull requests and code changes — flags bugs, style issues, security concerns, and suggests improvements.",
    detail:
      "Code review models analyze diffs and source code for potential problems. They can catch common bugs (off-by-one errors, null pointer issues), flag security vulnerabilities (SQL injection, XSS), suggest performance improvements, and enforce style consistency. This use case benefits from larger models with strong reasoning — they need to understand the intent behind code changes, not just pattern-match.",
    examples: [
      "Automated PR review in CI/CD",
      "Security vulnerability scanning",
      "Style and best-practice enforcement",
      "Finding subtle logic bugs",
    ],
    related: ["coding", "debugging"],
  },
  {
    tag: "reasoning",
    name: "Complex Reasoning",
    icon: "🧩",
    short:
      "Multi-step logical thinking — planning, deduction, problem decomposition, and analysis.",
    detail:
      "Reasoning models excel at problems that require multiple steps of thought: breaking down complex questions, considering edge cases, following logical chains, and synthesizing information. Models with 'chain-of-thought' capability show their reasoning process step by step, which makes their answers more reliable and easier to verify. Larger models (14B+) typically reason much better than smaller ones. Some models are specifically trained for reasoning (like DeepSeek R1).",
    examples: [
      "Math word problems",
      "Logic puzzles",
      "Strategic planning",
      "Analyzing complex scenarios with multiple variables",
    ],
    related: ["chain-of-thought", "math", "science"],
  },
  {
    tag: "chain-of-thought",
    name: "Chain-of-Thought (CoT)",
    icon: "🔗",
    short:
      "The model shows its step-by-step reasoning process before giving a final answer.",
    detail:
      "Chain-of-thought prompting makes the model 'think out loud' — instead of jumping to an answer, it breaks the problem into steps and works through each one. This dramatically improves accuracy on math, logic, and reasoning tasks. Some models are trained specifically for CoT (like DeepSeek R1), while others can be prompted with 'Let's think step by step'. The trade-off: CoT responses are longer and slower, but much more accurate for complex questions.",
    examples: [
      "'If 3 machines make 3 widgets in 3 minutes, how long do 100 machines take for 100 widgets?'",
      "Multi-step math problems",
      "Legal reasoning with multiple precedents",
      "Debugging complex code by tracing execution",
    ],
    related: ["reasoning", "math", "science"],
  },
  {
    tag: "creative-writing",
    name: "Creative Writing",
    icon: "✍️",
    short:
      "Fiction, poetry, marketing copy — generates text with style, tone, and narrative flair.",
    detail:
      "Creative writing models generate text that goes beyond factual accuracy — they need voice, style, emotional resonance, and narrative structure. This includes fiction, poetry, song lyrics, marketing copy, social media posts, and storytelling. Models trained on diverse literary data perform better. Temperature (randomness) settings matter a lot here: higher temperature = more creative but less predictable output.",
    examples: [
      "Short stories and novel chapters",
      "Marketing copy and taglines",
      "Poetry and song lyrics",
      "Social media content",
    ],
    related: ["writing", "text-generation", "chat"],
  },
  {
    tag: "summarization",
    name: "Summarization",
    icon: "📝",
    short:
      "Condenses long documents into key points — preserving the essential information in fewer words.",
    detail:
      "Summarization models extract the most important information from long text. There are two types: extractive (picks key sentences from the source) and abstractive (rewrites the content in new words). LLMs do abstractive summarization. The context window is critical here — the model needs to read the entire document. For documents longer than the context window, you'll need to summarize in chunks and then summarize the summaries.",
    examples: [
      "Meeting notes from transcripts",
      "Article summaries",
      "Report executive summaries",
      "Email thread digests",
    ],
    related: ["document-qa", "writing", "rag"],
  },
  {
    tag: "translation",
    name: "Translation",
    icon: "🌐",
    short:
      "Translates text between languages with awareness of context, idioms, and domain terminology.",
    detail:
      "Modern LLMs can translate between dozens of languages, often rivaling dedicated translation services for common language pairs. They excel at preserving nuance, handling idioms, and adapting tone. Multilingual models (like Qwen, which is strong in Chinese-English) tend to perform best for their training languages. For rare languages, larger models generally do better. Translation quality varies significantly between language pairs.",
    examples: [
      "Document translation",
      "Real-time chat translation",
      "Technical manual localization",
      "Subtitle generation",
    ],
    related: ["multilingual", "writing"],
  },
  {
    tag: "classification",
    name: "Text Classification",
    icon: "🏷️",
    short:
      "Assigns labels or categories to text — sentiment analysis, spam detection, topic categorization.",
    detail:
      "Classification uses a model to sort text into predefined categories. It's one of the simplest and most common NLP tasks. Examples: positive/negative sentiment, spam/not-spam, topic categorization, intent detection in chatbots. For simple classification, smaller models (1–3B) often suffice and are much faster. You can also fine-tune a small model on your specific categories for better accuracy than a general-purpose large model.",
    examples: [
      "Email spam filtering",
      "Customer review sentiment",
      "Support ticket routing",
      "Content moderation",
    ],
    related: ["data-extraction", "instruction-following"],
  },
  {
    tag: "data-extraction",
    name: "Data Extraction (NER / Parsing)",
    icon: "🔎",
    short:
      "Pulls structured data from unstructured text — names, dates, amounts, addresses, entities.",
    detail:
      "Data extraction (also called Named Entity Recognition or information extraction) converts messy text into structured data. The model identifies and extracts specific pieces of information: person names, company names, dates, monetary amounts, addresses, phone numbers, product names, etc. This is essential for processing invoices, contracts, emails, and forms at scale. JSON mode or function calling helps get consistent output format.",
    examples: [
      "Extract names and dates from contracts",
      "Parse invoice amounts and line items",
      "Pull contact info from emails",
      "Convert resumes into structured data",
    ],
    related: ["classification", "document-qa", "function-calling"],
  },
  {
    tag: "function-calling",
    name: "Function Calling (Tool Use)",
    icon: "🔧",
    short:
      "The model generates structured JSON to call external APIs, databases, or tools.",
    detail:
      "Function calling lets the model interact with the outside world. Instead of just generating text, the model outputs a structured JSON object specifying which function to call and with what arguments. Your application then executes that function and feeds the result back. This is the foundation of AI agents. Models need to be specifically trained for function calling — not all models support it. Key format: you describe available functions in the system prompt, the model decides when and how to use them.",
    examples: [
      "Calling a weather API",
      "Querying a database",
      "Sending emails or messages",
      "Creating calendar events",
    ],
    related: ["agents", "data-extraction", "coding"],
  },
  {
    tag: "document-qa",
    name: "Document Q&A",
    icon: "📄",
    short:
      "Answers questions grounded in a specific document — PDFs, reports, manuals, contracts.",
    detail:
      "Document Q&A is about answering questions based on provided context — the model reads a document and answers questions about it. Unlike general chat, the model should stick to information in the document and say 'I don't know' when the answer isn't there. This requires good context window length (to fit the document) and strong comprehension. For very long documents, combine with RAG to search relevant sections first.",
    examples: [
      "Asking questions about a PDF manual",
      "Querying financial reports",
      "Searching legal documents",
      "Answering from research papers",
    ],
    related: ["rag", "summarization", "reasoning"],
  },
  {
    tag: "math",
    name: "Mathematics",
    icon: "🔢",
    short:
      "Solves mathematical problems — from arithmetic to algebra, calculus, and competition-level proofs.",
    detail:
      "Math-capable models can solve equations, prove theorems, explain mathematical concepts, and work through complex word problems. Chain-of-thought reasoning is essential here — models that show their work step by step are much more accurate. Larger models handle harder math. Some models are specifically trained on mathematical data (like DeepSeek Math). Common failure mode: arithmetic errors in large numbers — always verify calculations.",
    examples: [
      "Solving equations step by step",
      "Statistics and probability calculations",
      "Calculus problems",
      "Competition math (AMC, AIME level)",
    ],
    related: ["reasoning", "chain-of-thought", "science"],
  },
  {
    tag: "science",
    name: "Scientific Reasoning",
    icon: "🔬",
    short:
      "Domain knowledge in biology, chemistry, physics, and other sciences — with reasoning and explanation.",
    detail:
      "Science-capable models have been trained on scientific literature, textbooks, and research papers. They can explain concepts, solve problems, interpret data, and discuss research. Quality varies by domain — physics and chemistry tend to be stronger than biology and medicine in most models. For cutting-edge research questions, even the best models may give outdated or incorrect information. Always verify scientific claims.",
    examples: [
      "Explaining quantum mechanics concepts",
      "Balancing chemical equations",
      "Analyzing experimental data",
      "Literature review assistance",
    ],
    related: ["math", "reasoning", "research"],
  },
  {
    tag: "multimodal",
    name: "Multimodal",
    icon: "👁️",
    short:
      "Processes multiple input types — text plus images, audio, or video in a single prompt.",
    detail:
      "Multimodal models can understand and reason about images alongside text. You can send a photo and ask 'What's in this image?' or 'Extract the text from this screenshot'. Some models also handle audio or video. This enables use cases that pure text models can't do: analyzing charts, reading handwritten notes, describing photos, or understanding UI screenshots. Most multimodal models accept images as input but generate only text as output.",
    examples: [
      "Describing images",
      "Extracting text from photos (OCR)",
      "Analyzing charts and graphs",
      "Understanding UI screenshots",
    ],
    related: ["vision", "image-analysis"],
  },
  {
    tag: "vision",
    name: "Vision / Image Understanding",
    icon: "👀",
    short:
      "Processes visual inputs — analyzes images, screenshots, diagrams, and photos as part of the conversation.",
    detail:
      "Vision models convert images into a format the LLM can understand, then reason about their contents. Capabilities include: object recognition, scene description, text extraction (OCR), chart interpretation, spatial reasoning, and comparison between images. Quality depends on image resolution and the model's vision encoder. Not all LLMs have vision — look for 'vision' or 'multimodal' in the model name.",
    examples: [
      "Reading text from images",
      "Analyzing medical images",
      "Interpreting charts and diagrams",
      "Describing scene contents",
    ],
    related: ["multimodal", "image-analysis"],
  },
  {
    tag: "image-analysis",
    name: "Image Analysis",
    icon: "🖼️",
    short:
      "Detailed understanding and description of images — OCR, object detection, chart reading, spatial reasoning.",
    detail:
      "Image analysis goes beyond simple description — it involves extracting specific information from images. OCR (Optical Character Recognition) reads text in images. Object detection identifies and locates specific items. Chart reading interprets data visualizations. This is often combined with text prompts: 'How many people are in this photo?' or 'What does this error screenshot mean?'.",
    examples: [
      "OCR on documents and receipts",
      "Counting objects in images",
      "Reading charts and infographics",
      "Analyzing error screenshots",
    ],
    related: ["vision", "multimodal", "data-extraction"],
  },
  {
    tag: "analysis",
    name: "Data Analysis",
    icon: "📊",
    short:
      "Structured data interpretation — extracts insights, spots patterns, and summarizes findings from data.",
    detail:
      "Data analysis models help you understand datasets by identifying trends, anomalies, and key insights. They can interpret statistical results, suggest visualizations, write analysis reports, and explain findings to non-technical audiences. While they can't run code directly (unless combined with code execution tools), they can write analysis code (Python/pandas/SQL) and interpret results. For large datasets, they work best when you provide summary statistics rather than raw data.",
    examples: [
      "Interpreting survey results",
      "Analyzing sales trends",
      "Explaining statistical findings",
      "Writing data-driven reports",
    ],
    related: ["sql", "reasoning", "summarization"],
  },
  {
    tag: "sql",
    name: "SQL Generation",
    icon: "🗃️",
    short:
      "Generates and explains SQL queries from natural language — understands schemas, joins, aggregations.",
    detail:
      "SQL-capable models translate natural language questions into database queries. You describe your schema and ask 'How many users signed up last month?' and the model writes the SQL. They handle complex queries with joins, subqueries, window functions, and aggregations. Best practice: provide the schema (CREATE TABLE statements) in the prompt so the model knows your exact table and column names. Always review generated SQL before running on production databases.",
    examples: [
      "'Show top 10 customers by revenue' → SQL query",
      "Explaining complex existing queries",
      "Optimizing slow queries",
      "Generating reports from database",
    ],
    related: ["analysis", "data-extraction", "coding"],
  },
  {
    tag: "instruction-following",
    name: "Instruction Following",
    icon: "📋",
    short:
      "Precisely follows complex multi-step instructions and formatting constraints.",
    detail:
      "Instruction-following measures how well a model sticks to specific requirements: output format (JSON, markdown, bullet points), length constraints, style guidelines, multi-step procedures, and edge cases. This matters for production applications where consistent output format is critical. Models fine-tuned with RLHF and DPO tend to follow instructions better. Test with specific formatting requests — 'Respond in exactly 3 bullet points, each under 20 words'.",
    examples: [
      "Following specific output format requirements",
      "Multi-step task execution",
      "Adhering to style guides",
      "Consistent JSON output generation",
    ],
    related: ["function-calling", "classification", "agents"],
  },
  {
    tag: "research",
    name: "Research",
    icon: "🎓",
    short:
      "Deep investigation — literature review, fact synthesis, report generation from multiple sources.",
    detail:
      "Research-focused models help with deep investigation tasks: synthesizing information from multiple sources, writing literature reviews, comparing perspectives, identifying gaps in knowledge, and generating comprehensive reports. They benefit from large context windows (to process multiple papers) and strong reasoning (to synthesize findings). Best combined with RAG to pull from a curated knowledge base rather than relying on training data, which may be outdated.",
    examples: [
      "Literature review for a thesis",
      "Competitive analysis reports",
      "Policy research summaries",
      "Technology comparison reports",
    ],
    related: ["rag", "summarization", "reasoning", "science"],
  },
  {
    tag: "multilingual",
    name: "Multilingual",
    icon: "🌍",
    short:
      "Strong performance across many languages — beyond English, handles diverse scripts and language pairs.",
    detail:
      "Multilingual models are trained on text from many languages and can understand, generate, and translate between them. Quality varies by language — models typically perform best on languages well-represented in training data (English, Chinese, Spanish, French, German). For less common languages, look for models specifically trained on them. Qwen excels at Chinese, Llama is strong in European languages. Cross-lingual transfer means skills learned in one language often transfer to others.",
    examples: [
      "Multilingual customer support",
      "Cross-language search",
      "Translating between any language pair",
      "Generating content in multiple languages",
    ],
    related: ["translation", "chat"],
  },
  {
    tag: "edge",
    name: "Edge / Low-Resource",
    icon: "📱",
    short:
      "Optimized for limited hardware — phones, Raspberry Pi, embedded devices, IoT.",
    detail:
      "Edge models are designed to run on devices with very limited compute and memory: smartphones, single-board computers, embedded systems. They're typically small (0.5–3B parameters), heavily quantized, and optimized for specific tasks. Trade-off: less capable than larger models, but run anywhere without internet. Use cases include on-device translation, voice assistants, and local document processing. Frameworks: llama.cpp (CPU), MLC-LLM (mobile), TensorFlow Lite.",
    examples: [
      "Offline translation on phone",
      "Smart home voice assistant",
      "On-device document scanning",
      "Embedded IoT text processing",
    ],
    related: ["on-device", "classification"],
  },
  {
    tag: "on-device",
    name: "On-Device / Offline",
    icon: "📴",
    short:
      "Runs entirely on-device with no internet — privacy-first, offline-capable deployments.",
    detail:
      "On-device models require no internet connection and process everything locally. This is critical for: (1) Privacy — data never leaves the device, (2) Latency — no network round-trip, (3) Cost — no API fees, (4) Reliability — works without internet. The challenge is fitting a useful model into limited device memory. Quantization (Q4, Q2) and small model sizes (0.5–3B) make this possible. Apple's on-device models in iOS, Android's Gemini Nano, and llama.cpp all enable this.",
    examples: [
      "Private medical note processing",
      "Offline field data collection",
      "Air-gapped secure environments",
      "Mobile apps in areas with poor connectivity",
    ],
    related: ["edge", "classification"],
  },
  {
    tag: "debugging",
    name: "Debugging",
    icon: "🐛",
    short:
      "Diagnoses and fixes broken code — reads stack traces, understands error messages, suggests patches.",
    detail:
      "Debugging models help identify and fix software bugs. They can: read stack traces and pinpoint the error source, understand error messages and suggest fixes, trace code execution to find logic errors, and generate corrected code. This requires strong code understanding and reasoning. Larger models (7B+) are significantly better at debugging complex issues. Best practice: provide the error message, relevant code, and what you expected to happen.",
    examples: [
      "Reading and explaining stack traces",
      "Finding off-by-one errors",
      "Fixing type errors",
      "Diagnosing performance issues",
    ],
    related: ["coding", "code-review", "reasoning"],
  },
  {
    tag: "writing",
    name: "General Writing",
    icon: "📝",
    short:
      "Produces clear, well-structured prose — emails, essays, documentation, and reports.",
    detail:
      "Writing models help with any text production task that requires clarity and structure. Unlike creative writing (which emphasizes style), general writing focuses on communicating information effectively. This includes professional emails, technical documentation, essays, reports, and proposals. Models can match tone (formal, casual, technical), follow formatting guidelines, and adapt to different audiences.",
    examples: [
      "Professional email drafting",
      "Technical documentation",
      "Essay writing",
      "Proposal and report generation",
    ],
    related: ["creative-writing", "summarization", "text-generation"],
  },
  {
    tag: "text-generation",
    name: "Text Generation",
    icon: "📃",
    short:
      "General-purpose text output — drafts, expansions, completions, and open-ended generation.",
    detail:
      "Text generation is the broadest category — the model produces text based on a prompt. This covers everything from completing a sentence to generating entire articles. It's the foundational capability that all other use cases build on. If a model is good at text generation, it has the basic ability to do most language tasks. Temperature controls randomness: low (0.1–0.3) for factual, high (0.7–1.0) for creative.",
    examples: [
      "Completing partial text",
      "Expanding bullet points into paragraphs",
      "Generating product descriptions",
      "Creating template content",
    ],
    related: ["writing", "creative-writing", "chat"],
  },
  {
    tag: "general",
    name: "General Purpose",
    icon: "🎪",
    short:
      "Well-rounded model — handles many tasks reasonably well without specializing in any one.",
    detail:
      "General-purpose models are jacks-of-all-trades. They can chat, write code, answer questions, summarize, translate, and reason — but may not be the absolute best at any single task. This is often the right choice when you need one model for multiple use cases or aren't sure which specialized model you need yet. Most popular chat models (Llama 3, Qwen 2.5, Mistral) are general-purpose.",
    examples: [
      "Personal AI assistant",
      "Multi-purpose chatbot",
      "Prototyping different use cases",
      "When you need one model for everything",
    ],
    related: ["chat", "instruction-following", "reasoning"],
  },
  {
    tag: "data",
    name: "Data Processing",
    icon: "🗂️",
    short:
      "Working with structured and unstructured data — parsing, transforming, cleaning, and enriching datasets.",
    detail:
      "Data processing models help with the unglamorous but essential work of preparing data: cleaning messy inputs, standardizing formats, filling missing values, categorizing records, and transforming between formats (CSV → JSON, XML → structured data). They can write data transformation scripts, validate data quality, and generate synthetic data for testing.",
    examples: [
      "Cleaning and standardizing address data",
      "Converting between data formats",
      "Generating synthetic test data",
      "Data quality validation",
    ],
    related: ["data-extraction", "sql", "coding"],
  },
  {
    tag: "architecture",
    name: "Software Architecture",
    icon: "🏗️",
    short:
      "System design guidance — API design, database schema, microservices, and codebase organization.",
    detail:
      "Architecture-focused models help with high-level software design decisions: choosing between monolith and microservices, designing API contracts, planning database schemas, selecting technology stacks, and organizing large codebases. This requires broad knowledge of design patterns, trade-offs, and real-world experience. Larger models with strong reasoning tend to give better architectural advice. Always combine with your own domain knowledge.",
    examples: [
      "System design for a new service",
      "API design review",
      "Database schema planning",
      "Migration strategy from monolith to microservices",
    ],
    related: ["coding", "reasoning"],
  },
];

type Category =
  | "all"
  | "language"
  | "code"
  | "data"
  | "reasoning"
  | "media"
  | "deployment";

const CATEGORIES: { key: Category; label: string; tags: string[] }[] = [
  { key: "all", label: "All", tags: [] },
  {
    key: "language",
    label: "Language & Writing",
    tags: [
      "chat",
      "creative-writing",
      "writing",
      "text-generation",
      "summarization",
      "translation",
      "multilingual",
      "instruction-following",
    ],
  },
  {
    key: "code",
    label: "Code & Dev",
    tags: [
      "coding",
      "code-completion",
      "code-review",
      "debugging",
      "sql",
      "architecture",
    ],
  },
  {
    key: "data",
    label: "Data & Extraction",
    tags: [
      "rag",
      "document-qa",
      "data-extraction",
      "classification",
      "analysis",
      "data",
      "function-calling",
    ],
  },
  {
    key: "reasoning",
    label: "Reasoning & Science",
    tags: [
      "reasoning",
      "chain-of-thought",
      "math",
      "science",
      "research",
      "agents",
    ],
  },
  {
    key: "media",
    label: "Vision & Multimodal",
    tags: ["multimodal", "vision", "image-analysis"],
  },
  {
    key: "deployment",
    label: "Deployment",
    tags: ["edge", "on-device", "general"],
  },
];

export function Glossary() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = USE_CASE_TERMS.filter((t) => {
    const matchSearch =
      search === "" ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.tag.toLowerCase().includes(search.toLowerCase()) ||
      t.short.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      category === "all" ||
      CATEGORIES.find((c) => c.key === category)?.tags.includes(t.tag);
    return matchSearch && matchCategory;
  });

  return (
    <div>
      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400"
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
            type="text"
            placeholder="Search terms... (e.g., RAG, coding, quantization)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-300 dark:focus:ring-brand-accent"
          />
        </div>
      </div>

      <div className="flex gap-1.5 flex-wrap mb-6">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              category === c.key
                ? "bg-brand-300 text-white dark:bg-brand-accent dark:text-zinc-900"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-zinc-400 mb-4">
        {filtered.length} terms found
      </p>

      {/* Term cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((t) => {
          const isOpen = expanded === t.tag;
          return (
            <div
              key={t.tag}
              className={`rounded-2xl border p-4 transition-all ${
                isOpen
                  ? "border-brand-300 dark:border-brand-accent bg-white dark:bg-zinc-900 shadow-md col-span-1 md:col-span-2"
                  : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-brand-200 dark:hover:border-brand-accent/50 hover:shadow-sm"
              }`}
            >
              <button
                onClick={() => setExpanded(isOpen ? null : t.tag)}
                className="w-full text-left cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5">{t.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {t.name}
                      </h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-500/20 text-brand-400 dark:text-brand-accent font-mono">
                        {t.tag}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                      {t.short}
                    </p>
                  </div>
                  <svg
                    className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
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
              </button>

              {isOpen && (
                <div className="mt-4 pl-11 space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide mb-2">
                      Detailed explanation
                    </h4>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {t.detail}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide mb-2">
                      Example use cases
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {t.examples.map((ex, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400"
                        >
                          <span className="text-brand-accent mt-0.5">▸</span>
                          {ex}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide mb-2">
                      Related tags
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {t.related.map((r) => (
                        <button
                          key={r}
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpanded(r);
                            setSearch("");
                            setCategory("all");
                          }}
                          className="text-xs px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-brand-50 dark:hover:bg-brand-500/20 hover:text-brand-400 dark:hover:text-brand-accent transition-colors cursor-pointer"
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-zinc-400">
          <p className="text-lg mb-1">No matching terms</p>
          <p className="text-sm">Try a different search or category</p>
        </div>
      )}
    </div>
  );
}
