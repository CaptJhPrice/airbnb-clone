"use client";

import { RotateCcw } from "lucide-react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center px-6">
      <section className="max-w-md text-center">
        <p className="text-sm font-semibold text-[#ff385c]">Something interrupted the stay search</p>
        <h1 className="mt-3 text-3xl font-semibold">Let&apos;s try that again</h1>
        <p className="mt-3 text-neutral-600">{error.message || "The page could not load right now."}</p>
        <button
          onClick={reset}
          className="mt-6 inline-flex h-12 items-center gap-2 rounded-xl bg-neutral-950 px-5 font-bold text-white hover:bg-neutral-800"
        >
          <RotateCcw size={18} />
          Retry
        </button>
      </section>
    </main>
  );
}
