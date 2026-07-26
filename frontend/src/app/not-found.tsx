import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-6">
      <section className="max-w-md text-center">
        <p className="text-sm font-semibold text-[#ff385c]">404</p>
        <h1 className="mt-3 text-3xl font-semibold">This stay is not available</h1>
        <p className="mt-3 text-neutral-600">The listing may have been removed, or the link may be incorrect.</p>
        <Link href="/" className="mt-6 inline-flex h-12 items-center rounded-xl bg-neutral-950 px-5 font-bold text-white hover:bg-neutral-800">
          Explore homes
        </Link>
      </section>
    </main>
  );
}
