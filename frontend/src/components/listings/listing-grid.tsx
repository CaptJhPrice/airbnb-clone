import type { Listing } from "@/lib/types";
import { ListingCard } from "@/components/listings/listing-card";

export function ListingGrid({ listings }: { listings: Listing[] }) {
  if (!listings.length) {
    return (
      <div className="mx-auto max-w-lg py-24 text-center">
        <h2 className="text-2xl font-semibold text-neutral-950">No exact matches</h2>
        <p className="mt-3 text-neutral-600">Try changing the destination, guests, or category filters.</p>
      </div>
    );
  }

  return (
    <section className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </section>
  );
}
