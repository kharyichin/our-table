export function RouteLoading({ label = "Opening this chapter" }: { label?: string }) {
  return (
    <div
      className="mx-auto w-full max-w-5xl animate-pulse px-4 py-8 lg:px-10 lg:py-12"
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">{label}</span>
      <div className="mb-10 max-w-xl">
        <div className="h-3 w-32 rounded-full bg-tomato/15" />
        <div className="mt-4 h-11 w-3/4 rounded-2xl bg-ink/10" />
        <div className="mt-3 h-4 w-full rounded-full bg-ink/10" />
        <div className="mt-2 h-4 w-2/3 rounded-full bg-ink/10" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="paper-card min-h-52 p-6">
          <div className="h-5 w-2/5 rounded-full bg-ink/10" />
          <div className="mt-7 space-y-4">
            <div className="h-4 rounded-full bg-ink/10" />
            <div className="h-4 w-5/6 rounded-full bg-ink/10" />
            <div className="h-4 w-3/5 rounded-full bg-ink/10" />
          </div>
        </div>
        <div className="paper-card min-h-52 p-6">
          <div className="h-5 w-1/3 rounded-full bg-ink/10" />
          <div className="mt-7 space-y-4">
            <div className="h-4 rounded-full bg-ink/10" />
            <div className="h-4 w-4/5 rounded-full bg-ink/10" />
            <div className="h-4 w-2/3 rounded-full bg-ink/10" />
          </div>
        </div>
      </div>
    </div>
  );
}
