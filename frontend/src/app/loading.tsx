export default function Loading() {
  return (
    <main className="mx-auto min-h-screen max-w-[1760px] px-6 py-8 lg:px-10">
      <div className="mb-8 h-40 animate-pulse rounded-3xl bg-neutral-100" />
      <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, index) => (
          <div key={index}>
            <div className="aspect-square animate-pulse rounded-xl bg-neutral-100" />
            <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-neutral-100" />
            <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-neutral-100" />
            <div className="mt-2 h-4 w-1/3 animate-pulse rounded bg-neutral-100" />
          </div>
        ))}
      </div>
    </main>
  );
}
