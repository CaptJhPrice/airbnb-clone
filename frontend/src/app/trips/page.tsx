import { Suspense } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { TripsManager } from "@/components/trips/trips-manager";
import { getBookings, getCategories, getListing } from "@/lib/api";

export default async function TripsPage() {
  const [categories, bookings] = await Promise.all([getCategories(), getBookings(2)]);
  const trips = await Promise.all(
    bookings.map(async (booking) => ({
      ...booking,
      listing: await getListing(booking.listing_id),
    })),
  );

  return (
    <>
      <Suspense>
        <SiteHeader categories={categories} />
      </Suspense>
      <main className="mx-auto min-h-screen max-w-[1180px] px-6 py-10 lg:px-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-normal">Trips</h1>
          <p className="mt-2 max-w-2xl text-neutral-600">
            Review upcoming reservations, revisit past stays, and cancel future trips for the mock guest account.
          </p>
        </div>
        <TripsManager initialTrips={trips} />
      </main>
      <SiteFooter />
    </>
  );
}
