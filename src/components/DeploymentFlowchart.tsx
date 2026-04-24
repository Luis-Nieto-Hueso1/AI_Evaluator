import { useState, useCallback } from "react";

interface FlowNode {
  id: string;
  label: string;
  question?: string;
  yes?: string;
  no?: string;
  result?: string;
  x: number;
  y: number;
}

const NODES: FlowNode[] = [
  {
    id: "start",
    label: "Have a\nGPU?",
    question: "Do you have a dedicated GPU available?",
    yes: "gpu_local",
    no: "no_gpu",
    x: 625,
    y: 30,
  },

  // GPU branch
  {
    id: "gpu_local",
    label: "Local or\ncloud?",
    question: "Is the GPU on your local machine or in the cloud?",
    yes: "local_gpu",
    no: "cloud_gpu",
    x: 305,
    y: 130,
  },
  {
    id: "local_gpu",
    label: "Need max\nspeed?",
    question: "Is maximum inference speed your top priority?",
    yes: "vllm_result",
    no: "local_flex",
    x: 145,
    y: 230,
  },
  {
    id: "vllm_result",
    label: "vLLM",
    result: "vLLM — fastest GPU inference with paged attention",
    x: 80,
    y: 330,
  },
  {
    id: "local_flex",
    label: "Easy\nsetup?",
    question: "Do you prefer the easiest setup over max flexibility?",
    yes: "ollama_gpu",
    no: "tgi_result",
    x: 210,
    y: 330,
  },
  {
    id: "ollama_gpu",
    label: "Ollama",
    result: "Ollama — one-command setup, GPU auto-detected",
    x: 145,
    y: 430,
  },
  {
    id: "tgi_result",
    label: "TGI",
    result: "Text Generation Inference — flexible GPU serving by HuggingFace",
    x: 275,
    y: 430,
  },
  {
    id: "cloud_gpu",
    label: "Multi-model\nserving?",
    question: "Do you need to serve multiple models from one endpoint?",
    yes: "triton_result",
    no: "cloud_simple",
    x: 465,
    y: 230,
  },
  {
    id: "triton_result",
    label: "Triton\nInference",
    result: "NVIDIA Triton — enterprise multi-model serving",
    x: 400,
    y: 330,
  },
  {
    id: "cloud_simple",
    label: "Auto-scaling\nneeded?",
    question: "Do you need auto-scaling and managed infrastructure?",
    yes: "managed_result",
    no: "vllm_cloud",
    x: 530,
    y: 330,
  },
  {
    id: "managed_result",
    label: "SageMaker /\nVertex AI",
    result: "AWS SageMaker or GCP Vertex AI — managed ML deployment",
    x: 465,
    y: 430,
  },
  {
    id: "vllm_cloud",
    label: "vLLM\n(Docker)",
    result: "vLLM in Docker — self-hosted cloud GPU serving",
    x: 595,
    y: 430,
  },

  // No GPU branch
  {
    id: "no_gpu",
    label: "Edge /\nembedded?",
    question: "Are you deploying to edge devices (Raspberry Pi, mobile)?",
    yes: "edge_branch",
    no: "cpu_branch",
    x: 945,
    y: 130,
  },
  {
    id: "edge_branch",
    label: "Mobile\napp?",
    question: "Is this for a mobile app (iOS/Android)?",
    yes: "mlc_result",
    no: "llamacpp_edge",
    x: 1105,
    y: 230,
  },
  {
    id: "mlc_result",
    label: "MLC LLM",
    result: "MLC LLM — optimized for mobile and edge deployment",
    x: 1040,
    y: 330,
  },
  {
    id: "llamacpp_edge",
    label: "llama.cpp",
    result: "llama.cpp — lightweight C++ inference, runs anywhere",
    x: 1170,
    y: 330,
  },
  {
    id: "cpu_branch",
    label: "Easiest\nsetup?",
    question: "Do you want the simplest one-command setup?",
    yes: "ollama_cpu",
    no: "cpu_flex",
    x: 785,
    y: 230,
  },
  {
    id: "ollama_cpu",
    label: "Ollama",
    result: "Ollama — simplest local setup, great CPU support",
    x: 720,
    y: 330,
  },
  {
    id: "cpu_flex",
    label: "Need GGUF\nquants?",
    question: "Do you need quantized GGUF model support?",
    yes: "llamacpp_cpu",
    no: "ctrans_result",
    x: 850,
    y: 330,
  },
  {
    id: "llamacpp_cpu",
    label: "llama.cpp",
    result: "llama.cpp — best GGUF quantization support on CPU",
    x: 785,
    y: 430,
  },
  {
    id: "ctrans_result",
    label: "CTranslate2",
    result: "CTranslate2 — fast CPU inference with INT8 quantization",
    x: 915,
    y: 430,
  },
];

const NODE_MAP = new Map(NODES.map((n) => [n.id, n]));

function getEdges(): { from: FlowNode; to: FlowNode; label: string }[] {
  const edges: { from: FlowNode; to: FlowNode; label: string }[] = [];
  for (const node of NODES) {
    if (node.yes) {
      const target = NODE_MAP.get(node.yes);
      if (target) edges.push({ from: node, to: target, label: "Yes" });
    }
    if (node.no) {
      const target = NODE_MAP.get(node.no);
      if (target) edges.push({ from: node, to: target, label: "No" });
    }
  }
  return edges;
}

const EDGES = getEdges();
const W = 1250;
const H = 500;
const NW = 110;
const NH = 44;

export function DeploymentFlowchart() {
  const [path, setPath] = useState<string[]>(["start"]);

  const current = path[path.length - 1];
  const currentNode = NODE_MAP.get(current);
  const pathSet = new Set(path);

  const handleClick = useCallback(
    (nodeId: string) => {
      const node = NODE_MAP.get(nodeId);
      if (!node) return;
      const idx = path.indexOf(nodeId);
      if (idx >= 0) {
        setPath(path.slice(0, idx + 1));
        return;
      }
      if (currentNode?.yes === nodeId || currentNode?.no === nodeId) {
        setPath([...path, nodeId]);
      }
    },
    [path, currentNode],
  );

  const activeEdges = new Set<string>();
  for (let i = 0; i < path.length - 1; i++) {
    activeEdges.add(`${path[i]}->${path[i + 1]}`);
  }

  const clickableNext = new Set<string>();
  if (currentNode && !currentNode.result) {
    if (currentNode.yes) clickableNext.add(currentNode.yes);
    if (currentNode.no) clickableNext.add(currentNode.no);
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        {currentNode?.question && !currentNode.result && (
          <p className="text-sm font-medium text-brand-400 dark:text-brand-accent bg-brand-50 dark:bg-brand-500/20 px-3 py-1.5 rounded-lg">
            {currentNode.question}
          </p>
        )}
        {currentNode?.result && (
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg">
            Recommendation: {currentNode.result}
          </p>
        )}
        {path.length > 1 && (
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => setPath(path.slice(0, -1))}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer font-medium"
            >
              Back
            </button>
            <button
              onClick={() => setPath(["start"])}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer font-medium"
            >
              Reset
            </button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full min-w-[700px]"
          style={{ maxHeight: "60vh" }}
        >
          {EDGES.map((edge, i) => {
            const key = `${edge.from.id}->${edge.to.id}`;
            const isActive = activeEdges.has(key);
            const x1 = edge.from.x;
            const y1 = edge.from.y + NH;
            const x2 = edge.to.x;
            const y2 = edge.to.y;
            const midY = (y1 + y2) / 2;
            return (
              <g key={i}>
                <path
                  d={`M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`}
                  fill="none"
                  stroke={isActive ? "#8b5cf6" : "currentColor"}
                  strokeWidth={isActive ? 2.5 : 1}
                  opacity={isActive ? 1 : 0.15}
                  className="text-zinc-400 dark:text-zinc-600"
                />
                <text
                  x={(x1 + x2) / 2 + (edge.label === "Yes" ? -12 : 12)}
                  y={midY - 2}
                  textAnchor="middle"
                  fontSize="9"
                  fill={isActive ? "#8b5cf6" : "currentColor"}
                  opacity={isActive ? 1 : 0.3}
                  className="text-zinc-500 dark:text-zinc-400 select-none"
                  fontWeight={isActive ? "bold" : "normal"}
                >
                  {edge.label}
                </text>
              </g>
            );
          })}

          {NODES.map((node) => {
            const isOnPath = pathSet.has(node.id);
            const isCurrent = node.id === current;
            const isClickable =
              clickableNext.has(node.id) || pathSet.has(node.id);
            const isResult = Boolean(node.result);
            const lines = node.label.split("\n");

            let fill = "white";
            let stroke = "#d4d4d8";
            let textFill = "#3f3f46";

            if (isCurrent && isResult) {
              fill = "#ecfdf5";
              stroke = "#34d399";
              textFill = "#047857";
            } else if (isCurrent) {
              fill = "#f5f3ff";
              stroke = "#8b5cf6";
              textFill = "#6d28d9";
            } else if (isOnPath) {
              fill = "#ede9fe";
              stroke = "#a78bfa";
              textFill = "#5b21b6";
            } else if (clickableNext.has(node.id)) {
              fill = "#fafafa";
              stroke = "#a1a1aa";
              textFill = "#52525b";
            }

            return (
              <g
                key={node.id}
                onClick={() => isClickable && handleClick(node.id)}
                className={isClickable ? "cursor-pointer" : ""}
                opacity={isOnPath || clickableNext.has(node.id) ? 1 : 0.4}
              >
                <rect
                  x={node.x - NW / 2}
                  y={node.y}
                  width={NW}
                  height={NH}
                  rx={isResult ? 14 : 8}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={isCurrent ? 2.5 : 1.5}
                />
                {clickableNext.has(node.id) && !isOnPath && (
                  <rect
                    x={node.x - NW / 2}
                    y={node.y}
                    width={NW}
                    height={NH}
                    rx={isResult ? 14 : 8}
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth={1.5}
                    strokeDasharray="4,3"
                    opacity={0.5}
                  />
                )}
                {lines.map((line, li) => (
                  <text
                    key={li}
                    x={node.x}
                    y={node.y + NH / 2 + (li - (lines.length - 1) / 2) * 12}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={isResult ? "9" : "10"}
                    fontWeight={isCurrent ? "bold" : isOnPath ? "600" : "500"}
                    fill={textFill}
                    className="select-none pointer-events-none"
                  >
                    {line}
                  </text>
                ))}
              </g>
            );
          })}
        </svg>
      </div>
      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-3 text-center">
        Click the highlighted options to navigate. Click any visited node to
        backtrack.
      </p>
    </div>
  );
}
