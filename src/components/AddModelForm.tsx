import { useState } from "react";
import type { Model } from "../types";
import {
  parseHfUrl,
  importHfModel,
  saveCustomModel,
  removeCustomModel,
} from "../lib/hf-model-import";

interface Props {
  customModels: Model[];
  onChanged: (models: Model[]) => void;
}

export function AddModelForm({ customModels, onChanged }: Props) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleAdd() {
    const modelId = parseHfUrl(url);
    if (!modelId) {
      setStatus("error");
      setErrorMsg(
        'Invalid URL or model ID. Use "owner/repo" or a full HuggingFace URL.',
      );
      return;
    }

    // Don't import duplicates
    const existingId = `custom-${modelId}`
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-");
    if (customModels.some((m) => m.id === existingId)) {
      setStatus("error");
      setErrorMsg("This model is already in your custom list.");
      return;
    }

    setStatus("loading");
    setErrorMsg("");
    try {
      const model = await importHfModel(modelId);
      saveCustomModel(model);
      const updated = [...customModels, model];
      onChanged(updated);
      setUrl("");
      setStatus("success");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (e) {
      setStatus("error");
      setErrorMsg(e instanceof Error ? e.message : "Failed to import model.");
    }
  }

  function handleRemove(id: string) {
    removeCustomModel(id);
    onChanged(customModels.filter((m) => m.id !== id));
  }

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            + Add model by HF URL
          </span>
          {customModels.length > 0 && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-brand-100 dark:bg-brand-500/30 text-brand-400 dark:text-brand-accent font-semibold">
              {customModels.length}
            </span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`}
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
        <div className="px-4 pb-4 border-t border-zinc-100 dark:border-zinc-800 pt-3 space-y-3">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Paste any HuggingFace model URL or{" "}
            <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">
              owner/repo
            </code>{" "}
            — we'll fetch the card and estimate RAM/VRAM automatically.
          </p>

          {/* Input row */}
          <div className="flex gap-2">
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (status === "error") setStatus("idle");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="e.g. mistralai/Mistral-7B-Instruct-v0.3"
              aria-label="HuggingFace model URL or ID"
              disabled={status === "loading"}
              className="flex-1 text-xs px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
            />
            <button
              onClick={handleAdd}
              disabled={status === "loading" || !url.trim()}
              className="shrink-0 text-xs px-3 py-2 rounded-xl bg-brand-300 text-white font-medium hover:bg-brand-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {status === "loading" ? (
                <span className="flex items-center gap-1.5">
                  <svg
                    className="w-3 h-3 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                    />
                  </svg>
                  Fetching…
                </span>
              ) : status === "success" ? (
                "Added ✓"
              ) : (
                "Add"
              )}
            </button>
          </div>

          {/* Error */}
          {status === "error" && (
            <p className="text-xs text-red-500 dark:text-red-400">{errorMsg}</p>
          )}

          {/* Custom model list */}
          {customModels.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                Custom models
              </p>
              {customModels.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">
                      {m.name}
                    </p>
                    <p className="text-xs text-zinc-400 truncate">
                      {m.parameters}B · {m.family}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemove(m.id)}
                    title="Remove"
                    aria-label={`Remove ${m.name}`}
                    className="shrink-0 p-1 text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
