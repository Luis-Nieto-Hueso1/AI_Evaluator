import { useState, useMemo, useEffect } from "react";
import algorithmsRaw from "../data/algorithms.json";
import { AlgoAdvisorChat } from "./AlgoAdvisorChat";

type TaskType =
  | "classification"
  | "regression"
  | "clustering"
  | "dimensionality_reduction"
  | "time_series";
type DataSize = "small" | "medium" | "large";
type Interpretability = "high" | "medium" | "low";
type FeatureCount = "few" | "many";

interface Algorithm {
  id: string;
  name: string;
  tasks: string[];
  interpretable: boolean;
  highDimOk: boolean;
  smallData: number;
  mediumData: number;
  largeData: number;
  requiresLabels: boolean;
  useCases: string[];
  pros: string[];
  cons: string[];
  trainComplexity: string;
  inferenceComplexity: string;
  docsUrl: string;
  sklearnSnippet?: string;
  visualType: string;
}

const ALGORITHMS = algorithmsRaw as Algorithm[];

const TASK_OPTIONS: {
  value: TaskType;
  label: string;
  desc: string;
  icon: string;
}[] = [
  {
    value: "classification",
    label: "Classification",
    desc: "Predict a category or label",
    icon: "🏷️",
  },
  {
    value: "regression",
    label: "Regression",
    desc: "Predict a continuous number",
    icon: "📈",
  },
  {
    value: "clustering",
    label: "Clustering",
    desc: "Group similar data points",
    icon: "🫧",
  },
  {
    value: "dimensionality_reduction",
    label: "Dim. Reduction",
    desc: "Compress or visualize features",
    icon: "🔻",
  },
  {
    value: "time_series",
    label: "Time Series",
    desc: "Forecast sequences over time",
    icon: "🕐",
  },
];

const SIZE_OPTIONS: { value: DataSize; label: string; desc: string }[] = [
  { value: "small", label: "Small", desc: "< 1 000 samples" },
  { value: "medium", label: "Medium", desc: "1 K – 100 K samples" },
  { value: "large", label: "Large", desc: "> 100 000 samples" },
];

const INTERP_OPTIONS: {
  value: Interpretability;
  label: string;
  desc: string;
}[] = [
  {
    value: "high",
    label: "Critical",
    desc: "Must explain predictions to stakeholders",
  },
  {
    value: "medium",
    label: "Nice to have",
    desc: "Feature importance is useful",
  },
  { value: "low", label: "Not needed", desc: "Black-box accuracy is fine" },
];

const FEATURE_OPTIONS: { value: FeatureCount; label: string; desc: string }[] =
  [
    { value: "few", label: "Few", desc: "< 20 features" },
    { value: "many", label: "Many", desc: "20+ features" },
  ];

function scoreAlgorithm(
  algo: Algorithm,
  size: DataSize,
  interp: Interpretability,
  features: FeatureCount,
): number {
  let score = 0;

  // Dataset size fit (0-30)
  const sizeFit =
    size === "small"
      ? algo.smallData
      : size === "medium"
        ? algo.mediumData
        : algo.largeData;
  score += sizeFit * 10;

  // Interpretability fit (0-25)
  if (interp === "high") score += algo.interpretable ? 25 : 0;
  else if (interp === "medium") score += algo.interpretable ? 15 : 8;
  else score += algo.interpretable ? 5 : 15;

  // Feature dimensionality (0-20)
  if (features === "many") score += algo.highDimOk ? 20 : 0;
  else score += algo.highDimOk ? 8 : 20;

  return score;
}

interface Scored {
  algo: Algorithm;
  score: number;
}

function AlgorithmVisual({
  visualType,
  className,
}: {
  visualType: string;
  className?: string;
}) {
  switch (visualType) {
    case "scatter_line":
      return (
        <svg viewBox="0 0 120 80" className={className}>
          {/* axis lines */}
          <line
            x1="10"
            y1="70"
            x2="115"
            y2="70"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.2"
          />
          <line
            x1="10"
            y1="70"
            x2="10"
            y2="5"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.2"
          />
          {/* trend line */}
          <line
            x1="12"
            y1="65"
            x2="112"
            y2="12"
            stroke="#8b5cf6"
            strokeWidth="2"
          />
          {/* scatter dots */}
          {[
            [20, 60],
            [32, 52],
            [44, 45],
            [55, 38],
            [65, 32],
            [78, 26],
            [90, 20],
            [100, 15],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="3" fill="#60a5fa" opacity="0.8" />
          ))}
          {/* off-line dots */}
          {[
            [28, 44],
            [62, 48],
            [85, 14],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="3" fill="#60a5fa" opacity="0.4" />
          ))}
        </svg>
      );

    case "sigmoid":
      return (
        <svg viewBox="0 0 120 80" className={className}>
          <line
            x1="10"
            y1="40"
            x2="110"
            y2="40"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.15"
          />
          <line
            x1="60"
            y1="5"
            x2="60"
            y2="75"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.15"
          />
          <path
            d="M 10 72 C 20 72 35 70 45 65 C 55 58 58 50 60 40 C 62 30 65 22 75 15 C 85 10 100 8 110 8"
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="2.5"
          />
          {/* class dots */}
          {[
            [15, 74],
            [22, 73],
            [30, 71],
            [38, 68],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="2.5" fill="#60a5fa" />
          ))}
          {[
            [80, 12],
            [88, 10],
            [96, 9],
            [105, 8],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="2.5" fill="#f87171" />
          ))}
        </svg>
      );

    case "tree":
      return (
        <svg viewBox="0 0 120 80" className={className}>
          {/* root */}
          <rect
            x="42"
            y="4"
            width="36"
            height="16"
            rx="3"
            fill="#8b5cf6"
            opacity="0.8"
          />
          {/* level 1 */}
          <rect
            x="14"
            y="32"
            width="36"
            height="16"
            rx="3"
            fill="#60a5fa"
            opacity="0.7"
          />
          <rect
            x="70"
            y="32"
            width="36"
            height="16"
            rx="3"
            fill="#60a5fa"
            opacity="0.7"
          />
          {/* leaves */}
          <rect
            x="4"
            y="60"
            width="24"
            height="14"
            rx="3"
            fill="#34d399"
            opacity="0.7"
          />
          <rect
            x="32"
            y="60"
            width="24"
            height="14"
            rx="3"
            fill="#f87171"
            opacity="0.7"
          />
          <rect
            x="60"
            y="60"
            width="24"
            height="14"
            rx="3"
            fill="#34d399"
            opacity="0.7"
          />
          <rect
            x="88"
            y="60"
            width="24"
            height="14"
            rx="3"
            fill="#34d399"
            opacity="0.7"
          />
          {/* edges */}
          <line
            x1="60"
            y1="20"
            x2="32"
            y2="32"
            stroke="currentColor"
            strokeWidth="1.5"
            opacity="0.3"
          />
          <line
            x1="60"
            y1="20"
            x2="88"
            y2="32"
            stroke="currentColor"
            strokeWidth="1.5"
            opacity="0.3"
          />
          <line
            x1="32"
            y1="48"
            x2="16"
            y2="60"
            stroke="currentColor"
            strokeWidth="1.5"
            opacity="0.3"
          />
          <line
            x1="32"
            y1="48"
            x2="44"
            y2="60"
            stroke="currentColor"
            strokeWidth="1.5"
            opacity="0.3"
          />
          <line
            x1="88"
            y1="48"
            x2="72"
            y2="60"
            stroke="currentColor"
            strokeWidth="1.5"
            opacity="0.3"
          />
          <line
            x1="88"
            y1="48"
            x2="100"
            y2="60"
            stroke="currentColor"
            strokeWidth="1.5"
            opacity="0.3"
          />
        </svg>
      );

    case "forest":
      return (
        <svg viewBox="0 0 120 80" className={className}>
          {/* Tree 1 */}
          <polygon points="20,55 8,55 14,38" fill="#8b5cf6" opacity="0.7" />
          <polygon points="20,45 8,45 14,28" fill="#8b5cf6" opacity="0.5" />
          <rect
            x="12"
            y="55"
            width="4"
            height="8"
            fill="#a16207"
            opacity="0.6"
          />
          {/* Tree 2 */}
          <polygon points="65,55 50,55 57,35" fill="#60a5fa" opacity="0.7" />
          <polygon points="63,44 50,44 56,24" fill="#60a5fa" opacity="0.5" />
          <rect
            x="55"
            y="55"
            width="4"
            height="8"
            fill="#a16207"
            opacity="0.6"
          />
          {/* Tree 3 */}
          <polygon points="110,55 95,55 102,38" fill="#34d399" opacity="0.7" />
          <polygon points="108,45 95,45 101,28" fill="#34d399" opacity="0.5" />
          <rect
            x="99"
            y="55"
            width="4"
            height="8"
            fill="#a16207"
            opacity="0.6"
          />
          {/* ground */}
          <line
            x1="5"
            y1="63"
            x2="115"
            y2="63"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.2"
          />
          {/* vote label */}
          <text
            x="60"
            y="76"
            textAnchor="middle"
            fontSize="8"
            fill="currentColor"
            opacity="0.5"
          >
            majority vote
          </text>
        </svg>
      );

    case "boosting":
      return (
        <svg viewBox="0 0 120 80" className={className}>
          {/* Tree boxes */}
          <rect
            x="4"
            y="20"
            width="28"
            height="40"
            rx="4"
            fill="#8b5cf6"
            fillOpacity="0.15"
            stroke="#8b5cf6"
            strokeWidth="1.5"
          />
          <rect
            x="46"
            y="20"
            width="28"
            height="40"
            rx="4"
            fill="#8b5cf6"
            fillOpacity="0.25"
            stroke="#8b5cf6"
            strokeWidth="1.5"
          />
          <rect
            x="88"
            y="20"
            width="28"
            height="40"
            rx="4"
            fill="#8b5cf6"
            fillOpacity="0.4"
            stroke="#8b5cf6"
            strokeWidth="1.5"
          />
          {/* tree icons inside */}
          <polygon points="18,50 10,50 14,38" fill="#8b5cf6" opacity="0.6" />
          <polygon points="60,50 52,50 56,38" fill="#8b5cf6" opacity="0.6" />
          <polygon points="102,50 94,50 98,38" fill="#8b5cf6" opacity="0.6" />
          {/* + arrows */}
          <text
            x="39"
            y="43"
            textAnchor="middle"
            fontSize="14"
            fill="#8b5cf6"
            opacity="0.8"
          >
            +
          </text>
          <text
            x="81"
            y="43"
            textAnchor="middle"
            fontSize="14"
            fill="#8b5cf6"
            opacity="0.8"
          >
            +
          </text>
          {/* labels */}
          <text
            x="18"
            y="70"
            textAnchor="middle"
            fontSize="7"
            fill="currentColor"
            opacity="0.5"
          >
            T1
          </text>
          <text
            x="60"
            y="70"
            textAnchor="middle"
            fontSize="7"
            fill="currentColor"
            opacity="0.5"
          >
            T2
          </text>
          <text
            x="102"
            y="70"
            textAnchor="middle"
            fontSize="7"
            fill="currentColor"
            opacity="0.5"
          >
            T3
          </text>
        </svg>
      );

    case "hyperplane":
      return (
        <svg viewBox="0 0 120 80" className={className}>
          {/* separating hyperplane */}
          <line
            x1="55"
            y1="5"
            x2="65"
            y2="75"
            stroke="#8b5cf6"
            strokeWidth="2"
          />
          {/* margin dashes */}
          <line
            x1="44"
            y1="5"
            x2="54"
            y2="75"
            stroke="#8b5cf6"
            strokeWidth="1"
            strokeDasharray="4,3"
            opacity="0.4"
          />
          <line
            x1="66"
            y1="5"
            x2="76"
            y2="75"
            stroke="#8b5cf6"
            strokeWidth="1"
            strokeDasharray="4,3"
            opacity="0.4"
          />
          {/* class 1 dots (blue) */}
          {[
            [18, 20],
            [25, 35],
            [15, 50],
            [30, 60],
            [22, 45],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="4" fill="#60a5fa" opacity="0.8" />
          ))}
          {/* class 2 dots (red) */}
          {[
            [85, 18],
            [95, 32],
            [88, 50],
            [102, 42],
            [78, 62],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="4" fill="#f87171" opacity="0.8" />
          ))}
        </svg>
      );

    case "knn_viz":
      return (
        <svg viewBox="0 0 120 80" className={className}>
          {/* query point */}
          <circle
            cx="60"
            cy="40"
            r="5"
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="2.5"
          />
          <circle cx="60" cy="40" r="2" fill="#8b5cf6" />
          {/* k-radius circle */}
          <circle
            cx="60"
            cy="40"
            r="25"
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="1"
            strokeDasharray="4,3"
            opacity="0.4"
          />
          {/* neighbors (inside circle) */}
          {[
            [42, 28],
            [75, 30],
            [48, 58],
            [72, 55],
            [60, 18],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="4" fill="#60a5fa" opacity="0.9" />
          ))}
          {/* non-neighbors (outside) */}
          {[
            [12, 15],
            [100, 12],
            [108, 65],
            [15, 68],
            [95, 70],
            [20, 40],
          ].map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="3"
              fill="currentColor"
              opacity="0.15"
            />
          ))}
        </svg>
      );

    case "bayes":
      return (
        <svg viewBox="0 0 120 80" className={className}>
          {/* Class 1 bell curve (blue) */}
          <path
            d="M 5 70 C 10 70 18 68 26 55 C 32 45 36 25 44 18 C 52 12 55 15 60 18 C 65 22 68 45 74 55 C 80 65 88 70 95 70"
            fill="#60a5fa"
            fillOpacity="0.2"
            stroke="#60a5fa"
            strokeWidth="1.5"
          />
          {/* Class 2 bell curve (red) */}
          <path
            d="M 25 70 C 30 70 38 68 46 55 C 52 45 56 25 64 18 C 72 12 75 15 80 18 C 85 22 88 45 94 55 C 100 65 108 70 115 70"
            fill="#f87171"
            fillOpacity="0.2"
            stroke="#f87171"
            strokeWidth="1.5"
          />
          {/* x axis */}
          <line
            x1="5"
            y1="70"
            x2="115"
            y2="70"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.2"
          />
          {/* labels */}
          <text
            x="35"
            y="78"
            textAnchor="middle"
            fontSize="8"
            fill="#60a5fa"
            opacity="0.8"
          >
            P(x|C₁)
          </text>
          <text
            x="85"
            y="78"
            textAnchor="middle"
            fontSize="8"
            fill="#f87171"
            opacity="0.8"
          >
            P(x|C₂)
          </text>
        </svg>
      );

    case "clusters":
      return (
        <svg viewBox="0 0 120 80" className={className}>
          {/* cluster 1 dots (violet) */}
          {[
            [20, 15],
            [28, 22],
            [15, 30],
            [24, 35],
            [30, 18],
          ].map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="3.5"
              fill="#8b5cf6"
              opacity="0.7"
            />
          ))}
          {/* centroid 1 */}
          <path
            d="M 22 24 L 22 28 M 20 26 L 24 26"
            stroke="#8b5cf6"
            strokeWidth="2"
            opacity="0.9"
          />
          {/* cluster 2 dots (blue) */}
          {[
            [60, 10],
            [70, 18],
            [55, 22],
            [68, 28],
            [75, 14],
          ].map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="3.5"
              fill="#60a5fa"
              opacity="0.7"
            />
          ))}
          {/* centroid 2 */}
          <path
            d="M 65 18 L 65 22 M 63 20 L 67 20"
            stroke="#60a5fa"
            strokeWidth="2"
            opacity="0.9"
          />
          {/* cluster 3 dots (emerald) */}
          {[
            [40, 55],
            [50, 62],
            [35, 65],
            [48, 50],
            [58, 58],
          ].map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="3.5"
              fill="#34d399"
              opacity="0.7"
            />
          ))}
          {/* centroid 3 */}
          <path
            d="M 46 58 L 46 62 M 44 60 L 48 60"
            stroke="#34d399"
            strokeWidth="2"
            opacity="0.9"
          />
          {/* cluster 4 dots (amber) */}
          {[
            [90, 50],
            [100, 58],
            [88, 65],
            [98, 45],
            [108, 55],
          ].map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="3.5"
              fill="#fbbf24"
              opacity="0.7"
            />
          ))}
          {/* centroid 4 */}
          <path
            d="M 96 56 L 96 60 M 94 58 L 98 58"
            stroke="#fbbf24"
            strokeWidth="2"
            opacity="0.9"
          />
        </svg>
      );

    case "density":
      return (
        <svg viewBox="0 0 120 80" className={className}>
          {/* blob 1 (violet) */}
          <ellipse
            cx="35"
            cy="30"
            rx="25"
            ry="18"
            fill="#8b5cf6"
            fillOpacity="0.12"
            stroke="#8b5cf6"
            strokeWidth="1.5"
            strokeDasharray="4,2"
          />
          {[
            [25, 25],
            [35, 20],
            [45, 28],
            [30, 35],
            [40, 35],
            [22, 30],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="3" fill="#8b5cf6" opacity="0.7" />
          ))}
          {/* blob 2 (blue) — irregular */}
          <ellipse
            cx="88"
            cy="55"
            rx="22"
            ry="16"
            fill="#60a5fa"
            fillOpacity="0.12"
            stroke="#60a5fa"
            strokeWidth="1.5"
            strokeDasharray="4,2"
          />
          {[
            [80, 50],
            [92, 48],
            [98, 56],
            [85, 62],
            [76, 58],
            [94, 62],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="3" fill="#60a5fa" opacity="0.7" />
          ))}
          {/* outlier / noise points */}
          {[
            [60, 15],
            [10, 68],
            [108, 20],
          ].map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="3"
              fill="currentColor"
              opacity="0.2"
            />
          ))}
        </svg>
      );

    case "dendrogram":
      return (
        <svg viewBox="0 0 120 80" className={className}>
          {/* leaf points */}
          {[12, 28, 44, 60, 76, 92, 108].map((x, i) => (
            <circle key={i} cx={x} cy="68" r="3" fill="#60a5fa" opacity="0.7" />
          ))}
          {/* level 1 merges */}
          <polyline
            points="12,65 12,52 28,52 28,65"
            fill="none"
            stroke="#60a5fa"
            strokeWidth="1.5"
            opacity="0.6"
          />
          <polyline
            points="44,65 44,52 60,52 60,65"
            fill="none"
            stroke="#60a5fa"
            strokeWidth="1.5"
            opacity="0.6"
          />
          <polyline
            points="92,65 92,52 108,52 108,65"
            fill="none"
            stroke="#60a5fa"
            strokeWidth="1.5"
            opacity="0.6"
          />
          {/* level 2 merges */}
          <polyline
            points="20,52 20,36 52,36 52,52"
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="1.5"
            opacity="0.6"
          />
          <polyline
            points="76,65 76,36 100,36 100,52"
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="1.5"
            opacity="0.6"
          />
          {/* root merge */}
          <polyline
            points="36,36 36,18 88,18 88,36"
            fill="none"
            stroke="#f87171"
            strokeWidth="2"
            opacity="0.7"
          />
          <circle cx="62" cy="18" r="4" fill="#f87171" opacity="0.7" />
        </svg>
      );

    case "ellipses":
      return (
        <svg viewBox="0 0 120 80" className={className}>
          <ellipse
            cx="40"
            cy="35"
            rx="30"
            ry="20"
            fill="#8b5cf6"
            fillOpacity="0.15"
            stroke="#8b5cf6"
            strokeWidth="1.5"
          />
          <ellipse
            cx="80"
            cy="45"
            rx="28"
            ry="18"
            fill="#60a5fa"
            fillOpacity="0.15"
            stroke="#60a5fa"
            strokeWidth="1.5"
          />
          <ellipse
            cx="60"
            cy="55"
            rx="22"
            ry="14"
            fill="#34d399"
            fillOpacity="0.15"
            stroke="#34d399"
            strokeWidth="1.5"
          />
          {/* dots */}
          {[
            [30, 30],
            [42, 28],
            [36, 42],
            [50, 35],
            [28, 40],
          ].map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="2.5"
              fill="#8b5cf6"
              opacity="0.6"
            />
          ))}
          {[
            [72, 40],
            [85, 38],
            [90, 50],
            [78, 55],
            [95, 44],
          ].map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="2.5"
              fill="#60a5fa"
              opacity="0.6"
            />
          ))}
          {[
            [55, 52],
            [62, 60],
            [68, 50],
            [52, 62],
            [70, 62],
          ].map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="2.5"
              fill="#34d399"
              opacity="0.6"
            />
          ))}
        </svg>
      );

    case "pca_arrows":
      return (
        <svg viewBox="0 0 120 80" className={className}>
          {/* scatter */}
          {[
            [30, 60],
            [45, 50],
            [55, 42],
            [40, 55],
            [65, 35],
            [50, 48],
            [70, 30],
            [35, 52],
            [60, 40],
            [75, 25],
          ].map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="2.5"
              fill="currentColor"
              opacity="0.25"
            />
          ))}
          {/* PC1 arrow */}
          <line
            x1="25"
            y1="65"
            x2="90"
            y2="20"
            stroke="#8b5cf6"
            strokeWidth="2.5"
          />
          <polygon points="90,20 82,22 85,30" fill="#8b5cf6" />
          {/* PC2 arrow */}
          <line
            x1="55"
            y1="65"
            x2="30"
            y2="30"
            stroke="#60a5fa"
            strokeWidth="1.5"
          />
          <polygon points="30,30 34,38 42,34" fill="#60a5fa" />
          {/* labels */}
          <text x="95" y="20" fontSize="9" fill="#8b5cf6" opacity="0.9">
            PC1
          </text>
          <text x="18" y="30" fontSize="9" fill="#60a5fa" opacity="0.9">
            PC2
          </text>
        </svg>
      );

    case "projection":
      return (
        <svg viewBox="0 0 120 80" className={className}>
          {/* 4 tight clusters */}
          {[
            [18, 18],
            [24, 14],
            [22, 24],
            [14, 22],
            [20, 10],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="3" fill="#8b5cf6" opacity="0.8" />
          ))}
          {[
            [90, 20],
            [98, 14],
            [95, 28],
            [102, 22],
            [88, 14],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="3" fill="#60a5fa" opacity="0.8" />
          ))}
          {[
            [25, 62],
            [32, 55],
            [20, 55],
            [28, 68],
            [35, 62],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="3" fill="#34d399" opacity="0.8" />
          ))}
          {[
            [92, 62],
            [100, 58],
            [88, 58],
            [96, 68],
            [104, 64],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="3" fill="#fbbf24" opacity="0.8" />
          ))}
        </svg>
      );

    case "timeseries":
      return (
        <svg viewBox="0 0 120 80" className={className}>
          {/* axis */}
          <line
            x1="8"
            y1="72"
            x2="115"
            y2="72"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.2"
          />
          <line
            x1="8"
            y1="72"
            x2="8"
            y2="8"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.2"
          />
          {/* observed line */}
          <polyline
            points="10,55 20,42 30,48 40,30 50,38 60,25 70,32 80,20"
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="2"
          />
          {/* forecast line (dashed) */}
          <polyline
            points="80,20 90,16 100,12 110,8"
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="2"
            strokeDasharray="5,3"
          />
          {/* forecast band */}
          <polygon
            points="80,20 90,10 100,4 110,0 110,16 100,20 90,22 80,20"
            fill="#8b5cf6"
            fillOpacity="0.1"
          />
          {/* split marker */}
          <line
            x1="80"
            y1="10"
            x2="80"
            y2="72"
            stroke="#f87171"
            strokeWidth="1"
            strokeDasharray="3,2"
            opacity="0.5"
          />
        </svg>
      );

    case "sequence":
      return (
        <svg viewBox="0 0 120 80" className={className}>
          {/* cells */}
          {[10, 38, 66, 94].map((x, i) => (
            <rect
              key={i}
              x={x}
              y="25"
              width="22"
              height="30"
              rx="4"
              fill="#8b5cf6"
              fillOpacity={0.2 + i * 0.12}
              stroke="#8b5cf6"
              strokeWidth="1.5"
            />
          ))}
          {/* arrows between cells */}
          {[10, 38, 66].map((x, i) => (
            <line
              key={i}
              x1={x + 22}
              y1="40"
              x2={x + 36}
              y2="40"
              stroke="#8b5cf6"
              strokeWidth="1.5"
            />
          ))}
          <polygon points="38,37 32,40 38,43" fill="#8b5cf6" />
          <polygon points="66,37 60,40 66,43" fill="#8b5cf6" />
          <polygon points="94,37 88,40 94,43" fill="#8b5cf6" />
          {/* input arrows */}
          {[10, 38, 66, 94].map((x, i) => (
            <line
              key={i}
              x1={x + 11}
              y1="65"
              x2={x + 11}
              y2="57"
              stroke="#60a5fa"
              strokeWidth="1.5"
            />
          ))}
          {/* output arrows */}
          {[10, 38, 66, 94].map((x, i) => (
            <line
              key={i}
              x1={x + 11}
              y1="24"
              x2={x + 11}
              y2="16"
              stroke="#34d399"
              strokeWidth="1.5"
            />
          ))}
          {/* labels */}
          <text
            x="60"
            y="78"
            textAnchor="middle"
            fontSize="7"
            fill="currentColor"
            opacity="0.5"
          >
            h₁ → h₂ → h₃ → h₄
          </text>
        </svg>
      );

    case "neural":
      return (
        <svg viewBox="0 0 120 80" className={className}>
          {/* input layer */}
          {[20, 35, 50].map((y, i) => (
            <circle key={i} cx="20" cy={y} r="6" fill="#60a5fa" opacity="0.7" />
          ))}
          {/* hidden layer 1 */}
          {[15, 28, 42, 55].map((y, i) => (
            <circle key={i} cx="52" cy={y} r="6" fill="#8b5cf6" opacity="0.7" />
          ))}
          {/* hidden layer 2 */}
          {[20, 35, 50].map((y, i) => (
            <circle key={i} cx="84" cy={y} r="6" fill="#8b5cf6" opacity="0.5" />
          ))}
          {/* output layer */}
          {[25, 45].map((y, i) => (
            <circle
              key={i}
              cx="110"
              cy={y}
              r="6"
              fill="#34d399"
              opacity="0.7"
            />
          ))}
          {/* connections input→h1 */}
          {[20, 35, 50].flatMap((iy, ii) =>
            [15, 28, 42, 55].map((hy, hi) => (
              <line
                key={`${ii}-${hi}`}
                x1="26"
                y1={iy}
                x2="46"
                y2={hy}
                stroke="currentColor"
                strokeWidth="0.5"
                opacity="0.12"
              />
            )),
          )}
          {/* connections h1→h2 */}
          {[15, 28, 42, 55].flatMap((hy, hi) =>
            [20, 35, 50].map((oy, oi) => (
              <line
                key={`${hi}-${oi}`}
                x1="58"
                y1={hy}
                x2="78"
                y2={oy}
                stroke="currentColor"
                strokeWidth="0.5"
                opacity="0.12"
              />
            )),
          )}
          {/* connections h2→output */}
          {[20, 35, 50].flatMap((hy, hi) =>
            [25, 45].map((oy, oi) => (
              <line
                key={`${hi}-${oi}`}
                x1="90"
                y1={hy}
                x2="104"
                y2={oy}
                stroke="currentColor"
                strokeWidth="0.5"
                opacity="0.12"
              />
            )),
          )}
        </svg>
      );

    default:
      return null;
  }
}

function OptionButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2.5 rounded-xl border text-sm transition-colors cursor-pointer ${
        selected
          ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300"
          : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-violet-300 dark:hover:border-violet-700"
      }`}
    >
      {children}
    </button>
  );
}

function SnippetBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }
  return (
    <div className="relative group">
      <pre className="text-[11px] leading-relaxed bg-zinc-950 text-zinc-200 rounded-lg p-3 overflow-x-auto font-mono">
        <code>{code}</code>
      </pre>
      <button
        onClick={copy}
        className="absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}

function ComplexityTable({ results }: { results: Scored[] }) {
  if (results.length === 0) return null;
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
          Complexity Comparison
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-zinc-800">
              <th className="text-left px-4 py-2 font-medium text-zinc-400">
                #
              </th>
              <th className="text-left px-4 py-2 font-medium text-zinc-400">
                Algorithm
              </th>
              <th className="text-left px-4 py-2 font-medium text-zinc-400">
                Train Complexity
              </th>
              <th className="text-left px-4 py-2 font-medium text-zinc-400">
                Inference Complexity
              </th>
            </tr>
          </thead>
          <tbody>
            {results.map(({ algo }, i) => (
              <tr
                key={algo.id}
                className="border-b border-zinc-50 dark:border-zinc-800/50 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
              >
                <td className="px-4 py-2 text-zinc-400 font-medium">{i + 1}</td>
                <td className="px-4 py-2 font-medium text-zinc-700 dark:text-zinc-300">
                  {algo.name}
                </td>
                <td className="px-4 py-2">
                  <code className="text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 px-1.5 py-0.5 rounded">
                    {algo.trainComplexity}
                  </code>
                </td>
                <td className="px-4 py-2">
                  <code className="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded">
                    {algo.inferenceComplexity}
                  </code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AlgorithmCard({ algo, rank }: { algo: Algorithm; rank: number }) {
  const [open, setOpen] = useState(false);

  const rankColor =
    rank === 1
      ? "bg-emerald-500"
      : rank === 2
        ? "bg-blue-500"
        : rank === 3
          ? "bg-violet-500"
          : "bg-zinc-400";

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left p-4 flex items-start gap-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
      >
        <div
          className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white ${rankColor}`}
        >
          {rank}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
              {algo.name}
            </span>
            {algo.interpretable && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium">
                interpretable
              </span>
            )}
            {algo.highDimOk && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium">
                high-dim ok
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
            {algo.useCases.join(" · ")}
          </p>
        </div>
        <div className="shrink-0 hidden sm:block w-20 h-14 text-zinc-400 dark:text-zinc-500">
          <AlgorithmVisual
            visualType={algo.visualType}
            className="w-full h-full"
          />
        </div>
        <svg
          className={`shrink-0 w-4 h-4 text-zinc-400 transition-transform mt-0.5 ${open ? "rotate-180" : ""}`}
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
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3 pt-3">
          {/* Expanded visual */}
          <div className="w-full h-24 text-zinc-400 dark:text-zinc-500 mb-2">
            <AlgorithmVisual
              visualType={algo.visualType}
              className="w-full h-full"
            />
          </div>

          {/* Pros & Cons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-1">
                Pros
              </p>
              <ul className="space-y-1">
                {algo.pros.map((p) => (
                  <li
                    key={p}
                    className="text-xs text-zinc-600 dark:text-zinc-400 flex gap-1.5"
                  >
                    <span className="text-emerald-500 shrink-0">+</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-red-500 uppercase tracking-wide mb-1">
                Cons
              </p>
              <ul className="space-y-1">
                {algo.cons.map((c) => (
                  <li
                    key={c}
                    className="text-xs text-zinc-600 dark:text-zinc-400 flex gap-1.5"
                  >
                    <span className="text-red-400 shrink-0">−</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Complexity */}
          <div className="flex gap-3 flex-wrap">
            <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg px-3 py-2">
              <p className="text-[10px] text-zinc-400 font-medium mb-0.5">
                Train
              </p>
              <code className="text-xs text-zinc-700 dark:text-zinc-300">
                {algo.trainComplexity}
              </code>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg px-3 py-2">
              <p className="text-[10px] text-zinc-400 font-medium mb-0.5">
                Inference
              </p>
              <code className="text-xs text-zinc-700 dark:text-zinc-300">
                {algo.inferenceComplexity}
              </code>
            </div>
          </div>

          {/* Sklearn snippet */}
          {algo.sklearnSnippet && (
            <div>
              <p className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1.5">
                Quick Start
              </p>
              <SnippetBlock code={algo.sklearnSnippet} />
            </div>
          )}

          {/* Docs link */}
          <a
            href={algo.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-violet-600 dark:text-violet-400 hover:underline font-medium"
          >
            View docs
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
      )}
    </div>
  );
}

function parseAlgoUrl(): {
  task: TaskType | null;
  size: DataSize | null;
  interp: Interpretability | null;
  features: FeatureCount | null;
} {
  try {
    const p = new URLSearchParams(window.location.search);
    const task = (p.get("algo_task") as TaskType) || null;
    const size = (p.get("algo_size") as DataSize) || null;
    const interp = (p.get("algo_interp") as Interpretability) || null;
    const features = (p.get("algo_feat") as FeatureCount) || null;
    return { task, size, interp, features };
  } catch {
    return { task: null, size: null, interp: null, features: null };
  }
}

export function AlgorithmSelector() {
  const init = parseAlgoUrl();
  const [task, setTask] = useState<TaskType | null>(init.task);
  const [size, setSize] = useState<DataSize | null>(init.size);
  const [interp, setInterp] = useState<Interpretability | null>(init.interp);
  const [features, setFeatures] = useState<FeatureCount | null>(init.features);
  const [shareCopied, setShareCopied] = useState(false);
  const [showTable, setShowTable] = useState(false);

  // Keep URL in sync with questionnaire state
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // Clear old algo params
    ["algo_task", "algo_size", "algo_interp", "algo_feat"].forEach((k) =>
      params.delete(k),
    );
    if (task) params.set("algo_task", task);
    if (size) params.set("algo_size", size);
    if (interp) params.set("algo_interp", interp);
    if (features) params.set("algo_feat", features);
    const qs = params.toString();
    window.history.replaceState(
      null,
      "",
      qs ? `?${qs}` : window.location.pathname,
    );
  }, [task, size, interp, features]);

  const showFeatures =
    task === "classification" || task === "regression" || task === "clustering";
  const showInterp = task !== null;

  const results: Scored[] = useMemo(() => {
    if (!task) return [];
    const filtered = ALGORITHMS.filter((a) => a.tasks.includes(task));
    const s = size ?? "medium";
    const i = interp ?? "medium";
    const f = features ?? "few";
    return filtered
      .map((a) => ({ algo: a, score: scoreAlgorithm(a, s, i, f) }))
      .sort((a, b) => b.score - a.score);
  }, [task, size, interp, features]);

  const isComplete =
    task !== null &&
    size !== null &&
    interp !== null &&
    (!showFeatures || features !== null);

  function reset() {
    setTask(null);
    setSize(null);
    setInterp(null);
    setFeatures(null);
  }

  function handleShare() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 1500);
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Questionnaire */}
      <div className="lg:col-span-1 space-y-5">
        {/* Task */}
        <div>
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2">
            1 · What's your task?
          </p>
          <div className="space-y-1.5">
            {TASK_OPTIONS.map((opt) => (
              <OptionButton
                key={opt.value}
                selected={task === opt.value}
                onClick={() => setTask(opt.value)}
              >
                <span className="mr-2">{opt.icon}</span>
                <span className="font-medium">{opt.label}</span>
                <span className="text-zinc-400 dark:text-zinc-500 ml-1.5 text-xs">
                  — {opt.desc}
                </span>
              </OptionButton>
            ))}
          </div>
        </div>

        {/* Dataset size */}
        {task && (
          <div>
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2">
              2 · Dataset size
            </p>
            <div className="space-y-1.5">
              {SIZE_OPTIONS.map((opt) => (
                <OptionButton
                  key={opt.value}
                  selected={size === opt.value}
                  onClick={() => setSize(opt.value)}
                >
                  <span className="font-medium">{opt.label}</span>
                  <span className="text-zinc-400 dark:text-zinc-500 ml-1.5 text-xs">
                    {opt.desc}
                  </span>
                </OptionButton>
              ))}
            </div>
          </div>
        )}

        {/* Interpretability */}
        {showInterp && size && (
          <div>
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2">
              3 · Interpretability needed?
            </p>
            <div className="space-y-1.5">
              {INTERP_OPTIONS.map((opt) => (
                <OptionButton
                  key={opt.value}
                  selected={interp === opt.value}
                  onClick={() => setInterp(opt.value)}
                >
                  <span className="font-medium">{opt.label}</span>
                  <span className="text-zinc-400 dark:text-zinc-500 ml-1.5 text-xs">
                    — {opt.desc}
                  </span>
                </OptionButton>
              ))}
            </div>
          </div>
        )}

        {/* Feature count */}
        {showFeatures && interp && (
          <div>
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2">
              4 · How many features?
            </p>
            <div className="space-y-1.5">
              {FEATURE_OPTIONS.map((opt) => (
                <OptionButton
                  key={opt.value}
                  selected={features === opt.value}
                  onClick={() => setFeatures(opt.value)}
                >
                  <span className="font-medium">{opt.label}</span>
                  <span className="text-zinc-400 dark:text-zinc-500 ml-1.5 text-xs">
                    {opt.desc}
                  </span>
                </OptionButton>
              ))}
            </div>
          </div>
        )}

        {isComplete && (
          <button
            onClick={reset}
            className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer underline"
          >
            Reset
          </button>
        )}

        {/* AI Advisor */}
        <AlgoAdvisorChat
          task={task}
          size={size}
          interp={interp}
          features={features}
          topResults={results.slice(0, 5).map((r) => r.algo.name)}
        />
      </div>

      {/* Right: Results */}
      <div className="lg:col-span-2">
        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 gap-3">
            <span className="text-3xl">🧠</span>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center px-4">
              Select your task type to see algorithm recommendations
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                <span className="text-violet-600 dark:text-violet-400 font-bold">
                  {results.length}
                </span>{" "}
                algorithms ranked for your criteria
              </p>
              <div className="flex items-center gap-2">
                {!isComplete && (
                  <span className="text-xs text-zinc-400 dark:text-zinc-500 italic">
                    Refine with more answers →
                  </span>
                )}
                <button
                  onClick={() => setShowTable((v) => !v)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer font-medium ${showTable ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"}`}
                >
                  Complexity
                </button>
                <button
                  onClick={handleShare}
                  className="text-xs px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer font-medium"
                >
                  {shareCopied ? "Copied!" : "Share"}
                </button>
              </div>
            </div>
            {showTable && <ComplexityTable results={results} />}
            <div className="space-y-2">
              {results.map(({ algo }, i) => (
                <AlgorithmCard key={algo.id} algo={algo} rank={i + 1} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
