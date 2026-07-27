export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-50">
      <div className="mx-auto grid max-w-[1760px] gap-8 px-6 py-10 text-sm text-neutral-700 md:grid-cols-3 lg:px-10">
        <div>
          <h2 className="mb-3 font-bold text-neutral-950">Support</h2>
          <p>Help Centre</p>
          <p>Cancellation options</p>
          <p>Safety information</p>
        </div>
        <div>
          <h2 className="mb-3 font-bold text-neutral-950">Hosting</h2>
          <p>Airbnb your home</p>
          <p>Hosting resources</p>
          <p>Community forum</p>
        </div>
        <div>
          <h2 className="mb-3 font-bold text-neutral-950 dark:text-white">Airbnb</h2>
          <p>Newsroom</p>
          <p>Careers</p>
          <p>Privacy and terms</p>
        </div>
      </div>
      <div className="border-t border-neutral-200 dark:border-slate-800 px-6 py-5 text-sm text-neutral-600 dark:text-slate-400 lg:px-10">
        <div className="mx-auto flex max-w-[1760px] flex-wrap items-center justify-between gap-3">
          <span>© 2026 Airbnb, Inc.</span>
          <span>English (IN) · ₹ INR</span>
        </div>
      </div>
    </footer>
  );
}
