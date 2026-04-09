import { useState, useMemo } from "react";
import frameworksRaw from "../data/frameworks.json";

interface Framework {
  id: string;
  name: string;
  icon: string;
  url: string;
  tasks: string[];
  production: boolean;
  research: boolean;
  hardware: string[];
  learnCurve: string;
  ecosystem: string;
  bestFor: string;
  pros: string[];
  cons: string[];
  smallTeam: number;
  largeTeam: number;
  solo: number;
  cpuFit: number;
  gpuFit: number;
  edgeFit: number;
  cloudFit: number;
}

const FRAMEWORKS = frameworksRaw as Framework[];

type TaskType =
  | "tabular"
  | "nlp"
  | "cv"
  | "generative"
  | "audio"
  | "rl"
  | "scientific";
type Goal = "production" | "research" | "learning";
type Team = "solo" | "small" | "large";
type Target = "cpu" | "gpu" | "edge" | "cloud";

const TASK_OPTIONS: { value: TaskType; label: string; icon: string }[] = [
  { value: "tabular", label: "Tabular / Structured", icon: "📊" },
  { value: "nlp", label: "NLP / Text", icon: "📝" },
  { value: "cv", label: "Computer Vision", icon: "👁️" },
  { value: "generative", label: "Generative AI / LLMs", icon: "🤖" },
  { value: "audio", label: "Audio / Speech", icon: "🎵" },
  { value: "rl", label: "Reinforcement Learning", icon: "🎮" },
  { value: "scientific", label: "Scientific Computing", icon: "🔬" },
];

const GOAL_OPTIONS: { value: Goal; label: string; desc: string }[] = [
  { value: "production", label: "Production", desc: "Ship to users" },
  { value: "research", label: "Research", desc: "Experiments & papers" },
  { value: "learning", label: "Learning", desc: "Just getting started" },
];

const TEAM_OPTIONS: { value: Team; label: string; desc: string }[] = [
  { value: "solo", label: "Solo", desc: "Just me" },
  { value: "small", label: "Small team", desc: "2–10 people" },
  { value: "large", label: "Large team", desc: "10+ engineers" },
];

const TARGET_OPTIONS: { value: Target; label: string; icon: string }[] = [
  { value: "cpu", label: "CPU / Laptop", icon: "💻" },
  { value: "gpu", label: "GPU Server", icon: "⚡" },
  { value: "edge", label: "Edge / Mobile", icon: "📱" },
  { value: "cloud", label: "Cloud", icon: "☁️" },
];

function scoreFramework(
  fw: Framework,
  task: TaskType,
  goal: Goal,
  team: Team,
  target: Target,
): number {
  let score = 0;

  // Task match (0-30)
  if (fw.tasks.includes(task)) score += 30;
  else if (
    task === "tabular" &&
    (fw.tasks.includes("classification") || fw.tasks.includes("regression"))
  )
    score += 20;

  // Goal match (0-25)
  if (goal === "production" && fw.production) score += 25;
  else if (goal === "research" && fw.research) score += 25;
  else if (goal === "learning" && fw.learnCurve === "low") score += 25;
  else if (goal === "learning" && fw.learnCurve === "medium") score += 12;
  else if (goal === "production" && !fw.production) score += 5;

  // Team size (0-20)
  const teamScore =
    team === "solo" ? fw.solo : team === "small" ? fw.smallTeam : fw.largeTeam;
  score += (teamScore / 3) * 20;

  // Hardware target (0-25)
  const targetScore =
    target === "cpu"
      ? fw.cpuFit
      : target === "gpu"
        ? fw.gpuFit
        : target === "edge"
          ? fw.edgeFit
          : fw.cloudFit;
  score += (targetScore / 3) * 25;

  return Math.round(score);
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
      className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all cursor-pointer border ${
        selected
          ? "bg-violet-50 dark:bg-violet-900/20 border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300 ring-1 ring-violet-300 dark:ring-violet-700"
          : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-600"
      }`}
    >
      {children}
    </button>
  );
}

const LEARN_CURVE_COLORS: Record<string, string> = {
  low: "text-emerald-600 dark:text-emerald-400",
  medium: "text-amber-600 dark:text-amber-400",
  high: "text-red-500 dark:text-red-400",
};

function FrameworkCard({
  fw,
  rank,
  score,
}: {
  fw: Framework;
  rank: number;
  score: number;
}) {
  const [open, setOpen] = useState(false);
  const barWidth = Math.max(8, score);

  return (
    <div
      className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden hover:border-violet-300 dark:hover:border-violet-700 transition-colors cursor-pointer"
      onClick={() => setOpen((v) => !v)}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="text-lg">{fw.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500">
              #{rank}
            </span>
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
              {fw.name}
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
            {fw.bestFor}
          </p>
        </div>
        {/* Score bar */}
        <div
          className="w-20 shrink-0"
          title="Match score: how well this framework fits your selected task, goal, and preferences"
        >
          <p className="text-xs text-zinc-400 text-right mb-0.5 font-medium">
            Match
          </p>
          <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-violet-500 transition-all"
              style={{ width: `${barWidth}%` }}
            />
          </div>
          <p className="text-xs text-zinc-400 text-right mt-0.5">{score}/100</p>
        </div>
        <svg
          className={`w-4 h-4 shrink-0 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`}
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

      {/* Expanded */}
      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-medium ${LEARN_CURVE_COLORS[fw.learnCurve] ?? "text-zinc-500"} bg-zinc-100 dark:bg-zinc-800`}
            >
              {fw.learnCurve === "low"
                ? "Easy to learn"
                : fw.learnCurve === "medium"
                  ? "Moderate curve"
                  : "Steep curve"}
            </span>
            {fw.production && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium">
                Production-ready
              </span>
            )}
            {fw.research && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium">
                Research
              </span>
            )}
            {fw.hardware.map((h) => (
              <span
                key={h}
                className="text-xs px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-medium uppercase"
              >
                {h}
              </span>
            ))}
          </div>

          {/* Ecosystem */}
          <p className="text-xs text-zinc-600 dark:text-zinc-300">
            <span className="font-medium text-zinc-700 dark:text-zinc-200">
              Ecosystem:
            </span>{" "}
            {fw.ecosystem}
          </p>

          {/* Pros / Cons */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-1">
                Pros
              </p>
              <ul className="space-y-0.5">
                {fw.pros.map((p) => (
                  <li
                    key={p}
                    className="text-xs text-zinc-600 dark:text-zinc-300 flex items-start gap-1"
                  >
                    <span className="text-emerald-500 shrink-0">+</span> {p}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-red-500 dark:text-red-400 uppercase tracking-wide mb-1">
                Cons
              </p>
              <ul className="space-y-0.5">
                {fw.cons.map((c) => (
                  <li
                    key={c}
                    className="text-xs text-zinc-600 dark:text-zinc-300 flex items-start gap-1"
                  >
                    <span className="text-red-400 shrink-0">-</span> {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Docs link */}
          <a
            href={fw.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-xs text-violet-600 dark:text-violet-400 font-medium hover:underline"
          >
            Official docs ↗
          </a>
        </div>
      )}
    </div>
  );
}

export function FrameworkPicker() {
  const [task, setTask] = useState<TaskType | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [target, setTarget] = useState<Target | null>(null);

  const results = useMemo(() => {
    if (!task) return [];
    const g = goal ?? "production";
    const t = team ?? "solo";
    const tgt = target ?? "cpu";
    return FRAMEWORKS.map((fw) => ({
      fw,
      score: scoreFramework(fw, task, g, t, tgt),
    }))
      .filter((r) => r.score > 10)
      .sort((a, b) => b.score - a.score);
  }, [task, goal, team, target]);

  function reset() {
    setTask(null);
    setGoal(null);
    setTeam(null);
    setTarget(null);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Questionnaire */}
      <div className="lg:col-span-1 space-y-5">
        {/* Task */}
        <div>
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2">
            1 · What are you building?
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
              </OptionButton>
            ))}
          </div>
        </div>

        {/* Goal */}
        {task && (
          <div>
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2">
              2 · What's the goal?
            </p>
            <div className="space-y-1.5">
              {GOAL_OPTIONS.map((opt) => (
                <OptionButton
                  key={opt.value}
                  selected={goal === opt.value}
                  onClick={() => setGoal(opt.value)}
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

        {/* Team */}
        {goal && (
          <div>
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2">
              3 · Team size?
            </p>
            <div className="space-y-1.5">
              {TEAM_OPTIONS.map((opt) => (
                <OptionButton
                  key={opt.value}
                  selected={team === opt.value}
                  onClick={() => setTeam(opt.value)}
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

        {/* Hardware target */}
        {team && (
          <div>
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2">
              4 · Where will it run?
            </p>
            <div className="space-y-1.5">
              {TARGET_OPTIONS.map((opt) => (
                <OptionButton
                  key={opt.value}
                  selected={target === opt.value}
                  onClick={() => setTarget(opt.value)}
                >
                  <span className="mr-2">{opt.icon}</span>
                  <span className="font-medium">{opt.label}</span>
                </OptionButton>
              ))}
            </div>
          </div>
        )}

        {/* Reset */}
        {task && (
          <button
            onClick={reset}
            className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer underline"
          >
            Reset
          </button>
        )}
      </div>

      {/* Right: Results */}
      <div className="lg:col-span-2">
        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 gap-3">
            <span className="text-3xl">🧰</span>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center px-4">
              Select your task type to see framework recommendations
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                <span className="text-violet-600 dark:text-violet-400 font-bold">
                  {results.length}
                </span>{" "}
                frameworks ranked for your criteria
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                The <span className="font-medium text-violet-500">Match</span>{" "}
                bar shows how well each framework fits your selected task, goal,
                and team experience (0–100).
              </p>
            </div>
            <div className="space-y-2">
              {results.map(({ fw, score }, i) => (
                <FrameworkCard key={fw.id} fw={fw} rank={i + 1} score={score} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
