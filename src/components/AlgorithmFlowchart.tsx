import { useState, useCallback } from "react";

// Decision tree nodes mirroring the scikit-learn cheat sheet
interface FlowNode {
  id: string;
  label: string;
  question?: string;
  yes?: string; // id of yes-child
  no?: string; // id of no-child
  result?: string; // algorithm recommendation
  x: number;
  y: number;
}

const NODES: FlowNode[] = [
  // Root
  {
    id: "start",
    label: "> 50 samples?",
    question: "Do you have more than 50 samples?",
    yes: "predict",
    no: "more_data",
    x: 400,
    y: 30,
  },
  {
    id: "more_data",
    label: "Get more data",
    result: "Get more data",
    x: 150,
    y: 110,
  },

  // Predict category or quantity?
  {
    id: "predict",
    label: "Predicting a\ncategory?",
    question: "Are you predicting a category (classification)?",
    yes: "labeled_cls",
    no: "predict_qty",
    x: 400,
    y: 130,
  },

  // Classification branch
  {
    id: "labeled_cls",
    label: "Have labeled\ndata?",
    question: "Do you have labeled training data?",
    yes: "cls_size",
    no: "clustering",
    x: 250,
    y: 230,
  },
  {
    id: "cls_size",
    label: "> 100K\nsamples?",
    question: "Do you have more than 100K samples?",
    yes: "sgd_cls",
    no: "cls_few_features",
    x: 150,
    y: 330,
  },
  {
    id: "sgd_cls",
    label: "SGD Classifier\nor Linear SVC",
    result: "SGD Classifier / Linear SVC",
    x: 50,
    y: 430,
  },
  {
    id: "cls_few_features",
    label: "Few features\nimportant?",
    question: "Are only a few features important (interpretability)?",
    yes: "cls_interp",
    no: "cls_complex",
    x: 220,
    y: 430,
  },
  {
    id: "cls_interp",
    label: "Logistic Regression\nor Naive Bayes",
    result: "Logistic Regression / Naive Bayes",
    x: 120,
    y: 530,
  },
  {
    id: "cls_complex",
    label: "SVM or\nEnsemble?",
    question: "Do you need the very best accuracy (ensemble) or SVM?",
    yes: "ensemble_cls",
    no: "svm_knn",
    x: 320,
    y: 530,
  },
  {
    id: "ensemble_cls",
    label: "Random Forest\nor XGBoost",
    result: "Random Forest / XGBoost",
    x: 240,
    y: 630,
  },
  { id: "svm_knn", label: "SVM or KNN", result: "SVM / KNN", x: 410, y: 630 },

  // Clustering branch
  {
    id: "clustering",
    label: "Know #\nclusters?",
    question: "Do you know the number of clusters?",
    yes: "kmeans",
    no: "density_cl",
    x: 380,
    y: 330,
  },
  { id: "kmeans", label: "K-Means", result: "K-Means", x: 340, y: 430 },
  {
    id: "density_cl",
    label: "DBSCAN or\nMean Shift",
    result: "DBSCAN / Mean Shift",
    x: 450,
    y: 430,
  },

  // Regression / Dim-reduction branch
  {
    id: "predict_qty",
    label: "Predicting a\nquantity?",
    question: "Are you predicting a continuous number (regression)?",
    yes: "reg_branch",
    no: "dimred",
    x: 580,
    y: 230,
  },
  {
    id: "reg_branch",
    label: "> 100K\nsamples?",
    question: "Do you have more than 100K samples?",
    yes: "sgd_reg",
    no: "reg_few",
    x: 520,
    y: 330,
  },
  {
    id: "sgd_reg",
    label: "SGD Regressor\nor Ridge",
    result: "SGD Regressor / Ridge Regression",
    x: 470,
    y: 430,
  },
  {
    id: "reg_few",
    label: "Few features\nimportant?",
    question: "Do you need interpretable coefficients?",
    yes: "lasso_elasticnet",
    no: "reg_ensemble",
    x: 600,
    y: 430,
  },
  {
    id: "lasso_elasticnet",
    label: "Lasso /\nElasticNet",
    result: "Lasso / ElasticNet",
    x: 550,
    y: 530,
  },
  {
    id: "reg_ensemble",
    label: "Random Forest\nor GBR",
    result: "Random Forest Regressor / Gradient Boosting",
    x: 700,
    y: 530,
  },

  // Dim reduction
  {
    id: "dimred",
    label: "Visualizing\nstructure?",
    question: "Are you trying to visualize or reduce dimensions?",
    yes: "dimred_size",
    no: "just_looking",
    x: 720,
    y: 330,
  },
  {
    id: "dimred_size",
    label: "< 10K\nsamples?",
    question: "Do you have fewer than 10K samples?",
    yes: "tsne_umap",
    no: "pca",
    x: 680,
    y: 430,
  },
  {
    id: "tsne_umap",
    label: "t-SNE /\nUMAP",
    result: "t-SNE / UMAP",
    x: 630,
    y: 530,
  },
  {
    id: "pca",
    label: "PCA / Kernel\nPCA",
    result: "PCA / Kernel PCA",
    x: 770,
    y: 530,
  },
  {
    id: "just_looking",
    label: "Explore with\nPCA first",
    result: "Start with PCA for exploration",
    x: 800,
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
const W = 870;
const H = 680;
const NW = 110;
const NH = 44;

function buildShareUrl(path: string[]): string {
  const params = new URLSearchParams(window.location.search);
  params.set("flowpath", path.join(","));
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
}

function parseShareUrl(): string[] {
  try {
    const p = new URLSearchParams(window.location.search);
    const val = p.get("flowpath");
    if (val) return val.split(",").filter(Boolean);
  } catch {}
  return [];
}

export function AlgorithmFlowchart() {
  const initial = parseShareUrl();
  const [path, setPath] = useState<string[]>(
    initial.length > 0 ? initial : ["start"],
  );
  const [shareCopied, setShareCopied] = useState(false);

  const current = path[path.length - 1];
  const currentNode = NODE_MAP.get(current);
  const pathSet = new Set(path);

  const handleClick = useCallback(
    (nodeId: string) => {
      const node = NODE_MAP.get(nodeId);
      if (!node) return;

      // If clicking a node already in path, backtrack to it
      const idx = path.indexOf(nodeId);
      if (idx >= 0) {
        setPath(path.slice(0, idx + 1));
        return;
      }

      // Only allow clicking direct children of current node
      if (currentNode?.yes === nodeId || currentNode?.no === nodeId) {
        const newPath = [...path, nodeId];
        setPath(newPath);
        // Update URL
        const params = new URLSearchParams(window.location.search);
        params.set("flowpath", newPath.join(","));
        window.history.replaceState(null, "", `?${params.toString()}`);
      }
    },
    [path, currentNode],
  );

  function reset() {
    setPath(["start"]);
    const params = new URLSearchParams(window.location.search);
    params.delete("flowpath");
    const qs = params.toString();
    window.history.replaceState(
      null,
      "",
      qs ? `?${qs}` : window.location.pathname,
    );
  }

  function handleShare() {
    navigator.clipboard.writeText(buildShareUrl(path)).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 1500);
    });
  }

  // Determine which edges are on the active path
  const activeEdges = new Set<string>();
  for (let i = 0; i < path.length - 1; i++) {
    activeEdges.add(`${path[i]}->${path[i + 1]}`);
  }

  // Which nodes are clickable next
  const clickableNext = new Set<string>();
  if (currentNode && !currentNode.result) {
    if (currentNode.yes) clickableNext.add(currentNode.yes);
    if (currentNode.no) clickableNext.add(currentNode.no);
  }

  return (
    <div>
      {/* Controls */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        {currentNode?.question && !currentNode.result && (
          <p className="text-sm font-medium text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 px-3 py-1.5 rounded-lg">
            {currentNode.question}
          </p>
        )}
        {currentNode?.result && (
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg">
            Recommendation: {currentNode.result}
          </p>
        )}
        <div className="ml-auto flex gap-2">
          {path.length > 1 && (
            <button
              onClick={() => {
                const newPath = path.slice(0, -1);
                setPath(newPath);
              }}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer font-medium"
            >
              Back
            </button>
          )}
          {path.length > 1 && (
            <button
              onClick={reset}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer font-medium"
            >
              Reset
            </button>
          )}
          <button
            onClick={handleShare}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer font-medium"
          >
            {shareCopied ? "Copied!" : "Share path"}
          </button>
        </div>
      </div>

      {/* SVG Flowchart */}
      <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full min-w-[700px]"
          style={{ maxHeight: "70vh" }}
        >
          {/* Edges */}
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
                {/* Edge label */}
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

          {/* Nodes */}
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
