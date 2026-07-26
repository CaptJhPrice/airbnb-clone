export default function ListingLoading() {
  return (
    <main className="mx-auto max-w-[1180px] px-6 py-8 lg:px-10">
      <div className="mb-5 h-8 w-24 animate-pulse rounded bg-neutral-100" />
      <div className="mb-5 h-10 w-3/4 animate-pulse rounded bg-neutral-100" />
      <div className="h-[420px] animate-pulse rounded-2xl bg-neutral-100" />
      <div className="grid gap-12 py-10 lg:grid-cols-[1fr_372px]">
        <div className="space-y-4">
          <div className="h-8 w-2/3 animate-pulse rounded bg-neutral-100" />
          <div className="h-5 w-1/2 animate-pulse rounded bg-neutral-100" />
          <div className="h-32 animate-pulse rounded bg-neutral-100" />
        </div>
        <div className="h-96 animate-pulse rounded-2xl bg-neutral-100" />
      </div>
    </main>
  );
}
