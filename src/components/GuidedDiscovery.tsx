import { useState, useMemo } from "react";
import algorithmsRaw from "../data/algorithms.json";
import frameworksRaw from "../data/frameworks.json";
import { FrameworkFlowchart } from "./FrameworkFlowchart";

interface Algorithm {
  id: string;
  name: string;
  tasks: string[];
  pros: string[];
  cons: string[];
  useCases: string[];
  docsUrl: string;
}

interface Framework {
  id: string;
  name: string;
  icon: string;
  url: string;
  tasks: string[];
  bestFor: string;
  pros: string[];
  cons: string[];
  learnCurve: string;
}

const ALGORITHMS = algorithmsRaw as Algorithm[];
const FRAMEWORKS = frameworksRaw as Framework[];

type Step = "algorithm" | "framework" | "summary";

export function GuidedDiscovery() {
  const [step, setStep] = useState<Step>("algorithm");
  const [selectedAlgorithmId, setSelectedAlgorithmId] = useState<string | null>(
    null,
  );
  const [selectedFrameworkId, setSelectedFrameworkId] = useState<string | null>(
    null,
  );

  const selectedAlgorithm = useMemo(
    () => ALGORITHMS.find((a) => a.id === selectedAlgorithmId),
    [selectedAlgorithmId],
  );

  const selectedFramework = useMemo(
    () => FRAMEWORKS.find((f) => f.id === selectedFrameworkId),
    [selectedFrameworkId],
  );

  // Filter frameworks that support the selected algorithm's tasks
  const compatibleFrameworks = useMemo(() => {
    if (!selectedAlgorithm) return FRAMEWORKS;

    return FRAMEWORKS.filter((fw) =>
      selectedAlgorithm.tasks.some((task) => fw.tasks.includes(task)),
    ).sort((a, b) => {
      // Frameworks with more matching tasks first
      const aMatches = selectedAlgorithm.tasks.filter((t) =>
        a.tasks.includes(t),
      ).length;
      const bMatches = selectedAlgorithm.tasks.filter((t) =>
        b.tasks.includes(t),
      ).length;
      return bMatches - aMatches;
    });
  }, [selectedAlgorithm]);

  const handleReset = () => {
    setStep("algorithm");
    setSelectedAlgorithmId(null);
    setSelectedFrameworkId(null);
  };

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2 flex-1">
          {/* Step 1 */}
          <div className="flex flex-col items-center gap-2">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                step === "algorithm" || selectedAlgorithmId
                  ? "bg-brand-300 text-white"
                  : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400"
              }`}
            >
              1
            </div>
            <span className="text-xs font-medium text-center text-zinc-600 dark:text-zinc-400">
              Algorithm
            </span>
          </div>

          {/* Connector 1 */}
          <div
            className={`flex-1 h-1 transition-colors ${
              selectedAlgorithmId
                ? "bg-brand-300"
                : "bg-zinc-200 dark:bg-zinc-800"
            }`}
          />

          {/* Step 2 */}
          <div className="flex flex-col items-center gap-2">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                step === "framework" || selectedFrameworkId
                  ? "bg-brand-300 text-white"
                  : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400"
              }`}
            >
              2
            </div>
            <span className="text-xs font-medium text-center text-zinc-600 dark:text-zinc-400">
              Framework
            </span>
          </div>

          {/* Connector 2 */}
          <div
            className={`flex-1 h-1 transition-colors ${
              selectedFrameworkId
                ? "bg-brand-300"
                : "bg-zinc-200 dark:bg-zinc-800"
            }`}
          />

          {/* Step 3 */}
          <div className="flex flex-col items-center gap-2">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                step === "summary"
                  ? "bg-brand-300 text-white"
                  : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400"
              }`}
            >
              3
            </div>
            <span className="text-xs font-medium text-center text-zinc-600 dark:text-zinc-400">
              Summary
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-96 pb-20">
        {step === "algorithm" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                What's your problem?
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Click on an algorithm that best fits your use case. We'll help
                you find the right framework next.
              </p>
            </div>

            {/* Algorithm Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto pb-4">
              {ALGORITHMS.map((algo) => (
                <button
                  key={algo.id}
                  onClick={() => setSelectedAlgorithmId(algo.id)}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${
                    selectedAlgorithmId === algo.id
                      ? "border-brand-300 bg-brand-50 dark:bg-brand-500/20"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-brand-200 dark:hover:border-brand-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  }`}
                >
                  <p className="font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                    {algo.name}
                  </p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-2">
                    {algo.useCases.slice(0, 2).join(", ")}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {algo.pros.slice(0, 1).map((pro, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                      >
                        {pro}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>

            {/* Algorithm details when selected */}
            {selectedAlgorithmId && (
              <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 border border-blue-200 dark:border-blue-900/30 p-4">
                  <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-3">
                    {selectedAlgorithm?.name}
                  </h4>

                  <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                    <div>
                      <p className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                        ✓ Strengths
                      </p>
                      <ul className="space-y-1 text-brand-400 dark:text-brand-accent">
                        {selectedAlgorithm?.pros.slice(0, 2).map((p, i) => (
                          <li key={i}>• {p}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                        ⚠ Limitations
                      </p>
                      <ul className="space-y-1 text-brand-400 dark:text-brand-accent">
                        {selectedAlgorithm?.cons.slice(0, 2).map((c, i) => (
                          <li key={i}>• {c}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <p className="text-xs text-brand-400 dark:text-brand-accent mb-3">
                    <strong>Best for:</strong>{" "}
                    {selectedAlgorithm?.useCases.join(", ")}
                  </p>

                  <a
                    href={selectedAlgorithm?.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-brand-300 dark:text-brand-accent hover:underline"
                  >
                    Read full documentation →
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {step === "framework" && selectedAlgorithm && (
          <div className="space-y-6">
            <div>
              <button
                onClick={() => setStep("algorithm")}
                className="text-xs text-brand-300 dark:text-brand-accent hover:underline mb-3 font-medium"
              >
                ← Back to algorithm selection
              </button>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                Which framework for {selectedAlgorithm.name}?
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                We recommend frameworks that support this algorithm. Pick one
                based on your team size, goal, and deployment target.
              </p>
            </div>

            <FrameworkFlowchart />

            {/* Framework recommendations */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-500 uppercase tracking-wide">
                Best frameworks for {selectedAlgorithm.name}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {compatibleFrameworks.length > 0 ? (
                  compatibleFrameworks.map((fw) => (
                    <button
                      key={fw.id}
                      onClick={() => {
                        setSelectedFrameworkId(fw.id);
                        setStep("summary");
                      }}
                      className={`text-left p-4 rounded-xl border-2 transition-all ${
                        selectedFrameworkId === fw.id
                          ? "border-brand-300 bg-brand-50 dark:bg-brand-500/20"
                          : "border-zinc-200 dark:border-zinc-800 hover:border-brand-200 dark:hover:border-brand-400"
                      }`}
                    >
                      <div className="flex items-start gap-3 mb-2">
                        <span className="text-2xl">{fw.icon}</span>
                        <div>
                          <p className="font-bold text-zinc-900 dark:text-zinc-100">
                            {fw.name}
                          </p>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400">
                            {fw.bestFor}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-zinc-500 dark:text-zinc-400">
                            Learn curve:
                          </span>
                          <span className="font-medium text-zinc-700 dark:text-zinc-300">
                            {fw.learnCurve}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {fw.pros.slice(0, 2).map((pro, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                            >
                              {pro}
                            </span>
                          ))}
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="col-span-2 text-sm text-zinc-500 dark:text-zinc-400">
                    No frameworks found for this algorithm.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {step === "summary" && selectedAlgorithm && selectedFramework && (
          <div className="space-y-6">
            <div>
              <button
                onClick={() => setStep("framework")}
                className="text-xs text-brand-300 dark:text-brand-accent hover:underline mb-3 font-medium"
              >
                ← Back to framework selection
              </button>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                Your Discovery Summary
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Here's your personalized ML stack recommendation.
              </p>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Algorithm card */}
              <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/10 border border-blue-200 dark:border-blue-900/30 p-4">
                <div className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-3">
                  ALGORITHM
                </div>
                <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-2">
                  {selectedAlgorithm.name}
                </h4>
                <p className="text-xs text-blue-800 dark:text-brand-accent mb-3 line-clamp-2">
                  {selectedAlgorithm.useCases[0]}
                </p>
                <a
                  href={selectedAlgorithm.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-brand-300 dark:text-brand-accent hover:underline"
                >
                  Learn more →
                </a>
              </div>

              {/* Framework card */}
              <div className="rounded-xl bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-500/30 dark:to-brand-500/10 border border-brand-200 dark:border-brand-500/30 p-4">
                <div className="text-sm font-semibold text-brand-500 dark:text-brand-200 mb-3">
                  FRAMEWORK
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{selectedFramework.icon}</span>
                  <h4 className="font-bold text-brand-500 dark:text-brand-100">
                    {selectedFramework.name}
                  </h4>
                </div>
                <p className="text-xs text-brand-400 dark:text-brand-accent mb-3">
                  {selectedFramework.bestFor}
                </p>
                <a
                  href={selectedFramework.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-brand-300 dark:text-brand-accent hover:underline"
                >
                  Visit official site →
                </a>
              </div>

              {/* Next steps card */}
              <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-900/10 border border-emerald-200 dark:border-emerald-900/30 p-4">
                <div className="text-sm font-semibold text-emerald-900 dark:text-emerald-300 mb-3">
                  NEXT STEPS
                </div>
                <ol className="text-xs text-emerald-800 dark:text-emerald-400 space-y-1.5">
                  <li>1. Set up your development environment</li>
                  <li>2. Prepare your training dataset</li>
                  <li>3. Implement & train your model</li>
                  <li>4. Evaluate and optimize</li>
                </ol>
              </div>
            </div>

            {/* Detailed info sections */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4">
                <h5 className="font-bold text-zinc-900 dark:text-zinc-100 mb-3">
                  Why this combination?
                </h5>
                <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                  <li className="flex gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400">
                      ✓
                    </span>
                    <span>
                      {selectedFramework.name} supports{" "}
                      {selectedAlgorithm.name.toLowerCase()}
                    </span>
                  </li>
                  {selectedFramework.pros.slice(0, 2).map((pro, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-emerald-600 dark:text-emerald-400">
                        ✓
                      </span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4">
                <h5 className="font-bold text-zinc-900 dark:text-zinc-100 mb-3">
                  Getting started
                </h5>
                <div className="space-y-2 text-xs">
                  <p className="text-zinc-600 dark:text-zinc-400">
                    Install {selectedFramework.name}:
                  </p>
                  <code className="block bg-zinc-100 dark:bg-zinc-800 p-2 rounded text-zinc-700 dark:text-zinc-300 overflow-x-auto">
                    pip install{" "}
                    {selectedFramework.name
                      .toLowerCase()
                      .replace(/[^a-z0-9]/g, "")}
                  </code>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleReset}
                className="px-4 py-2.5 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg font-medium text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
              >
                Start over
              </button>
              <button
                onClick={() => {
                  window.open(selectedFramework.url, "_blank");
                }}
                className="flex-1 px-4 py-2.5 bg-brand-300 hover:bg-brand-400 text-white rounded-lg font-medium text-sm transition-colors"
              >
                Get started with {selectedFramework.name}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          {step === "algorithm" ? (
            <div className="flex-1" />
          ) : (
            <button
              onClick={() => {
                if (step === "framework") {
                  setStep("algorithm");
                } else if (step === "summary") {
                  setStep("framework");
                }
              }}
              className="px-6 py-2.5 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg font-medium text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
            >
              ← Back
            </button>
          )}

          <div className="flex items-center gap-2">
            {step === "algorithm" && !selectedAlgorithmId && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Select an algorithm to continue
              </p>
            )}
            {step === "framework" && !selectedFrameworkId && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Select a framework to continue
              </p>
            )}
          </div>

          {step === "algorithm" ? (
            <button
              onClick={() => {
                if (selectedAlgorithmId) {
                  setStep("framework");
                  setSelectedFrameworkId(null);
                }
              }}
              disabled={!selectedAlgorithmId}
              className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                selectedAlgorithmId
                  ? "bg-brand-300 hover:bg-brand-400 text-white cursor-pointer"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed"
              }`}
            >
              Next: Choose Framework →
            </button>
          ) : step === "framework" ? (
            <button
              onClick={() => {
                if (selectedFrameworkId) {
                  setStep("summary");
                }
              }}
              disabled={!selectedFrameworkId}
              className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                selectedFrameworkId
                  ? "bg-brand-300 hover:bg-brand-400 text-white cursor-pointer"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed"
              }`}
            >
              Next: View Summary →
            </button>
          ) : (
            <button
              onClick={handleReset}
              className="px-6 py-2.5 bg-brand-300 hover:bg-brand-400 text-white rounded-lg font-medium text-sm transition-colors"
            >
              ← Start Over
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
