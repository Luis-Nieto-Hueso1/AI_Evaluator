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
  // Root
  {
    id: "start",
    label: "Need deep\nlearning?",
    question: "Does your task require deep learning (neural networks)?",
    yes: "dl_task",
    no: "classical",
    x: 505,
    y: 30,
  },

  // Classical ML branch
  {
    id: "classical",
    label: "Tabular\ndata?",
    question: "Are you working with tabular/structured data?",
    yes: "tabular_prod",
    no: "classical_other",
    x: 260,
    y: 130,
  },
  {
    id: "tabular_prod",
    label: "Production\nready?",
    question: "Do you need production-grade deployment?",
    yes: "sklearn_result",
    no: "learning_check",
    x: 148,
    y: 230,
  },
  {
    id: "sklearn_result",
    label: "scikit-learn",
    result: "scikit-learn — mature, batteries-included ML library",
    x: 80,
    y: 330,
  },
  {
    id: "learning_check",
    label: "Just\nlearning?",
    question: "Are you a beginner just getting started with ML?",
    yes: "sklearn_learn",
    no: "xgboost_result",
    x: 215,
    y: 330,
  },
  {
    id: "sklearn_learn",
    label: "scikit-learn",
    result: "scikit-learn — best for learning ML fundamentals",
    x: 145,
    y: 430,
  },
  {
    id: "xgboost_result",
    label: "XGBoost /\nLightGBM",
    result: "XGBoost or LightGBM — top performance on tabular data",
    x: 285,
    y: 430,
  },
  {
    id: "classical_other",
    label: "Scientific\ncomputing?",
    question: "Are you doing scientific computing or numerical methods?",
    yes: "jax_sci",
    no: "dl_task",
    x: 375,
    y: 230,
  },
  {
    id: "jax_sci",
    label: "JAX",
    result: "JAX — high-performance numerical computing with autograd",
    x: 375,
    y: 330,
  },

  // Deep learning branch
  {
    id: "dl_task",
    label: "NLP or\nGenerative?",
    question: "Is your task NLP, text generation, or LLM-related?",
    yes: "nlp_branch",
    no: "cv_check",
    x: 750,
    y: 130,
  },
  {
    id: "nlp_branch",
    label: "Fine-tuning\npretrained?",
    question: "Are you fine-tuning a pretrained model (e.g., BERT, LLaMA)?",
    yes: "hf_result",
    no: "train_scratch",
    x: 585,
    y: 230,
  },
  {
    id: "hf_result",
    label: "HuggingFace\nTransformers",
    result: "HuggingFace Transformers — easiest pretrained model workflow",
    x: 510,
    y: 330,
  },
  {
    id: "train_scratch",
    label: "Large\nteam?",
    question: "Do you have a large engineering team (10+)?",
    yes: "pt_large",
    no: "pt_solo",
    x: 660,
    y: 330,
  },
  {
    id: "pt_large",
    label: "PyTorch",
    result: "PyTorch — most flexible, dominant in research & industry",
    x: 595,
    y: 430,
  },
  {
    id: "pt_solo",
    label: "PyTorch +\nLightning",
    result: "PyTorch Lightning — reduces boilerplate for small teams",
    x: 725,
    y: 430,
  },

  // CV branch
  {
    id: "cv_check",
    label: "Computer\nvision?",
    question: "Is your task computer vision (images, video)?",
    yes: "cv_prod",
    no: "other_dl",
    x: 1050,
    y: 230,
  },
  {
    id: "cv_prod",
    label: "Need\nproduction?",
    question: "Do you need production deployment at scale?",
    yes: "tf_result",
    no: "pt_cv",
    x: 920,
    y: 330,
  },
  {
    id: "tf_result",
    label: "TensorFlow /\nKeras",
    result: "TensorFlow + Keras — strong production ecosystem for CV",
    x: 855,
    y: 430,
  },
  {
    id: "pt_cv",
    label: "PyTorch +\ntorchvision",
    result: "PyTorch + torchvision — research-first CV framework",
    x: 985,
    y: 430,
  },

  // Other DL
  {
    id: "other_dl",
    label: "Research\nfocus?",
    question: "Is this primarily for research / cutting-edge experiments?",
    yes: "jax_dl",
    no: "tf_general",
    x: 1180,
    y: 330,
  },
  {
    id: "jax_dl",
    label: "JAX / Flax",
    result: "JAX + Flax — functional style, great for research",
    x: 1115,
    y: 430,
  },
  {
    id: "tf_general",
    label: "TensorFlow /\nKeras",
    result: "TensorFlow + Keras — general-purpose, great deployment story",
    x: 1245,
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
const W = 1350;
const H = 500;
const NW = 110;
const NH = 44;

export function FrameworkFlowchart() {
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
      {/* Controls */}
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

      {/* SVG */}
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
