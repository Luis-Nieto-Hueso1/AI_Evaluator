/**
 * Skeleton loader component that shows while live models are being fetched.
 * Mimics the structure of ModelCard with shimmer animations.
 */

export function SkeletonModelCard() {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 animate-pulse">
      {/* Header with grade badge and name */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-700" />
        <div className="flex-1">
          <div className="h-5 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4 mb-2" />
          <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2" />
        </div>
      </div>

      {/* Family tag */}
      <div className="h-6 bg-zinc-200 dark:bg-zinc-700 rounded-full w-16 mb-3" />

      {/* Description */}
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-full" />
        <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-5/6" />
      </div>

      {/* Specs grid */}
      <div className="grid grid-cols-2 gap-3 py-3 border-y border-zinc-200 dark:border-zinc-800 mb-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded w-12 mb-1" />
            <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-full" />
          </div>
        ))}
      </div>

      {/* Footer with use cases */}
      <div className="flex gap-2 flex-wrap">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-6 bg-zinc-200 dark:bg-zinc-700 rounded-full w-20"
          />
        ))}
      </div>
    </div>
  );
}
