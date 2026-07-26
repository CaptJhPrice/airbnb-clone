import { Suspense } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { FilterBar } from "@/components/listings/filter-bar";
import { HomeListingView } from "@/components/listings/HomeListingView";
import { getCategories, getListings } from "@/lib/api";
import type { ListingFilters } from "@/lib/types";

type HomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function Home({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const filters: ListingFilters = {
    location: firstParam(params.location),
    category_id: firstParam(params.category_id) ? Number(firstParam(params.category_id)) : undefined,
    min_guests: firstParam(params.min_guests) ? Number(firstParam(params.min_guests)) : undefined,
    min_price: firstParam(params.min_price) ? Number(firstParam(params.min_price)) : undefined,
    max_price: firstParam(params.max_price) ? Number(firstParam(params.max_price)) : undefined,
    property_type: firstParam(params.property_type),
    amenity_ids: firstParam(params.amenity_ids),
    min_rating: firstParam(params.min_rating) ? Number(firstParam(params.min_rating)) : undefined,
    sort_by: firstParam(params.sort_by),
  };

  const [categories, listings] = await Promise.all([getCategories(), getListings(filters)]);

  return (
    <>
      <Suspense>
        <SiteHeader categories={categories} />
      </Suspense>
      <main className="mx-auto min-h-screen max-w-[1760px] px-6 py-8 lg:px-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-normal text-neutral-950 md:text-3xl">
              Homes guests love
            </h1>
            <p className="mt-2 text-neutral-600">
              Explore stays with real API data, responsive cards, interactive map view, filters, and booking-ready detail pages.
            </p>
          </div>
          <div className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold shadow-sm bg-neutral-50">
            Display total before taxes
          </div>
        </div>
        <Suspense>
          <FilterBar filters={filters} resultCount={listings.length} />
        </Suspense>
        <HomeListingView listings={listings} />
      </main>
      <SiteFooter />
    </>
  );
}
