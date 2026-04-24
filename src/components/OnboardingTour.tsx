import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "llm-eval-tour-done";

interface Step {
  target: string;
  title: string;
  body: string;
  position: "bottom" | "top" | "right" | "left";
}

const STEPS: Step[] = [
  {
    target: "[data-tour='hardware-form']",
    title: "Configure Your Hardware",
    body: "Start here — enter your RAM, GPU, and system specs to see which LLMs can run on your machine.",
    position: "bottom",
  },
  {
    target: "[data-tour='grade-badges']",
    title: "Performance Grades",
    body: "Each model gets an S–F grade based on how well it fits your hardware. Green = great, red = tight fit.",
    position: "bottom",
  },
  {
    target: "[data-tour='detail-panel']",
    title: "Model Details",
    body: "Click any model card to expand it and see quantization variants, VRAM usage, and speed estimates.",
    position: "left",
  },
  {
    target: "[data-tour='advisor-chat']",
    title: "AI Advisor",
    body: "Ask the AI advisor for personalized recommendations based on your use case — it knows your hardware config.",
    position: "top",
  },
];

export function OnboardingTour() {
  const [step, setStep] = useState(-1);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const isDone = localStorage.getItem(STORAGE_KEY) === "1";

  useEffect(() => {
    if (isDone) return;
    const timer = setTimeout(() => setStep(0), 800);
    return () => clearTimeout(timer);
  }, [isDone]);

  const updateRect = useCallback(() => {
    if (step < 0 || step >= STEPS.length) return;
    const el = document.querySelector(STEPS[step].target);
    if (el) {
      setRect(el.getBoundingClientRect());
    } else {
      setRect(null);
    }
  }, [step]);

  useEffect(() => {
    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [updateRect]);

  function next() {
    if (step + 1 >= STEPS.length) {
      dismiss();
    } else {
      setStep(step + 1);
    }
  }

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setStep(-1);
  }

  if (step < 0 || step >= STEPS.length || isDone) return null;

  const current = STEPS[step];

  const tooltipStyle: React.CSSProperties = {};
  if (rect) {
    const gap = 12;
    switch (current.position) {
      case "bottom":
        tooltipStyle.top = rect.bottom + gap;
        tooltipStyle.left = rect.left + rect.width / 2;
        tooltipStyle.transform = "translateX(-50%)";
        break;
      case "top":
        tooltipStyle.bottom = window.innerHeight - rect.top + gap;
        tooltipStyle.left = rect.left + rect.width / 2;
        tooltipStyle.transform = "translateX(-50%)";
        break;
      case "right":
        tooltipStyle.top = rect.top + rect.height / 2;
        tooltipStyle.left = rect.right + gap;
        tooltipStyle.transform = "translateY(-50%)";
        break;
      case "left":
        tooltipStyle.top = rect.top + rect.height / 2;
        tooltipStyle.right = window.innerWidth - rect.left + gap;
        tooltipStyle.transform = "translateY(-50%)";
        break;
    }
  } else {
    tooltipStyle.top = "50%";
    tooltipStyle.left = "50%";
    tooltipStyle.transform = "translate(-50%, -50%)";
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[9998]"
        style={{ background: "rgba(0,0,0,0.35)" }}
        onClick={dismiss}
      />

      {/* Spotlight cutout */}
      {rect && (
        <div
          className="fixed z-[9999] rounded-xl pointer-events-none"
          style={{
            top: rect.top - 6,
            left: rect.left - 6,
            width: rect.width + 12,
            height: rect.height + 12,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.35)",
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className="fixed z-[10000] w-72 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-2xl p-4"
        style={tooltipStyle}
      >
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
          {current.title}
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-3">
          {current.body}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full ${
                  i === step
                    ? "bg-brand-500"
                    : i < step
                      ? "bg-brand-200 dark:bg-brand-400"
                      : "bg-zinc-200 dark:bg-zinc-700"
                }`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={dismiss}
              className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            >
              Skip
            </button>
            <button
              onClick={next}
              className="text-xs px-3 py-1 bg-brand-300 hover:bg-brand-400 text-white rounded-lg transition-colors cursor-pointer font-medium"
            >
              {step + 1 >= STEPS.length ? "Done" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
