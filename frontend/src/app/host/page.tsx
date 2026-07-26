import { Suspense } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { HostDashboard } from "@/components/host/host-dashboard";
import { getCategories } from "@/lib/api";

export default async function HostPage() {
  const categories = await getCategories();

  return (
    <>
      <Suspense>
        <SiteHeader categories={categories} />
      </Suspense>
      <main className="mx-auto min-h-screen max-w-[1280px] px-6 py-10 lg:px-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-normal">Host dashboard</h1>
          <p className="mt-2 max-w-2xl text-neutral-600">
            Manage homes, pricing, photos, and availability-ready details for the mock host account.
          </p>
        </div>
        <HostDashboard categories={categories} />
      </main>
      <SiteFooter />
    </>
  );
}
